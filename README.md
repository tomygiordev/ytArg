# 🎵 YouTube MP3 Downloader

Interfaz moderna y elegante para descargar videos de YouTube como MP3 de alta calidad. Construida con yt-dlp, Express y un diseño dark industrial minimalista.

## Características

✨ **Interfaz moderna** - Diseño dark elegante con animaciones suaves
🔗 **Pegar URL fácil** - Botón para pegar URLs desde el portapapeles
🎚️ **Control de calidad** - Selecciona entre mejor calidad, 128/192/320 kbps
📁 **Carpeta personalizada** - Elige dónde guardar los archivos
📊 **Progreso en tiempo real** - Barra de progreso y estado de descarga
💾 **Historial** - Ve tus descargas recientes
⚡ **Rápido** - Descarga y convierte en paralelo

## Requisitos Previos

Necesitas tener instalados:

### 1. Node.js (v14+)
Descarga desde https://nodejs.org/

### 2. yt-dlp
```bash
pip install yt-dlp
```

### 3. ffmpeg
Necesario para convertir a MP3:

**Windows (con Chocolatey):**
```bash
choco install ffmpeg
```

**Windows (manual):**
Descarga desde https://ffmpeg.org/download.html y añade a PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

## Instalación

1. **Clona o descarga este proyecto**
```bash
cd C:\Users\Gime\Desktop\ytArg
```

2. **Instala dependencias de Node.js**
```bash
npm install
```

## Uso

### Iniciar el servidor

```bash
npm start
```

Verás:
```
🎵 YouTube MP3 Downloader
Servidor ejecutándose en http://localhost:3000

Requisitos:
  ✓ yt-dlp instalado (pip install yt-dlp)
  ✓ ffmpeg instalado (necesario para convertir a MP3)
```

### Abrir la interfaz

Abre tu navegador en: **http://localhost:3000**

### Descargar un video

1. Pega la URL del video de YouTube (o usa el botón "Pegar")
2. Selecciona la calidad de audio deseada
3. Elige la carpeta de destino (por defecto: Descargas)
4. Haz clic en "Descargar"
5. Espera a que complete (puedes ver el progreso)

## Desarrollo

Para modo desarrollo con reinicio automático:

```bash
npm run dev
```

Necesitarás tener `nodemon` instalado (se incluye en devDependencies).

## Estructura de Archivos

```
ytArg/
├── index.html       # Interfaz de usuario (HTML/CSS/JS)
├── app.js          # Servidor Express + APIs
├── package.json    # Dependencias de Node.js
└── README.md       # Este archivo
```

## APIs

### POST /api/download
Inicia una descarga de YouTube a MP3.

**Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "quality": "best",
  "output": "/ruta/descargas",
  "downloadId": "1234567890"
}
```

**Quality opciones:**
- `best` - Mejor calidad disponible (recomendado)
- `192` - 192 kbps
- `128` - 128 kbps
- `320` - 320 kbps

**Response:**
```json
{
  "success": true,
  "filename": "video_title.mp3",
  "path": "/ruta/completa/video_title.mp3"
}
```

### POST /api/cancel/:downloadId
Cancela una descarga activa.

### GET /api/default-folder
Obtiene la carpeta de Descargas por defecto.

## Solución de Problemas

### "No se pudo ejecutar yt-dlp"
**Solución:** Instala yt-dlp:
```bash
pip install yt-dlp
```

Verifica que está en PATH:
```bash
yt-dlp --version
```

### "ffmpeg no encontrado"
**Solución:** Instala ffmpeg según tu sistema operativo (ver Requisitos Previos).

Verifica que está en PATH:
```bash
ffmpeg -version
```

### La descarga se queda pegada
Cancela con el botón "Cancelar" y revisa los logs en la consola del servidor.

### El navegador no abre la página
Asegúrate que el servidor está ejecutándose y accede manualmente a:
```
http://localhost:3000
```

## Personalización

### Cambiar puerto del servidor
En `app.js`, busca `const PORT = 3000` y cámbialo.

### Cambiar colores del diseño
En `index.html`, modifica las variables CSS en el `:root`:
```css
--accent: #FF6B35;        /* Color naranja principal */
--bg-dark: #0a0e27;       /* Fondo oscuro */
--success: #4ECDC4;       /* Color éxito */
```

### Cambiar carpeta por defecto
En `app.js`, modifica la función `app.get('/api/default-folder', ...)`.

## Licencia

MIT

## Notas

- Las descargas se guardan en MP3 automáticamente
- Se usa la mejor calidad de audio disponible de YouTube
- ffmpeg es necesario para la conversión
- El servidor almacena el historial en la sesión (se pierde al reiniciar)

## Créditos

Construido con:
- **yt-dlp** - YouTube downloader
- **Express** - Servidor web
- **Poppins + JetBrains Mono** - Tipografías
