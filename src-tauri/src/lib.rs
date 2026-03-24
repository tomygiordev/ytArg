use std::collections::HashMap;
use std::path::Path;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use serde::Serialize;
use tauri::State;

// Maps download_id -> PID of running yt-dlp process
struct ActiveDownloads(Mutex<HashMap<String, u32>>);

#[derive(Serialize)]
struct DownloadResult {
    success: bool,
    filename: String,
}

#[tauri::command]
fn get_default_folder() -> String {
    dirs::download_dir()
        .unwrap_or_else(|| dirs::home_dir().unwrap_or_default().join("Downloads"))
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn download_mp3(
    url: String,
    quality: String,
    output: String,
    download_id: String,
    downloads: State<ActiveDownloads>,
) -> Result<DownloadResult, String> {
    if !url.contains("youtube.com") && !url.contains("youtu.be") {
        return Err("URL debe ser de YouTube".to_string());
    }

    let output_path = if output.is_empty() {
        get_default_folder()
    } else {
        output.clone()
    };

    std::fs::create_dir_all(&output_path)
        .map_err(|e| format!("No se pudo crear carpeta: {}", e))?;

    let output_template = Path::new(&output_path)
        .join("%(title)s.%(ext)s")
        .to_string_lossy()
        .to_string();

    let mut args = vec![
        url.clone(),
        "-x".to_string(),
        "-f".to_string(), "bestaudio/best".to_string(),
        "-o".to_string(), output_template,
        "--audio-format".to_string(), "mp3".to_string(),
        "--print".to_string(), "after_move:filepath".to_string(),
        "--no-simulate".to_string(),
    ];

    if quality != "best" {
        args.push("--audio-quality".to_string());
        args.push(format!("{}K", quality));
    }

    let child = Command::new("yt-dlp")
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("No se pudo ejecutar yt-dlp: {}. Instala con: pip install yt-dlp", e))?;

    // Store PID so cancel_download can kill it
    let pid = child.id();
    downloads.0.lock().unwrap().insert(download_id.clone(), pid);

    // Block until yt-dlp finishes (or is killed by cancel_download)
    let output_result = child
        .wait_with_output()
        .map_err(|e| format!("Error esperando proceso: {}", e))?;

    downloads.0.lock().unwrap().remove(&download_id);

    if !output_result.status.success() {
        let stderr = String::from_utf8_lossy(&output_result.stderr);
        return Err(format!(
            "Error al descargar (código {:?}). {}",
            output_result.status.code(),
            &stderr[stderr.len().saturating_sub(500)..]
        ));
    }

    let stdout = String::from_utf8_lossy(&output_result.stdout);

    let file_path = stdout
        .lines()
        .find(|line| !line.is_empty() && Path::new(line.trim()).exists())
        .map(|s| s.trim().to_string());

    let filename = if let Some(fp) = file_path {
        Path::new(&fp)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| "audio.mp3".to_string())
    } else {
        find_latest_mp3(&output_path).unwrap_or_else(|| "audio.mp3".to_string())
    };

    Ok(DownloadResult { success: true, filename })
}

fn find_latest_mp3(dir: &str) -> Option<String> {
    let entries = std::fs::read_dir(dir).ok()?;
    let mut mp3s: Vec<(std::time::SystemTime, String)> = entries
        .flatten()
        .filter(|e| e.path().extension().map(|x| x == "mp3").unwrap_or(false))
        .filter_map(|e| {
            let meta = e.metadata().ok()?;
            let time = meta.modified().ok()?;
            Some((time, e.file_name().to_string_lossy().to_string()))
        })
        .collect();
    mp3s.sort_by(|a, b| b.0.cmp(&a.0));
    mp3s.into_iter().next().map(|(_, name)| name)
}

#[tauri::command]
fn cancel_download(download_id: String, downloads: State<ActiveDownloads>) -> bool {
    let pid = downloads.0.lock().unwrap().remove(&download_id);
    if let Some(pid) = pid {
        // Kill yt-dlp process by PID
        Command::new("taskkill")
            .args(["/F", "/PID", &pid.to_string()])
            .spawn()
            .ok();
        true
    } else {
        false
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ActiveDownloads(Mutex::new(HashMap::new())))
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_default_folder,
            download_mp3,
            cancel_download,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
