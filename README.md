# 🎵 Y2K MP3 RIPPER v1.0

Descarga videos de YouTube como MP3 de alta calidad con una interfaz retro Y2K elegante. Construida con **Tauri v2**, **Rust** y diseño dark industrial minimalista.

**Antes:** 347 MB (Electron) → **Ahora:** 1.4 MB (Tauri) ⚡

## Características

✨ **Interfaz Y2K retro** - Diseño dark elegante con animaciones CRT y holográficas
🔗 **Pegar URL fácil** - Botón para pegar URLs desde el portapapeles
🎚️ **Control de calidad** - Selecciona entre mejor calidad, 128/192/320 kbps
📁 **Carpeta personalizada** - Elige dónde guardar los archivos (folder picker nativo)
📊 **Progreso en tiempo real** - Barra de progreso y estado de descarga
💾 **Historial** - Ve tus descargas completadas en la sesión
⚡ **Ultra liviana** - 1.4 MB, sin dependencias de Node.js
🖥️ **Portable** - Versión sin instalar disponible

## Descargas

| Versión | Tamaño | Tipo |
|---------|--------|------|
| **Y2K MP3 Ripper_1.0.0_x64-setup.exe** | 1.4 MB | Instalador NSIS (recomendado) |
| **Y2K MP3 Ripper (Portable).exe** | 5.3 MB | Portable (sin instalador) |
| **Y2K MP3 Ripper_1.0.0_x64_en-US.msi** | 2.3 MB | Instalador MSI (alternativo) |

Descargalos desde la sección [Releases](https://github.com/tomygiordev/ytArg/releases) o desde tu [Desktop]().

## Requisitos Previos

### Para usar la app:

**Solo necesitas `yt-dlp` instalado:**

```bash
pip install yt-dlp
```

O descarga el ejecutable directo: https://github.com/yt-dlp/yt-dlp/releases

**No necesitas:**
- ❌ Node.js
- ❌ ffmpeg
- ❌ Visual Studio Build Tools
- ❌ Rust

La app es completamente portable y auto-contenida.

### Para desarrollar/compilar:

Necesitas:
- **Rust**: https://rustup.rs/
- **Visual Studio Build Tools** (MSVC C++ toolchain)
- **Node.js v18+**: https://nodejs.org/

## Instalación y Uso

### Opción 1: Instalador (Recomendado)

1. Descarga `Y2K MP3 Ripper_1.0.0_x64-setup.exe`
2. Ejecuta el instalador
3. Abre la app desde el Menú Inicio

### Opción 2: Portable

1. Descarga `Y2K MP3 Ripper (Portable).exe`
2. Ejecuta directamente (sin instalar)
3. No deja rastro en el sistema

### Opción 3: Desarrollo local

```bash
git clone https://github.com/tomygiordev/ytArg.git
cd ytArg
npm install
npm run dev     # Para desarrollo con hot-reload
npm run build   # Para compilar versión final
```

## Cómo usar

1. **Pega la URL** del video de YouTube (o usa el botón "PEGAR")
2. **Selecciona calidad** de audio (best, 320, 192, 128 kbps)
3. **Elige carpeta** de destino (por defecto: Descargas)
4. **Haz clic en "HIT THE RIPP button"**
5. **Espera** a que complete (verás el progreso)

## Arquitectura

Migrado de Electron a Tauri v2 para máxima eficiencia:

```
Frontend:
├── frontend/index.html  # UI (HTML/CSS/JS puro, sin frameworks)
└── Tauri JS APIs       # window, dialog, invoke

Backend (Rust):
├── src-tauri/src/lib.rs # 3 comandos Tauri
│   ├── download_mp3()   # Spawn yt-dlp, captura output
│   ├── cancel_download() # Mata proceso
│   └── get_default_folder() # Obtiene carpeta descargas
├── Cargo.toml           # Dependencias Rust
└── yt-dlp (external)    # Se ejecuta como child process
```

**No hay servidor Express en la app final.** El backend es código Rust compilado directamente en el ejecutable.

## Desarrollo

### Scripts disponibles

```bash
npm run dev              # Inicia dev server con hot-reload (Tauri)
npm run build            # Compila versión release
npm run web              # Inicia modo servidor Express alternativo (localhost:3000)
```

### Estructura de archivos

```
ytArg/
├── frontend/
│   └── index.html            # UI del app
├── src-tauri/
│   ├── src/lib.rs            # Backend Rust (comandos)
│   ├── tauri.conf.json       # Config Tauri
│   ├── Cargo.toml            # Dependencias Rust
│   └── icons/                # Iconos de la app
├── app.js                    # Servidor Express (modo web alternativo)
├── package.json              # Dependencias Node.js
└── README.md                 # Este archivo
```

### Compilar desde código

```bash
# Instala dependencias
npm install

# Inicia modo desarrollo
npm run dev

# Compila versión final (genera exe)
npm run build

# Output en: src-tauri/target/release/bundle/nsis/
```

## Solución de Problemas

### "yt-dlp no encontrado"
Instala yt-dlp:
```bash
pip install yt-dlp
```

Verifica:
```bash
yt-dlp --version
```

### "No puedo descargar"
- Verifica tu conexión a internet
- Asegúrate que la URL sea un video de YouTube válido
- Revisa que tengas permisos de escritura en la carpeta de destino

### La app no arranca
- Reinstala desde el setup.exe
- Elimina archivos de caché: `%APPDATA%/Y2K MP3 Ripper`

### Necesito más ayuda
Abre un issue en GitHub: https://github.com/tomygiordev/ytArg/issues

## Cambios Recientes

### v1.0.0 (Actual)
✅ Migración de Electron a Tauri v2
✅ Reducción de 347 MB → 1.4 MB
✅ Backend en Rust compilado
✅ Ventana sin bordes (frameless)
✅ Folder picker nativo
✅ Controles de ventana funcionales
✅ Versión portable disponible
✅ Icono personalizado Y2K

## Licencia

MIT - Libre para usar, modificar y distribuir

## Créditos

Construido con:
- **Tauri v2** - Framework de escritorio ligero
- **Rust** - Backend compilado
- **yt-dlp** - YouTube downloader
- **Press Start 2P & VT323** - Tipografías retro Y2K
- **CSS puro** - Animaciones holográficas y CRT

---

**¿Cansado de apps pesadas? Y2K MP3 Ripper te da funcionalidad de 347 MB en solo 1.4 MB.** 🚀
