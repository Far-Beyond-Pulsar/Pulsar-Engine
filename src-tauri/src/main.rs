#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Serialize, Deserialize};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use std::ffi::OsStr;
use tauri::Manager;
use std::fs;

// File system structs
#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    name: String,
    path: String,
    entry_type: String,
}

#[derive(Debug, Serialize)]
pub struct FileContent {
    content: String,
    language: String,
}

#[derive(Debug, Serialize)]
pub struct FileError {
    message: String,
    code: String,
}

// Existing commands
#[tauri::command]
async fn execute_command(command: String) -> Result<String, String> {
    let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(&command)
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn on_button_clicked() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis();
    format!("on_button_clicked called from Rust! (timestamp: {since_the_epoch}ms)")
}

// File system commands
#[tauri::command]
fn get_directory_structure(path: &str) -> Result<Vec<FileEntry>, String> {
    let root = Path::new(path);
    if !root.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let mut entries = Vec::new();

    for entry in WalkDir::new(root).min_depth(1).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        let file_name = path.file_name().unwrap_or_default().to_string_lossy();

        // Skip hidden files and directories
        if file_name.starts_with('.') {
            continue;
        }

        let relative_path = path.strip_prefix(root).unwrap_or(path);
        let entry_type = if path.is_dir() { "directory" } else { "file" };

        entries.push(FileEntry {
            name: file_name.into_owned(),
            path: relative_path.to_string_lossy().into_owned(),
            entry_type: entry_type.to_string(),
        });
    }

    Ok(entries)
}

#[tauri::command]
async fn read_file_content(path: String) -> Result<FileContent, String> {
    let path = PathBuf::from(path);
    
    // Read file extension
    let extension = path
        .extension()
        .and_then(OsStr::to_str)
        .unwrap_or("")
        .to_lowercase();

    // Determine if this is a binary file that needs base64 encoding
    let is_binary = matches!(
        extension.as_str(),
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "bmp" |
        "glb" | "gltf" | "obj" | "fbx" | "stl"
    );

    if is_binary {
        // Read binary content and encode as base64
        let content = fs::read(&path)
            .map_err(|e| e.to_string())?;
        let base64_content = base64::encode(content);
        
        Ok(FileContent {
            content: base64_content,
            language: String::from("binary"),
        })
    } else {
        // Handle text files as before
        let content = fs::read_to_string(&path)
            .map_err(|e| e.to_string())?;
            
        // Determine language based on extension
        let language = match extension.as_str() {
            "js" | "jsx" => "javascript",
            "ts" | "tsx" => "typescript",
            "rs" => "rust",
            // ... add other mappings
            _ => "plaintext",
        };

        Ok(FileContent {
            content,
            language: String::from(language),
        })
    }
}

#[tauri::command]
async fn save_file_content(path: String, content: String) -> Result<(), FileError> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileError {
            message: e.to_string(),
            code: "WRITE_ERROR".to_string(),
        })
    }
}

#[tauri::command]
async fn create_file(path: String) -> Result<(), FileError> {
    match fs::File::create(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileError {
            message: e.to_string(),
            code: "CREATE_ERROR".to_string(),
        })
    }
}

#[tauri::command]
async fn create_directory(path: String) -> Result<(), FileError> {
    match fs::create_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileError {
            message: e.to_string(),
            code: "CREATE_DIR_ERROR".to_string(),
        })
    }
}

#[tauri::command]
async fn delete_path(path: String) -> Result<(), FileError> {
    let path = Path::new(&path);
    if path.is_dir() {
        match fs::remove_dir_all(path) {
            Ok(_) => Ok(()),
            Err(e) => Err(FileError {
                message: e.to_string(),
                code: "DELETE_ERROR".to_string(),
            })
        }
    } else {
        match fs::remove_file(path) {
            Ok(_) => Ok(()),
            Err(e) => Err(FileError {
                message: e.to_string(),
                code: "DELETE_ERROR".to_string(),
            })
        }
    }
}

// Helper functions
fn get_file_language(path: &str) -> String {
    let extension = Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("");

    match extension.to_lowercase().as_str() {
        "rs" => "rust",
        "js" => "javascript",
        "jsx" => "javascript",
        "ts" => "typescript",
        "tsx" => "typescript",
        "py" => "python",
        "json" => "json",
        "md" => "markdown",
        "css" => "css",
        "html" => "html",
        "xml" => "xml",
        "yaml" | "yml" => "yaml",
        _ => "plaintext",
    }.to_string()
}

fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with('.'))
        .unwrap_or(false)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_decorations(false).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            execute_command,
            on_button_clicked,
            get_directory_structure,
            read_file_content,
            save_file_content,
            create_file,
            create_directory,
            delete_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}