use std::sync::{Arc, Mutex};
use tauri::{State, Manager};
use std::mem;

struct CanvasMemory {
    memory_address: Option<usize>,
    width: u32,
    height: u32,
}

pub struct RenderState {
    canvas_memory: Mutex<CanvasMemory>,
}

impl Default for RenderState {
    fn default() -> Self {
        Self {
            canvas_memory: Mutex::new(CanvasMemory {
                memory_address: None,
                width: 800,
                height: 600,
            }),
        }
    }
}

static mut BUFFER: Option<Box<[u8]>> = None;

#[tauri::command]
fn set_canvas_memory(
    width: u32,
    height: u32,
    state: State<'_, Arc<Mutex<RenderState>>>
) -> Result<usize, String> {
    let mut render_state = state.lock().map_err(|_| "Failed to lock state")?;
    let mut canvas_memory = render_state.canvas_memory.lock().map_err(|_| "Failed to lock canvas memory")?;

    let total_pixels = (width * height * 4) as usize;

    unsafe {
        BUFFER = Some(vec![0u8; total_pixels].into_boxed_slice());
        let memory_address = BUFFER.as_ref().unwrap().as_ptr() as usize;
        canvas_memory.memory_address = Some(memory_address);
        canvas_memory.width = width;
        canvas_memory.height = height;
        println!("Canvas memory allocated at: {:#x}", memory_address);
        Ok(memory_address)
    }
}

fn render_to_canvas(state: &Arc<Mutex<RenderState>>) {
    let render_state = state.lock().unwrap();
    let canvas_memory = render_state.canvas_memory.lock().unwrap();
    
    if let Some(memory_address) = canvas_memory.memory_address {
        unsafe {
            let buffer_ptr = memory_address as *mut u8;
            let total_pixels = (canvas_memory.width * canvas_memory.height * 4) as usize;
            
            for i in 0..total_pixels {
                *buffer_ptr.add(i) = (i % 256) as u8; // Example gradient pattern
            }
        }
    }
}

fn main() {
    let render_state = Arc::new(Mutex::new(RenderState::default()));
    
    tauri::Builder::default()
        .manage(render_state.clone())
        .invoke_handler(tauri::generate_handler![set_canvas_memory])
        .setup(move |_app| {
            let state_clone = render_state.clone();
            std::thread::spawn(move || {
                loop {
                    render_to_canvas(&state_clone);
                    std::thread::sleep(std::time::Duration::from_millis(16)); // ~60 FPS
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
