import asyncio
import json
import os
import base64

import websockets
import websockets.asyncio.server

from google import genai
from google.genai import types

from env_loader import load_env, require_keys

# Optional: clear proxy env vars
def _clear_proxies():
    for key in [
        'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY',
        'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy',
    ]:
        os.environ.pop(key, None)

if os.getenv("CLEAR_PROXY") == "1":
    _clear_proxies()

# Load .env and validate required keys
load_env()
require_keys(["GOOGLE_API_KEY"])

# Model configuration
MODEL = "gemini-3.1-flash-live-preview"

# Live API client
client = genai.Client(
  http_options={
    'api_version': 'v1beta',
  }
)

async def gemini_session_handler(websocket: websockets.asyncio.server.ServerConnection):
    print("Starting Gemini session")
    current_response_text = ""
    transcript_finalized = False
    first_chunk_seen = False

    try:
        config_message = await websocket.recv()

        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Puck")
                ),
                language_code='es-419',
            ),
            system_instruction="""You are a helpful, bilingual AI assistant for screen sharing. You understand both English and Spanish. ALWAYS respond in the SAME language the user uses. If the user speaks Spanish, you MUST respond in Spanish. If the user speaks English, you MUST respond in English. Keep sentences short and spoken-friendly.

Eres un asistente de IA bilingüe y servicial para compartir pantalla. Entiendes tanto inglés como español. SIEMPRE responde en el MISMO idioma que use el usuario. Si el usuario habla español, DEBES responder en español. Si el usuario habla inglés, DEBES responder en inglés. Mantén las frases cortas y fáciles de entender.""",
            output_audio_transcription=types.AudioTranscriptionConfig(),
            input_audio_transcription=types.AudioTranscriptionConfig(),
        )

        async with client.aio.live.connect(model=MODEL, config=config) as session:
            print("Connected to Gemini API")

            async def send_to_gemini():
                nonlocal current_response_text, transcript_finalized, first_chunk_seen
                try:
                    async for message in websocket:
                        try:
                            data = json.loads(message)

                            if transcript_finalized:
                                current_response_text = ""
                                transcript_finalized = False
                                first_chunk_seen = False

                            if "audio" in data:
                                audio_data = base64.b64decode(data["audio"])
                                await session.send_realtime_input(
                                    audio=types.Blob(data=audio_data, mime_type='audio/pcm;rate=16000')
                                )

                            if "video" in data:
                                video_data = base64.b64decode(data["video"])
                                await session.send_realtime_input(
                                    video=types.Blob(data=video_data, mime_type='image/jpeg')
                                )

                            if "text" in data:
                                text_content = data["text"]
                                current_response_text = ""
                                transcript_finalized = False
                                await session.send_client_content(
                                    turns={"role": "user", "parts": [{"text": text_content}]},
                                    turn_complete=True
                                )
                        except Exception as e:
                            print(f"Error sending to Gemini: {e}")
                    print("Client connection closed (send)")
                except Exception as e:
                    print(f"Error sending to Gemini: {e}")
                finally:
                    print("send_to_gemini closed")

            async def receive_from_gemini():
                nonlocal current_response_text, transcript_finalized, first_chunk_seen
                try:
                    while True:
                        try:
                            async for response in session.receive():
                                if response.server_content and hasattr(response.server_content, 'interrupted') and response.server_content.interrupted is not None:
                                    await websocket.send(json.dumps({"interrupted": "True"}))
                                    continue

                                if response.server_content and hasattr(response.server_content, 'output_transcription') and response.server_content.output_transcription is not None:
                                    transcription_text = response.server_content.output_transcription.text

                                    if transcript_finalized:
                                        await websocket.send(json.dumps({
                                            "transcription": {
                                                "text": transcription_text,
                                                "sender": "Gemini",
                                                "finished": response.server_content.output_transcription.finished
                                            }
                                        }))
                                        continue

                                    if transcription_text:
                                        current_response_text += transcription_text

                                    finished = response.server_content.output_transcription.finished

                                    if (not transcript_finalized and finished):
                                        transcript_finalized = True

                                    await websocket.send(json.dumps({
                                        "transcription": {
                                            "text": transcription_text,
                                            "sender": "Gemini",
                                            "finished": finished
                                        }
                                    }))

                                if response.server_content and hasattr(response.server_content, 'input_transcription') and response.server_content.input_transcription is not None:
                                    user_text = response.server_content.input_transcription.text
                                    finished = response.server_content.input_transcription.finished

                                    await websocket.send(json.dumps({
                                        "transcription": {
                                            "text": user_text,
                                            "sender": "User",
                                            "finished": finished
                                        }
                                    }))

                                if response.server_content is None:
                                    continue

                                model_turn = response.server_content.model_turn
                                if model_turn:
                                    for part in model_turn.parts:
                                        if hasattr(part, 'text') and part.text is not None:
                                            if part.text and not transcript_finalized:
                                                current_response_text += part.text
                                            await websocket.send(json.dumps({"text": part.text}))

                                        elif hasattr(part, 'inline_data') and part.inline_data is not None:
                                            try:
                                                audio_data = part.inline_data.data
                                                base64_audio = base64.b64encode(audio_data).decode('utf-8')
                                                await websocket.send(json.dumps({
                                                    "audio": base64_audio,
                                                }))
                                            except Exception as e:
                                                print(f"Error processing assistant audio: {e}")

                                # When turn is complete
                                if response.server_content and response.server_content.turn_complete:
                                    await websocket.send(json.dumps({
                                        "transcription": {
                                            "text": "",
                                            "sender": "Gemini",
                                            "finished": True
                                        }
                                    }))

                                    transcript_finalized = False
                                    first_chunk_seen = False

                        except websockets.exceptions.ConnectionClosedOK:
                            print("Client connection closed normally (receive)")
                            break
                        except Exception as e:
                            print(f"Error receiving from Gemini: {e}")
                            break

                except Exception as e:
                    print(f"Error receiving from Gemini: {e}")
                finally:
                    print("Gemini connection closed (receive)")

            send_task = asyncio.create_task(send_to_gemini())
            receive_task = asyncio.create_task(receive_from_gemini())
            await asyncio.gather(send_task, receive_task)

    except Exception as e:
        print(f"Error in Gemini session: {e}")
    finally:
        print("Gemini session closed.")

async def main() -> None:
    async with websockets.serve(
        gemini_session_handler,
        host="0.0.0.0",
        port=9090,
        compression=None
    ) as server:
        print("Running websocket server on 0.0.0.0:9090...")
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())
