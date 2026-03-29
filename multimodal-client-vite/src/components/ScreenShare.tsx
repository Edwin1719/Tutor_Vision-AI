import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useWebSocket } from "./WebSocketProvider";
import { Base64 } from 'js-base64';
import { Camera, Monitor, Video, Palette } from "lucide-react";
import { useWhiteboard } from "../hooks/useWhiteboard";
import { WhiteboardToolbar } from "./WhiteboardToolbar";

type ShareMode = "screen" | "camera" | null;

const ScreenShare: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const [shareMode, setShareMode] = useState<ShareMode>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const { sendMessage, sendMediaChunk, isConnected, playbackAudioLevel, connect } = useWebSocket();
  const captureIntervalRef = useRef<NodeJS.Timeout>();
  
  // Whiteboard hook
  const whiteboard = useWhiteboard();

  // Handle connection state changes
  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected]);

  // Resize whiteboard canvas when container changes
  useEffect(() => {
    if (!containerRef.current || !whiteboard.isEnabled) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        whiteboard.resizeCanvas(entry.contentRect.width, entry.contentRect.height);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [whiteboard.isEnabled, whiteboard.resizeCanvas]);

  const handleConnect = () => {
    if (isConnected) return;

    setIsConnecting(true);
    connect();
  };

  const startSharing = async (mode: ShareMode) => {
    if (isSharing || !isConnected) return;

    try {
      let videoStream: MediaStream | null = null;

      if (mode === "screen") {
        // Get screen stream
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
      } else if (mode === "camera") {
        // Get camera stream
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        });
      }

      if (!videoStream) throw new Error("No video stream available");

      videoStreamRef.current = videoStream;

      // Get audio stream
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });

      // Set up audio context and processing
      audioContextRef.current = new AudioContext({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });

      const ctx = audioContextRef.current;
      await ctx.audioWorklet.addModule('/worklets/audio-processor.js');

      const source = ctx.createMediaStreamSource(audioStream);
      audioWorkletNodeRef.current = new AudioWorkletNode(ctx, 'audio-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        processorOptions: {
          sampleRate: 16000,
          bufferSize: 4096,
        },
        channelCount: 1,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers'
      });

      // Set up audio processing
      audioWorkletNodeRef.current.port.onmessage = (event) => {
        const { pcmData, level } = event.data;
        setAudioLevel(level);

        if (pcmData) {
          const base64Data = Base64.fromUint8Array(new Uint8Array(pcmData));
          sendMediaChunk({
            mime_type: "audio/pcm",
            data: base64Data
          });
        }
      };

      source.connect(audioWorkletNodeRef.current);
      audioStreamRef.current = audioStream;

      // Set up video stream and capture
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;

        // Start video capture interval (send frames every 2 seconds for camera, 3 for screen)
        const captureInterval = mode === "camera" ? 2000 : 3000;
        captureIntervalRef.current = setInterval(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0);
              const imageData = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];

              sendMediaChunk({
                mime_type: "image/jpeg",
                data: imageData
              });
            }
          }
        }, captureInterval);
      }

      // Send initial setup message
      sendMessage({
        setup: {}
      });

      setShareMode(mode);
      setIsSharing(true);
    } catch (err) {
      console.error('Failed to start sharing:', err);
      stopSharing();
    }
  };

  const stopSharing = () => {
    // Stop video stream
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    // Stop capture interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = undefined;
    }

    // Clean up audio processing
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setShareMode(null);
    setIsSharing(false);
    setAudioLevel(0);
  };

  return (
    <Card className="w-full h-full bg-white/10 backdrop-blur-sm border-white/20 flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {shareMode === "camera" ? <Camera className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            {shareMode === "camera" ? "Camera Share" : shareMode === "screen" ? "Screen Share" : "Share Mode"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {shareMode && (
              <span className="text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded-full flex items-center gap-1">
                <Video className="w-3 h-3" />
                Live
              </span>
            )}
            {isSharing && (
              <Button
                size="sm"
                variant={whiteboard.isEnabled ? "secondary" : "outline"}
                className={`h-8 ${whiteboard.isEnabled ? "bg-white text-black" : "border-white text-white hover:bg-white/20"}`}
                onClick={whiteboard.toggleWhiteboard}
              >
                <Palette className="w-4 h-4" />
                {whiteboard.isEnabled ? "Drawing" : "Whiteboard"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4">
          <div ref={containerRef} className="relative w-full h-full flex flex-col items-center">
          {/* Video Container with relative positioning for overlays */}
          <div className="relative w-full flex-1 min-h-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain rounded-md border border-white/20 bg-black/40"
            />
            
            {/* Whiteboard Canvas Overlay */}
            {whiteboard.isEnabled && (
              <canvas
                ref={whiteboard.canvasRef}
                className="absolute inset-0 w-full h-full touch-none"
                onPointerDown={whiteboard.handlePointerDown}
                onPointerMove={whiteboard.handlePointerMove}
                onPointerUp={whiteboard.handlePointerUp}
                onPointerLeave={whiteboard.handlePointerUp}
              />
            )}

            {/* Whiteboard Toolbar */}
            {whiteboard.isEnabled && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
                <WhiteboardToolbar
                  currentTool={whiteboard.currentTool}
                  currentColor={whiteboard.currentColor}
                  onToolChange={whiteboard.setTool}
                  onColorChange={whiteboard.setColor}
                  onClear={whiteboard.clearAnnotations}
                  onClose={whiteboard.toggleWhiteboard}
                />
              </div>
            )}
          </div>
          
            {/* Controls at the bottom */}
            <div className="w-full flex-shrink-0 space-y-3 mt-4">
              {/* Audio Level Indicator */}
              {isSharing && (
                <div className="w-full">
                  <Progress
                    value={Math.max(audioLevel, playbackAudioLevel)}
                    className="h-1 bg-white/20"
                    indicatorClassName="bg-white"
                  />
                </div>
              )}

              {/* Mode Selection Buttons */}
              {!isConnected ? (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={isConnecting ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white"}
                  >
                    {isConnecting ? "Connecting..." : "Connect to Server"}
                  </Button>
                </div>
              ) : !isSharing ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    onClick={() => startSharing("screen")}
                    className="bg-white text-black hover:bg-gray-200 flex items-center gap-2"
                  >
                    <Monitor className="w-5 h-5" />
                    Screen Share
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => startSharing("camera")}
                    className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Camera Share
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button size="lg" variant="destructive" onClick={stopSharing} className="bg-red-500 hover:bg-red-600 text-white">
                    Stop {shareMode === "camera" ? "Camera" : "Screen"} Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default ScreenShare;