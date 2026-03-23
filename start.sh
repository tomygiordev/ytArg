#!/bin/bash

clear
echo ""
echo "========================================"
echo "   🎵 YouTube MP3 Downloader"
echo "========================================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Descárgalo desde: https://nodejs.org/"
    exit 1
fi

# Verificar si yt-dlp está instalado
if ! command -v yt-dlp &> /dev/null; then
    echo "⚠️  yt-dlp no está instalado"
    echo "Instálalo con: pip install yt-dlp"
    echo ""
fi

# Verificar si ffmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  ffmpeg no está instalado"
    echo "Instálalo con:"
    echo "  macOS: brew install ffmpeg"
    echo "  Linux: sudo apt install ffmpeg"
    echo ""
fi

# Instalar dependencias si node_modules no existe
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Instalando dependencias de Node.js..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
fi

echo ""
echo "✅ Todo listo!"
echo ""
echo "🚀 Iniciando servidor..."
echo "📍 Abre tu navegador en: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

node app.js
