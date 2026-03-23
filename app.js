const express = require('express');
const { exec, spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Almacenar descargas activas
const activeDownloads = new Map();

// Obtener carpeta de descargas por defecto
app.get('/api/default-folder', (req, res) => {
    const defaultPath = path.join(os.homedir(), 'Downloads');
    res.json({ path: defaultPath });
});

// Descargar video
app.post('/api/download', (req, res) => {
    const { url, quality, output, downloadId } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL requerida' });
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return res.status(400).json({ error: 'URL debe ser de YouTube' });
    }

    const outputPath = path.resolve(output || path.join(os.homedir(), 'Downloads'));
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

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

    try {
        const ytProc = spawn('yt-dlp', args, { shell: true });
        activeDownloads.set(downloadId, ytProc);

        let stderrData = '';
        let downloadedFilePath = '';

        ytProc.stdout.on('data', (data) => {
            const line = data.toString().trim();
            console.log('  >', line);
            if (line && fs.existsSync(line)) {
                downloadedFilePath = line;
            }
        });

        ytProc.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        ytProc.on('close', (code) => {
            activeDownloads.delete(downloadId);

            if (code === 0 && downloadedFilePath) {
                const filename = path.basename(downloadedFilePath);
                console.log('  Completado:', filename);
                res.json({ success: true, filename, path: downloadedFilePath });
            } else if (code === 0) {
                // Buscar el mp3 más reciente como fallback
                try {
                    const files = fs.readdirSync(outputPath)
                        .filter(f => f.endsWith('.mp3'))
                        .map(f => ({ name: f, time: fs.statSync(path.join(outputPath, f)).mtimeMs }))
                        .sort((a, b) => b.time - a.time);
                    const filename = files.length > 0 ? files[0].name : 'audio.mp3';
                    console.log('  Completado (fallback):', filename);
                    res.json({ success: true, filename, path: path.join(outputPath, filename) });
                } catch {
                    res.json({ success: true, filename: 'audio.mp3', path: outputPath });
                }
            } else {
                console.error('  Error (código ' + code + ')');
                res.status(500).json({
                    error: `Error al descargar (código ${code}).`,
                    details: stderrData.slice(-500)
                });
            }
        });

        ytProc.on('error', (err) => {
            activeDownloads.delete(downloadId);
            console.error('  Error yt-dlp:', err.message);
            res.status(500).json({
                error: `No se pudo ejecutar yt-dlp: ${err.message}. Instala con: pip install yt-dlp`,
            });
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Cancelar descarga
app.post('/api/cancel/:downloadId', (req, res) => {
    const { downloadId } = req.params;
    const ytProc = activeDownloads.get(downloadId);
    if (ytProc) {
        ytProc.kill();
        activeDownloads.delete(downloadId);
        res.json({ success: true, message: 'Descarga cancelada' });
    } else {
        res.status(404).json({ error: 'Descarga no encontrada' });
    }
});

// Función para matar proceso en el puerto e iniciar el servidor
function killPortAndStart() {
    // En Windows, buscar el PID que usa el puerto y matarlo
    exec(`netstat -ano | findstr :${PORT} | findstr LISTENING`, (err, stdout) => {
        if (stdout && stdout.trim()) {
            // Extraer PID de la salida de netstat
            const lines = stdout.trim().split('\n');
            const pids = new Set();
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') pids.add(pid);
            }

            if (pids.size > 0) {
                console.log(`Puerto ${PORT} ocupado. Liberando...`);
                let killed = 0;
                for (const pid of pids) {
                    exec(`taskkill /F /PID ${pid}`, (err) => {
                        killed++;
                        if (killed === pids.size) {
                            // Esperar un momento y arrancar
                            setTimeout(startServer, 1000);
                        }
                    });
                }
            } else {
                startServer();
            }
        } else {
            startServer();
        }
    });
}

function startServer() {
    const server = app.listen(PORT, () => {
        console.log(`\n  YouTube MP3 Downloader`);
        console.log(`  http://localhost:${PORT}\n`);

        // Abrir navegador automáticamente
        const openCmd = process.platform === 'win32' ? 'start'
            : process.platform === 'darwin' ? 'open' : 'xdg-open';
        exec(`${openCmd} http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Puerto ${PORT} sigue ocupado. Intentando de nuevo...`);
            setTimeout(startServer, 2000);
        } else {
            console.error('Error del servidor:', err);
        }
    });
}

killPortAndStart();
