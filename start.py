"""
Launcher - Inicia Backend y Frontend simultáneamente
Versión simplificada sin lectura de stdout bloqueante
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def main():
    print("=" * 50)
    print("  🚀 Gemini NanoBanana - Starting Services")
    print("=" * 50)
    print()
    
    # Rutas
    frontend_dir = Path("multimodal-client-vite").resolve()
    
    print("📋 Configuración:")
    print("   Backend:  python main.py (port 9090)")
    print("   Frontend: npm run dev (port 5173)")
    print()
    print("🌐 URLs:")
    print("   Frontend: http://localhost:5173")
    print("   Backend:  ws://localhost:9090")
    print()
    print("⚠️  Usa Ctrl+C en esta terminal para detener el frontend")
    print("   (El backend se detendrá automáticamente)")
    print("-" * 50)
    print()
    
    # Iniciar backend en segundo plano (sin capturar stdout)
    # En Windows usamos START para crear nueva ventana
    if os.name == "nt":
        # Windows: crear nueva ventana para el backend
        backend_proc = subprocess.Popen(
            ["start", "Gemini Backend", "python", "main.py"],
            shell=True
        )
    else:
        # Linux/Mac: background process
        backend_proc = subprocess.Popen(
            [sys.executable, "main.py"],
            stdout=None,
            stderr=None
        )
    
    # Esperar un momento para que el backend inicie
    time.sleep(2)
    
    print("✅ Backend iniciado")
    print("✅ Iniciando Frontend...")
    print()
    
    # Iniciar frontend en esta terminal
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    
    try:
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=str(frontend_dir)
        )
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n")
        print("🛑 Deteniendo servicios...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("✅ Servicios detenidos.")

if __name__ == "__main__":
    main()
