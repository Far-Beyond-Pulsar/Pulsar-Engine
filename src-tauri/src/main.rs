use tauri::{State, Runtime, Manager};
use serde::{Serialize, Deserialize};
use log::{info, debug, error};
use std::{
    sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}},
    thread::{self, JoinHandle},
    time::{Duration, Instant},
};
use parking_lot::RwLock;
use crossbeam_channel::{bounded, Sender, Receiver};

const TARGET_FPS: u64 = 60;
const FRAME_TIME: Duration = Duration::from_nanos(1_000_000_000 / TARGET_FPS);
const BUFFER_UPDATE_CHANNEL_SIZE: usize = 2;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ViewportConfig {
    width: u32,
    height: u32,
    device_pixel_ratio: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ViewportStatus {
    width: u32,
    height: u32,
    buffer_size: usize,
    device_pixel_ratio: f64,
    fps: f64,
    frame_time: f64,
}

#[derive(Debug)]
pub struct ViewportState {
    width: u32,
    height: u32,
    buffer: Arc<RwLock<Vec<u8>>>,
    device_pixel_ratio: f64,
    shared_buffer_ptr: usize,
    playing: Arc<AtomicBool>,  // Wrapped in Arc
    last_frame_time: Arc<RwLock<Instant>>,
    frame_times: Arc<RwLock<Vec<Duration>>>,
    render_thread: Option<JoinHandle<()>>,
    update_sender: Option<Sender<UpdateCommand>>,
}

enum UpdateCommand {
    UpdateFrame,
    Stop,
}

impl ViewportState {
    fn new() -> Self {
        Self {
            width: 0,
            height: 0,
            buffer: Arc::new(RwLock::new(Vec::new())),
            device_pixel_ratio: 1.0,
            shared_buffer_ptr: 0,
            playing: Arc::new(AtomicBool::new(true)),  // Initialize with Arc
            last_frame_time: Arc::new(RwLock::new(Instant::now())),
            frame_times: Arc::new(RwLock::new(Vec::with_capacity(120))),
            render_thread: None,
            update_sender: None,
        }
    }

    fn get_status(&self) -> ViewportStatus {
        ViewportStatus {
            width: self.width,
            height: self.height,
            buffer_size: self.buffer.read().len(),
            device_pixel_ratio: self.device_pixel_ratio,
            fps: self.calculate_fps(),
            frame_time: self.calculate_average_frame_time(),
        }
    }

    fn calculate_fps(&self) -> f64 {
        let frame_times = self.frame_times.read();
        if frame_times.is_empty() {
            return 0.0;
        }
        
        let avg_frame_time = frame_times.iter().sum::<Duration>() / frame_times.len() as u32;
        1.0 / avg_frame_time.as_secs_f64()
    }

    fn calculate_average_frame_time(&self) -> f64 {
        let frame_times = self.frame_times.read();
        if frame_times.is_empty() {
            return 0.0;
        }
        
        let avg_frame_time = frame_times.iter().sum::<Duration>() / frame_times.len() as u32;
        avg_frame_time.as_secs_f64() * 1000.0 // Convert to milliseconds
    }

    fn fill_buffer(&self, color: [u8; 4]) {
        let mut buffer = self.buffer.write();
        for chunk in buffer.chunks_mut(4) {
            chunk.copy_from_slice(&color);
        }
    }

    fn resize(&mut self, width: u32, height: u32, device_pixel_ratio: f64) {
        let buffer_size = (width * height * 4) as usize;
        self.width = width;
        self.height = height;
        self.device_pixel_ratio = device_pixel_ratio;
        
        // Initialize buffer
        let mut buffer = Vec::with_capacity(buffer_size);
        buffer.resize(buffer_size, 0);
        *self.buffer.write() = buffer;

        // Store buffer pointer for shared memory
        self.shared_buffer_ptr = self.buffer.read().as_ptr() as usize;
    }

    fn stop_render_thread(&mut self) {
        if let Some(sender) = self.update_sender.take() {
            let _ = sender.send(UpdateCommand::Stop);
        }
        
        if let Some(handle) = self.render_thread.take() {
            let _ = handle.join();
        }
    }
}

impl Drop for ViewportState {
    fn drop(&mut self) {
        self.stop_render_thread();
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
        return Err("Invalid viewport dimensions".to_string());
    }
    
    viewport.resize(config.width, config.height, config.device_pixel_ratio);
    
    Ok(viewport.get_status())
}

#[tauri::command]
async fn setup_shared_memory(
    window: tauri::Window,
    config: ViewportConfig,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<usize, String> {
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    viewport.resize(config.width, config.height, config.device_pixel_ratio);
    Ok(viewport.shared_buffer_ptr)
}

#[tauri::command]
async fn start_frame_updates(
    window: tauri::Window,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<(), String> {
    // Clone the Arc to move into the thread
    let state_clone = Arc::clone(&state.inner());
    let window_clone = window.clone();
    
    // Get viewport to set up channels and initial state
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    let (tx, rx) = bounded(BUFFER_UPDATE_CHANNEL_SIZE);
    viewport.update_sender = Some(tx.clone());
    
    // Clone necessary Arc references
    let buffer = Arc::clone(&viewport.buffer);
    let frame_times = Arc::clone(&viewport.frame_times);
    let playing = viewport.playing.clone();

    // Start render thread
    let render_thread = thread::spawn(move || {
        let mut frame_count = 0u64;
        let mut last_frame_time = Instant::now();

        while let Ok(UpdateCommand::UpdateFrame) = rx.recv() {
            if !playing.load(Ordering::Relaxed) {
                continue;
            }

            let now = Instant::now();
            let frame_duration = now - last_frame_time;

            // Maintain target frame rate
            if frame_duration < FRAME_TIME {
                thread::sleep(FRAME_TIME - frame_duration);
                continue;
            }

            // Update frame timing statistics
            {
                let mut frame_times = frame_times.write();
                frame_times.push(frame_duration);
                if frame_times.len() > 120 {
                    frame_times.remove(0);
                }
            }

            // Create a color that changes over time
            let color = [
                255,
                255,
                255,
                0,
            ];
            
            // Update buffer with new color
            {
                let mut buffer = buffer.write();
                for chunk in buffer.chunks_mut(4) {
                    chunk.copy_from_slice(&color);
                }
            }

            // Notify frontend
            if let Err(e) = window_clone.emit(
                "shared-memory-update",
                buffer.read().as_ptr() as usize
            ) {
                error!("Failed to emit shared-memory-update event: {}", e);
                break;
            }

            frame_count = frame_count.wrapping_add(1);
            last_frame_time = now;
        }
    });

    // Start update loop in a separate thread
    let _update_loop = thread::spawn(move || {
        loop {
            if let Err(_) = tx.send(UpdateCommand::UpdateFrame) {
                break;
            }
            thread::sleep(Duration::from_millis(8)); // ~60 FPS
        }
    });

    // Store render thread
    viewport.render_thread = Some(render_thread);

    Ok(())
}

#[tauri::command]
async fn toggle_play(
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<bool, String> {
    let viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    let new_state = !viewport.playing.load(Ordering::Relaxed);
    viewport.playing.store(new_state, Ordering::Relaxed);
    Ok(new_state)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResizeConfig {
    width: u32,
    height: u32,
    device_pixel_ratio: f64,
}

#[tauri::command]
async fn resize_viewport(
    window: tauri::Window,
    config: ResizeConfig,
    state: State<'_, Arc<Mutex<ViewportState>>>,
) -> Result<ViewportStatus, String> {
    // Get lock on viewport state
    let mut viewport = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // Validate dimensions
    if config.width == 0 || config.height == 0 {
        return Err("Invalid viewport dimensions".to_string());
    }
    
    info!("Resizing viewport to {}x{} with DPR {}", 
          config.width, config.height, config.device_pixel_ratio);
    
    // Perform resize
    viewport.resize(config.width, config.height, config.device_pixel_ratio);
    
    // Emit event to frontend with new buffer pointer
    if let Err(e) = window.emit(
        "shared-memory-update",
        viewport.shared_buffer_ptr
    ) {
        error!("Failed to emit shared-memory-update event: {}", e);
        return Err("Failed to notify frontend of resize".to_string());
    }
    
    // Return new viewport status
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
            setup_shared_memory,
            start_frame_updates,
            toggle_play,
            resize_viewport,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}