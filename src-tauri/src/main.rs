use tauri::{
    State, 
    Manager,
    window::WindowBuilder,
    http::{Request, Response, header::HeaderValue},
};
use parking_lot::RwLock;
use std::sync::Arc;
use std::slice;

#[derive(Clone, serde::Serialize, serde::Deserialize, Debug)]
pub struct ViewportConfig {
    width: u32,
    height: u32,
    device_pixel_ratio: f64,
}

#[derive(Debug)]
struct VideoBuffer {
    buffer: Vec<u8>,
    width: u32,
    height: u32,
    config: ViewportConfig,
}

struct SharedVideoBuffer(Arc<RwLock<VideoBuffer>>);

#[tauri::command]
fn get_shared_memory_info(state: State<SharedVideoBuffer>) -> Result<Vec<u8>, String> {
    let buffer = state.0.read();
    
    // Return a reference to the raw buffer data
    println!("Shared Memory Info Request:");
    println!("  Buffer Length: {}", buffer.buffer.len());
    println!("  First Bytes: {:?}", &buffer.buffer[0..16]);
    
    Ok(buffer.buffer.clone())
}

#[tauri::command]
fn draw_test_pattern(state: State<SharedVideoBuffer>) -> Result<(), String> {
    let mut buffer = state.0.write();
    
    println!("Drawing test pattern. Buffer size: {}", buffer.buffer.len());
    
    for i in (0..buffer.buffer.len()).step_by(4) {
        if i + 3 < buffer.buffer.len() {
            buffer.buffer[i]     = ((i * 1103515245 + 12345) >> 16) as u8;   // R
            buffer.buffer[i + 1] = ((i * 1103515245 + 12345) >> 16) as u8;   // G
            buffer.buffer[i + 2] = ((i * 1103515245 + 12345) >> 16) as u8;   // B
            buffer.buffer[i + 3] = 255;   // A
        }
    }
    
    println!("Test pattern first bytes: {:?}", &buffer.buffer[0..16]);
    
    Ok(())
}

#[tauri::command]
fn initialize_viewport(
    state: State<SharedVideoBuffer>,
    config: ViewportConfig
) -> Result<(), String> {
    println!("Initializing Viewport: {}x{}", config.width, config.height);
    
    let size = (config.width * config.height * 4) as usize;
    let mut buffer = state.0.write();
    
    buffer.buffer = vec![0; size];
    buffer.width = config.width;
    buffer.height = config.height;
    buffer.config = config;

    println!("Viewport initialized. Buffer size: {}", size);
    
    Ok(())
}

fn main() {
    let shared_buffer = SharedVideoBuffer(Arc::new(RwLock::new(VideoBuffer {
        buffer: Vec::new(),
        width: 0,
        height: 0,
        config: ViewportConfig {
            width: 0,
            height: 0,
            device_pixel_ratio: 1.0,
        },
    })));

    tauri::Builder::default()
        .manage(shared_buffer)
        .invoke_handler(tauri::generate_handler![
            get_shared_memory_info,
            initialize_viewport,
            draw_test_pattern
        ])
        .run(tauri::generate_context!())
        .expect("Error running Tauri application");
}