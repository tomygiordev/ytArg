const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');

const PORT = 3000;
let mainWindow;
let expressApp;

// ─── Servidor Express integrado ────────────────────────────────────────────────
function startExpressServer() {
    const express = require('express');
    expressApp = express();

    expressApp.use(express.json());
    expressApp.use(express.static(__dirname));

    const activeDownloads = new Map();

    expressApp.get('/api/default-folder', (req, res) => {
        res.json({ path: path.join(os.homedir(), 'Downloads') });
    });

    expressApp.post('/api/download', (req, res) => {
        const { url, quality, output, downloadId } = req.body;

        if (!url) return res.status(400).json({ error: 'URL requerida' });
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return res.status(400).json({ error: 'URL debe ser de YouTube' });
        }

        const outputPath = path.resolve(output || path.join(os.homedir(), 'Downloads'));
        if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

        const args = [
            url,
            '-x',
            '-f', 'bestaudio/best',
            '-o', path.join(outputPath, '%(title)s.%(ext)s'),
            '--audio-format', 'mp3',
            '--print', 'after_move:filepath',
            '--no-simulate'
        ];

        if (quality && quality !== 'best') {
            args.push('--audio-quality', quality + 'K');
        }

        console.log('Descargando:', url);

        const ytProc = spawn('yt-dlp', args, { shell: true });
        activeDownloads.set(downloadId, ytProc);

        let stderrData = '';
        let downloadedFilePath = '';

        ytProc.stdout.on('data', (data) => {
            const line = data.toString().trim();
            console.log('  >', line);
            if (line && fs.existsSync(line)) downloadedFilePath = line;
        });

        ytProc.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        ytProc.on('close', (code) => {
            activeDownloads.delete(downloadId);
            if (code === 0 && downloadedFilePath) {
                res.json({ success: true, filename: path.basename(downloadedFilePath), path: downloadedFilePath });
            } else if (code === 0) {
                // Fallback: buscar mp3 más reciente
                try {
                    const files = fs.readdirSync(outputPath)
                        .filter(f => f.endsWith('.mp3'))
                        .map(f => ({ name: f, time: fs.statSync(path.join(outputPath, f)).mtimeMs }))
                        .sort((a, b) => b.time - a.time);
                    const filename = files.length > 0 ? files[0].name : 'audio.mp3';
                    res.json({ success: true, filename, path: path.join(outputPath, filename) });
                } catch {
                    res.json({ success: true, filename: 'audio.mp3', path: outputPath });
                }
            } else {
                res.status(500).json({ error: `Error al descargar (código ${code}).`, details: stderrData.slice(-500) });
            }
        });

        ytProc.on('error', (err) => {
            activeDownloads.delete(downloadId);
            res.status(500).json({ error: `No se pudo ejecutar yt-dlp: ${err.message}. Instala con: pip install yt-dlp` });
        });
    });

    expressApp.post('/api/cancel/:downloadId', (req, res) => {
        const { downloadId } = req.params;
        const ytProc = activeDownloads.get(downloadId);
        if (ytProc) {
            ytProc.kill();
            activeDownloads.delete(downloadId);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Descarga no encontrada' });
        }
    });

    return new Promise((resolve, reject) => {
        const server = expressApp.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
            resolve();
        });
        server.on('error', reject);
    });
}

// ─── IPC: Diálogo nativo de selección de carpeta ──────────────────────────────
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Selecciona carpeta de destino',
        defaultPath: path.join(os.homedir(), 'Downloads'),
    });
    return result.canceled ? null : result.filePaths[0];
});

// ─── IPC: Controles de ventana ─────────────────────────────────────────────────
ipcMain.on('window-close',    () => mainWindow && mainWindow.close());
ipcMain.on('window-minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window-maximize', () => {
    if (!mainWindow) return;
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});

// ─── Ventana principal ────────────────────────────────────────────────────────
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 760,
        height: 820,
        resizable: false,
        title: 'Y2K MP3 RIPPER v1.0',
        icon: path.join(__dirname, 'icono.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        backgroundColor: '#111111',
        show: false,
        autoHideMenuBar: true,
        frame: false,        // sin frame del SO — usamos título bar propio
    });

    mainWindow.loadURL(`http://localhost:${PORT}`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ─── Ciclo de vida de la app ──────────────────────────────────────────────────
app.whenReady().then(async () => {
    try {
        await startExpressServer();
    } catch (err) {
        console.error('Error al iniciar servidor:', err);
    }
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
