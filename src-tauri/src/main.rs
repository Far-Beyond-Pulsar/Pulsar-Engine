use tauri::{State, Runtime, Manager};
use serde::{Serialize, Deserialize};
use log::{info, debug, error};
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ViewportConfig {
    width: u32,
    height: u32,
    device_pixel_ratio: f64,
}

#[derive(Debug, Serialize, Clone)]
struct ViewportStatus {
    width: u32,
    height: u32,
    buffer_size: usize,
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
    shared_buffer_ptr: usize,
    camera_position: (f64, f64, f64),
    grid_visible: bool,
    gizmos_visible: bool,
    objects: Vec<String>,
    playing: bool,
}

impl ViewportState {
    fn new() -> Self {
        Self {
            width: 0,
            height: 0,
            buffer: Vec::new(),
            device_pixel_ratio: 1.0,
            shared_buffer_ptr: 0,
            camera_position: (0.0, 0.0, 10.0),
            grid_visible: true,
            gizmos_visible: true,
            objects: Vec::new(),
            playing: true,
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

    fn fill_buffer(&mut self, color: [u8; 4]) {
        for chunk in self.buffer.chunks_mut(4) {
            chunk.copy_from_slice(&color);
        }
    }

    fn resize(&mut self, width: u32, height: u32, device_pixel_ratio: f64) {
        let buffer_size = (width * height * 4) as usize;
        self.width = width;
        self.height = height;
        self.device_pixel_ratio = device_pixel_ratio;
        
        // Preallocate buffer with a default color (dark gray)
        self.buffer = vec![30, 30, 30, 255].repeat(buffer_size / 4);
    }
}

#[tauri::command]
fn initialize_viewport(
    config: ViewportConfig,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    info!("Initializing viewport with config: {:?}", config);
    
    if config.width == 0 || config.height == 0 {
        return Err("Invalid viewport dimensions: width and height must be greater than 0".to_string());
    }
    
    viewport.resize(config.width, config.height, config.device_pixel_ratio);
    
    Ok(viewport.get_status())
}

#[tauri::command]
fn setup_shared_memory(
    window: tauri::Window,
    config: ViewportConfig,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<usize, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // Ensure viewport is initialized
    if config.width == 0 || config.height == 0 {
        return Err("Invalid viewport dimensions: width and height must be greater than 0".to_string());
    }
    
    // Resize viewport
    viewport.resize(config.width, config.height, config.device_pixel_ratio);
    
    // Get raw pointer to buffer
    let buffer_ptr = viewport.buffer.as_ptr() as usize;
    viewport.shared_buffer_ptr = buffer_ptr;
    
    // Notify frontend about shared memory setup
    window.emit("shared-memory-ready", buffer_ptr)
        .map_err(|e| format!("Failed to emit shared memory event: {}", e))?;
    
    Ok(buffer_ptr)
}

#[tauri::command]
fn update_viewport(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // Simulate scene update or rendering logic
    if viewport.playing {
        // Update buffer or scene state here
        // For now, just maintain the current state
    }
    
    Ok(viewport.get_status())
}

#[tauri::command]
fn handle_viewport_event(
    event: ViewportEvent,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<HitTestResult, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    debug!("Handling viewport event: {:?}", event.event_type);
    
    match event.event_type.as_str() {
        "mouseDown" | "mouseMove" | "drag" => {
            // Simulate hit testing or object interaction
            Ok(HitTestResult {
                hit: false,
                object_id: None,
            })
        },
        "zoom" => {
            // Simulate zoom interaction
            Ok(HitTestResult {
                hit: false,
                object_id: None,
            })
        },
        _ => Err(format!("Unknown event type: {}", event.event_type)),
    }
}

#[tauri::command]
fn get_scene_stats(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<SceneStats, String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    Ok(SceneStats {
        object_count: viewport.objects.len() as u32,
    })
}

#[tauri::command]
fn reset_viewport_camera(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // Reset camera to default position
    viewport.camera_position = (0.0, 0.0, 10.0);
    
    Ok(viewport.get_status())
}

#[tauri::command]
fn delete_object(
    id: String,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // Remove object from the list
    viewport.objects.retain(|obj_id| *obj_id != id);
    
    Ok(viewport.get_status())
}

#[tauri::command]
fn toggle_grid(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<bool, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    viewport.grid_visible = !viewport.grid_visible;
    
    Ok(viewport.grid_visible)
}

#[tauri::command]
fn toggle_gizmos(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<bool, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    viewport.gizmos_visible = !viewport.gizmos_visible;
    
    Ok(viewport.gizmos_visible)
}

#[tauri::command]
fn toggle_play(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<bool, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    viewport.playing = !viewport.playing;
    
    Ok(viewport.playing)
}

fn main() {
    env_logger::init();
    info!("Starting shared memory viewport application");
    
    let viewport_state = Arc::new(Mutex::new(ViewportState::new()));

    tauri::Builder::default()
        .manage(viewport_state)
        .invoke_handler(tauri::generate_handler![
            initialize_viewport,
            setup_shared_memory,
            update_viewport,
            handle_viewport_event,
            get_scene_stats,
            reset_viewport_camera,
            delete_object,
            toggle_grid,
            toggle_gizmos,
            toggle_play,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}