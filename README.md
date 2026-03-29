# Asistente de Pantalla Compartida con IA - Gemini Assistant 

![Demostración de la aplicación](https://raw.githubusercontent.com/Edwin1719/Screen_Share_Assistant/main/public/App.gif)

Un asistente de inteligencia artificial en tiempo real que te permite interactuar por voz con modelos de Gemini y compartir tu pantalla o cámara. La aplicación está diseñada para ser una herramienta de asistencia bilingüe (inglés y español) con pizarra interactiva para anotaciones manuales.

![texto del vínculo](https://www.interactions.com/wp-content/uploads/2018/10/pure_vs_pragmatic_ai_2000x500.jpg)

## ✨ Características Principales

### 🎙️ Interacción por Voz en Tiempo Real
-   Comunícate con Gemini a través de voz y recibe respuestas de audio de baja latencia
-   Captura de audio en 16kHz mono PCM con procesamiento AudioWorklet
-   Reproducción de respuestas de IA en 24kHz con cola de audio suave
-   Detección automática del idioma (inglés/español) y respuesta en el mismo idioma

### 🖥️ Compartir Pantalla y Cámara
-   **Screen Share:** Captura de pantalla completa usando `getDisplayMedia()`
-   **Camera Share:** Captura de webcam usando `getUserMedia()` con configuración 1280x720 a 30fps
-   Envío de frames de video cada 2-3 segundos como JPEG comprimido
-   Visualización en tiempo real con indicador de nivel de audio

### 🎨 Pizarra Interactiva (Whiteboard)
-   **Herramientas de dibujo manual:**
    -   ✏️ **Lápiz:** Dibujo libre con trazo fino
    -   🖍️ **Resaltador:** Dibujo semitransparente para resaltar áreas
    -   ⭕ **Círculo:** Dibujo de círculos perfectos
    -   ⬜ **Rectángulo:** Dibujo de rectángulos
    -   ➡️ **Flecha:** Flechas con punta automática
    -   📝 **Texto:** Inserción de etiquetas de texto
    -   🧹 **Borrador:** Elimina anotaciones manualmente
-   **Paleta de 8 colores:** Rojo, Verde, Azul, Amarillo, Naranja, Morado, Negro, Blanco
-   **Limpiar todo:** Elimina todas las anotaciones de una vez
-   **Canvas overlay:** Las anotaciones se dibujan sobre el video compartido

### 📝 Transcripción en Tiempo Real
-   Visualización de la conversación completa Usuario ↔ Gemini
-   Transcripción de entrada (usuario) y salida (asistente)
-   Indicador de estado de streaming (en progreso vs. finalizado)
-   Desplazamiento automático hacia el último mensaje
-   Código de colores: Usuario (verde), Gemini (azul)

### 🔌 Arquitectura Basada en WebSockets
-   Comunicación bidireccional de baja latencia (puerto 9090)
-   Protocolo de mensajes JSON con soporte para datos binarios en base64
-   Reconexión automática en caso de pérdida de conexión
-   Manejo de interrupciones de audio

### 🎨 Interfaz de Usuario Moderna
-   Desarrollada con React 18, TypeScript y Vite
-   Estilos con Tailwind CSS y componentes shadcn/ui + Radix UI
-   Diseño responsivo con layout adaptable
-   Fondo animado con efecto gradiente
-   Iconos de Lucide React

## 🏛️ Arquitectura del Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (React + TypeScript)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ ScreenShare │  │  Transcript  │  │  Whiteboard/Canvas  │   │
│  │  Component  │  │    Panel     │  │  (Anotaciones Man.) │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘   │
│         └────────────────┼──────────────────────┘              │
│              ┌───────────▼───────────┐                         │
│              │  WebSocketProvider    │                         │
│              │  (ws://localhost:9090)│                         │
│              └───────────┬───────────┘                         │
└──────────────────────────┼────────────────────────────────────┘
                           │ WebSocket (JSON + base64)
                           │
┌──────────────────────────▼────────────────────────────────────┐
│                         BACKEND                               │
│                    (Python + websockets)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              main.py (Servidor WebSocket)               │ │
│  │  - Puerto: 9090                                         │ │
│  │  - Gemini Live API integration                          │ │
│  │  - Streaming de Audio/Video                             │ │
│  │  - Transcripción en tiempo real                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          │                                    │
│                  ┌───────▼───────┐                            │
│                  │   Gemini      │                            │
│                  │  Live API     │                            │
│                  │  (Voz)        │                            │
│                  │  gemini-3.1   │                            │
│                  │  -flash-live  │                            │
│                  └───────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Comunicación

**Cliente → Servidor:**
```json
{"audio": "<base64_pcm_16kHz>"}
{"video": "<base64_jpeg>", "mime_type": "image/jpeg"}
{"text": "mensaje de texto"}
```

**Servidor → Cliente:**
```json
{"audio": "<base64_pcm_24kHz>"}
{"transcription": {"text": "...", "sender": "Gemini", "finished": true}}
{"text": "respuesta en texto"}
```

## 🛠️ Tecnologías Utilizadas

### Backend (Python)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| `websockets` | 15.0.1 | Servidor WebSocket para comunicación en tiempo real |
| `google-genai` | 1.3.5 | SDK de Google Gemini AI |
| `python-dotenv` | - | Gestión de variables de entorno |
| `asyncio` | - | I/O asíncrono para manejo concurrente |

**Modelos de IA:**
-   **`gemini-3.1-flash-live-preview`** - Interacción por voz en tiempo real con transcripción bidireccional

### Frontend (React + TypeScript)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.2 | Framework de UI |
| **TypeScript** | 5.0 | Tipado estático |
| **Vite** | 4.4 | Build tool y dev server |
| **Tailwind CSS** | 3.3 | Estilos utilitarios |
| **shadcn/ui** | - | Componentes accesibles |
| **Radix UI** | - | Primitivos de UI (avatar, dialog, progress, scroll-area) |
| **Web Audio API** | - | Captura y reproducción de audio |
| **AudioWorklet** | - | Procesamiento de audio de baja latencia |
| **Canvas API** | - | Renderizado de pizarra y anotaciones |
| **js-base64** | 3.7.7 | Codificación/decodificación base64 |
| **Lucide React** | 0.475 | Iconos |

## 🚀 Casos de Uso y Direcciones Estratégicas

Este proyecto está diseñado para ser una plataforma flexible de asistencia por IA en tiempo real. Estas son las **3 direcciones principales** donde su arquitectura brilla con mayor potencial:

---

### 📚 **1. Tutoría Educativa 1-a-1 (E-Learning)**

**La dirección más alineada con la arquitectura actual.**

| Capacidad Técnica | Beneficio Educativo |
|-------------------|---------------------|
| 🎙️ Voz bidireccional | Explicaciones naturales como clase presencial |
| 🖥️ Screen sharing | Mostrar ejercicios, presentaciones, código |
| 🎨 Pizarra manual | Resolver ecuaciones, diagramas, anotaciones |
| 📝 Transcripción | Apuntes automáticos para repaso |
| 🌐 Bilingüe | Clases de idiomas o estudiantes internacionales |

**Potencial:**
- **Mercado:** Academias online, tutores independientes, plataformas como Preply o iTalki
- **Diferenciador:** IA que **ve** lo que el estudiante muestra + transcripción automática
- **Próximos features:** Guardar sesiones, exportar apuntes a PDF, pizarra colaborativa

---

### 🛠️ **2. Soporte Técnico Remoto (IT Helpdesk)**

**Asistencia técnica con IA que guía en tiempo real.**

| Capacidad Técnica | Beneficio Soporte |
|-------------------|-------------------|
| 🖥️ Screen sharing | Ver el problema del usuario en vivo |
| 🎙️ Voz + IA | Guiar sin escribir (manos libres) |
| 🎨 Anotaciones | Señalar botones, menús, campos específicos |
| 📝 Transcripción | Documentación automática del ticket |

**Potencial:**
- **Mercado:** Empresas de software, SaaS, departamentos IT corporativos
- **Diferenciador:** IA que **asiste al técnico** con sugerencias y documentación
- **Próximos features:** Integración con Zendesk/Jira, base de conocimiento, grabación de sesiones

---

### ♿ **3. Herramienta de Accesibilidad (Disability Assistance)**

**Alto impacto social para usuarios con discapacidades.**

| Capacidad Técnica | Beneficio Accesibilidad |
|-------------------|-------------------------|
| 🎙️ Control por voz | Usuarios con movilidad reducida |
| 📝 Transcripción en vivo | Personas con discapacidad auditiva |
| 🖥️ Screen + IA | Asistente que "ve" y describe la pantalla |
| 🎨 Anotaciones | Resaltar elementos importantes visualmente |

**Potencial:**
- **Mercado:** Empresas (cumplimiento ADA), gobiernos, ONGs, usuarios individuales
- **Diferenciador:** Voice-first + visión computacional + bajo costo
- **Próximos features:** Comandos de voz para navegación, texto a voz, atajos personalizables

---

### 📊 Comparación Rápida

| Dirección | Alineación Técnica | Mercado | Competencia | Impacto |
|-----------|-------------------|---------|-------------|---------|
| 📚 Educación | ⭐⭐⭐⭐⭐ | Grande | Media | Alto |
| 🛠️ Soporte IT | ⭐⭐⭐⭐ | Grande | Alta | Medio |
| ♿ Accesibilidad | ⭐⭐⭐⭐ | Mediano | Baja | Muy Alto |

> 💡 **Recomendación:** Comienza con **Educación** - requiere mínimos cambios adicionales y tiene validación rápida con tutores y alumnos existentes.

## 🏁 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

-   **Python 3.10** o superior
-   **Node.js v16+** y npm
-   **Clave de API de Google Gemini** (obligatoria)

### Instalación y Configuración

#### 1. Clona el repositorio
```bash
git clone https://github.com/Edwin1719/gemini_nanobanana.git
cd gemini_nanobanana
```

#### 2. Configura el Backend

**Crea y activa un entorno virtual (recomendado):**
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python -m venv .venv
source .venv/bin/activate
```

**Instala las dependencias de Python:**
```bash
pip install -r requirements.txt
```

**Configura tus claves de API:**
```bash
# Copia el archivo de ejemplo
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac
```

**Edita `.env` y añade tus claves:**
```env
# Requerido: Clave de API de Google Gemini
# Obtén la tuya en: https://makersuite.google.com/
GOOGLE_API_KEY=tu_google_api_key_aqui

# Opcional: Para limpiar variables de entorno de proxy
CLEAR_PROXY=1
```

#### 3. Configura el Frontend

**Navega al directorio del cliente:**
```bash
cd multimodal-client-vite
```

**Instala las dependencias de Node.js:**
```bash
npm install
```

### Uso

#### Opción 1: Inicio Rápido (Recomendado) 🚀

**Inicia Backend y Frontend simultáneamente en una sola terminal:**

```bash
python start.py
```

Este script:
- ✅ Inicia el backend (`python main.py`) en una ventana separada
- ✅ Inicia el frontend (`npm run dev`) en tu terminal actual
- ✅ Muestra los logs de ambos servicios
- ✅ URLs: **Frontend** `http://localhost:5173` | **Backend** `ws://localhost:9090`

> **Nota:** El backend se abrirá en una nueva ventana. Usa Ctrl+C en tu terminal actual para detener el frontend.

---

#### Opción 2: Inicio Manual (Terminales Separadas)

**1. Inicia el servidor de Backend**

En una terminal (con el entorno virtual activado):
```bash
python main.py
```

Verás el mensaje:
```
Running websocket server on 0.0.0.0:9090...
```

**2. Inicia la aplicación Frontend**

En una **nueva terminal**, desde el directorio `multimodal-client-vite`:
```bash
npm run dev
```

La aplicación estará disponible en: **`http://localhost:5173`**

---

#### 3. Comienza a usar la aplicación

1.  **Conéctate al servidor:** Haz clic en "Connect to Server"
2.  **Comparte tu pantalla:** Selecciona "Screen Share" o "Camera Share"
3.  **Permite el acceso al micrófono:** El navegador te pedirá permisos
4.  **Habla con la IA:** Comienza a hablar y la IA te responderá
5.  **Dibuja en la pizarra:** Activa el modo "Whiteboard" y usa las herramientas de dibujo (lápiz, resaltador, círculos, rectángulos, flechas, texto)

## 📁 Estructura del Proyecto

```
gemini_nanobanana/
├── main.py                    # Servidor WebSocket + Integración con Gemini API
├── env_loader.py              # Utilidad para cargar variables de entorno
├── resources.py               # Generador de recursos educativos (módulo opcional)
├── start.py                   # Launcher: Inicia Backend + Frontend simultáneamente
├── requirements.txt           # Dependencias de Python
├── .env.example               # Plantilla de configuración de entorno
├── .env                       # Configuración de entorno (no versionar)
├── README.md                  # Este archivo
│
└── multimodal-client-vite/    # Aplicación Frontend en React
    ├── package.json           # Dependencias de Node.js
    ├── vite.config.ts         # Configuración de Vite
    ├── tsconfig.json          # Configuración de TypeScript
    ├── tailwind.config.js     # Configuración de Tailwind CSS
    ├── index.html             # HTML de entrada
    │
    └── src/
        ├── main.tsx           # Punto de entrada de React
        ├── App.tsx            # Componente principal (layout)
        ├── App.css            # Estilos de la aplicación
        ├── index.css          # Estilos globales
        │
        ├── components/
        │   ├── ScreenShare.tsx        # Compartir pantalla/cámara + video
        │   ├── WebSocketProvider.tsx  # Contexto WebSocket + manejo de audio
        │   ├── TranscriptPanel.tsx    # Panel de transcripción de conversación
        │   ├── WhiteboardToolbar.tsx  # Barra de herramientas de dibujo
        │   ├── BackgroundEffect.tsx   # Fondo animado con gradiente
        │   └── ui/                    # Componentes shadcn/ui
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── input.tsx
        │       ├── progress.tsx
        │       └── ...
        │
        ├── hooks/
        │   └── useWhiteboard.ts       # Lógica de pizarra (dibujo en canvas)
        │
        ├── lib/
        │   └── utils.ts               # Funciones utilitarias (helper cn)
        │
        └── types/                     # Definiciones de tipos TypeScript
```

## 🔧 Comandos Disponibles

### Inicio Rápido (Recomendado) 🚀

**Inicia ambos servicios en una sola terminal:**
```bash
python start.py
```

### Backend
```bash
# Activar entorno virtual
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Iniciar servidor (si usas la Opción 2: terminales separadas)
python main.py

# Instalar dependencias
pip install -r requirements.txt
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Linting
npm run lint
```

## ⚙️ Configuración Avanzada

### Cambiar el Puerto del Servidor
Edita `main.py` y modifica el puerto en la función `main()`:
```python
async def main() -> None:
    async with websockets.serve(
        gemini_session_handler,
        host="0.0.0.0",
        port=9090,  # Cambia este valor
        compression=None
    )
```

### Cambiar la URL del WebSocket en el Frontend
Edita `multimodal-client-vite/src/App.tsx`:
```tsx
<WebSocketProvider url="ws://localhost:9090">  // Cambia la URL aquí
```

### Configurar Proxy
Si necesitas usar un proxy, establece las variables de entorno correspondientes o usa `CLEAR_PROXY=1` en `.env` para limpiarlas.

## ❓ Preguntas Frecuentes

### ¿Por qué no se escucha el audio de la IA?
-   Verifica que el volumen del navegador esté activado
-   Asegúrate de haber dado permisos de audio al navegador
-   Revisa que el servidor backend esté corriendo en el puerto 9090

### ¿Puedo usar esto en producción?
Para uso en producción, considera:
-   Usar HTTPS/WSS en lugar de HTTP/WS
-   Implementar autenticación
-   Configurar límites de tasa (rate limiting)
-   Usar un servidor de producción para el backend (ej. Gunicorn + uvicorn workers)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si tienes ideas para nuevas características o mejoras:

1.  Haz un fork del repositorio
2.  Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3.  Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4.  Push a la rama (`git push origin feature/AmazingFeature`)
5.  Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 👨‍💻 Sobre el Desarrollador

Este proyecto fue desarrollado por **Edwin Quintero Alzate**.

-   **GitHub:** [@Edwin1719](https://github.com/Edwin1719)
-   **LinkedIn:** [edwinquintero0329](https://www.linkedin.com/in/edwinquintero0329/)
-   **Email:** [databiq29@gmail.com](mailto:databiq29@gmail.com)

---

<p align="center">
  <strong>⭐ Si te gusta este proyecto, considera darle una estrella en GitHub! ⭐</strong>
</p>
