use tauri::{State, Runtime};
use serde::{Serialize, Deserialize};
use log::{info, warn, error, debug};
use env_logger;
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize)]
struct ViewportStatus {
    width: u32,
    height: u32,
    buffer_size: usize,
    device_pixel_ratio: f64,
}

#[derive(Debug, Deserialize)]
struct ViewportConfig {
    width: u32,
    height: u32,
    device_pixel_ratio: f64,
}

#[derive(Debug, Deserialize)]
struct ViewportEvent {
    event_type: String,
    tool: Option<String>,
    position: Option<Position>,
    delta: Option<Delta>,
    button: Option<u32>,
}

#[derive(Debug, Deserialize)]
struct Position {
    x: f64,
    y: f64,
}

#[derive(Debug, Deserialize)]
struct Delta {
    x: f64,
    y: f64,
}

#[derive(Debug, Serialize)]
struct HitTestResult {
    hit: bool,
    object_id: Option<String>,
}

#[derive(Debug, Serialize)]
struct SceneStats {
    object_count: u32,
}

#[derive(Debug)]
struct ViewportState {
    width: u32,
    height: u32,
    buffer: Vec<u8>,
    device_pixel_ratio: f64,
}

impl ViewportState {
    fn new() -> Self {
        Self {
            width: 0,
            height: 0,
            buffer: Vec::new(),
            device_pixel_ratio: 1.0,
        }
    }

    fn get_status(&self) -> ViewportStatus {
        ViewportStatus {
            width: self.width,
            height: self.height,
            buffer_size: self.buffer.len(),
            device_pixel_ratio: self.device_pixel_ratio,
        }
    }

    fn fill_buffer_red(&mut self) {
        for i in (0..self.buffer.len()).step_by(4) {
            self.buffer[i] = 255;     // R
            self.buffer[i + 1] = 0;   // G
            self.buffer[i + 2] = 0;   // B
            self.buffer[i + 3] = 255; // A
        }
    }

    fn resize(&mut self, width: u32, height: u32) {
        let buffer_size = (width * height * 4) as usize;
        self.width = width;
        self.height = height;
        self.buffer.resize(buffer_size, 0);
        self.fill_buffer_red();
    }
}

#[tauri::command]
async fn initialize_viewport(
    config: ViewportConfig,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    info!("Initializing viewport with config: {:?}", config);
    
    if config.width == 0 || config.height == 0 {
        return Err("Invalid viewport dimensions: width and height must be greater than 0".to_string());
    }
    
    viewport.device_pixel_ratio = config.device_pixel_ratio;
    viewport.resize(config.width, config.height);
    
    debug!("Buffer initialized: size={}, first_pixels={:?}", 
        viewport.buffer.len(),
        viewport.buffer.chunks(4).take(4).collect::<Vec<_>>()
    );
    
    Ok(viewport.get_status())
}

#[tauri::command]
async fn get_frame_data(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<(Vec<u8>, ViewportStatus), String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    debug!("Sending frame data: buffer_size={}", viewport.buffer.len());
    
    Ok((viewport.buffer.clone(), viewport.get_status()))
}

#[tauri::command]
async fn update_scene_state(
    delta_time: f32,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    debug!("Updating scene state: dt={}", delta_time);
    Ok(viewport.get_status())
}

#[tauri::command]
async fn resize_viewport(
    config: ViewportConfig,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    if config.width == 0 || config.height == 0 {
        return Err("Invalid resize dimensions: width and height must be greater than 0".to_string());
    }
    
    info!("Resizing viewport to: {}x{}", config.width, config.height);
    viewport.resize(config.width, config.height);
    
    Ok(viewport.get_status())
}

#[tauri::command]
async fn handle_viewport_event(
    event: ViewportEvent,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<HitTestResult, String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    debug!("Handling viewport event: {:?}", event.event_type);
    
    match event.event_type.as_str() {
        "mouseDown" | "mouseMove" | "drag" | "zoom" => {
            Ok(HitTestResult {
                hit: false,
                object_id: None,
            })
        },
        _ => Err(format!("Unknown event type: {}", event.event_type)),
    }
}

#[tauri::command]
async fn get_viewport_status(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(viewport.get_status())
}

#[tauri::command]
async fn get_scene_stats() -> Result<SceneStats, String> {
    Ok(SceneStats {
        object_count: 0,
    })
}

#[tauri::command]
async fn reset_viewport_camera(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    debug!("Resetting viewport camera");
    Ok(viewport.get_status())
}

#[tauri::command]
async fn delete_object(
    id: String,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    debug!("Deleting object: {}", id);
    Ok(viewport.get_status())
}

fn main() {
    env_logger::init();
    info!("Starting viewport application");
    
    let viewport_state = Arc::new(Mutex::new(ViewportState::new()));

    tauri::Builder::default()
        .manage(viewport_state)
        .invoke_handler(tauri::generate_handler![
            initialize_viewport,
            handle_viewport_event,
            get_frame_data,
            get_viewport_status,
            update_scene_state,
            resize_viewport,
            reset_viewport_camera,
            get_scene_stats,
            delete_object,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}