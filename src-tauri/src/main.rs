#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod renderer;

use log::info;
use parking_lot::RwLock;
use renderer::WgpuContext;
use std::sync::Arc;
use tauri::Manager;
use tokio::time::{interval, Duration};

pub struct RenderState {
    context: Arc<RwLock<Option<WgpuContext<'static>>>>
}

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("Starting application");

    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            let handle = app.handle();
            
            // Spawn the render thread
            std::thread::spawn(move || {
                let handle = handle.clone();
                let runtime = tokio::runtime::Runtime::new().unwrap();
                runtime.block_on(async {
                    match WgpuContext::new(window.clone()).await {
                        Ok(ctx) => {
                            // Create RenderState with named field
                            let handle = Box::leak(Box::new(handle));
                            handle.manage(RenderState {
                                context: Arc::new(RwLock::new(Some(ctx)))
                            });
                            
                            // Set up window handlers
                            let state = handle.state::<RenderState>();
                            let window_clone = window.clone();
                            window_clone.on_window_event(move |event| {
                                if let tauri::WindowEvent::Resized(size) = event {
                                    if let Some(ctx) = state.context.write().as_mut() {
                                        ctx.resize(size.width, size.height);
                                    }
                                }
                            });

                            // Set up render loop with fixed timestep
                            let state = handle.state::<RenderState>();
                            let mut interval = interval(Duration::from_millis(16)); // ~60 FPS
                            
                            loop {
                                interval.tick().await;
                                if let Some(ctx) = state.context.write().as_mut() {
                                    if let Err(e) = ctx.draw() {
                                        log::error!("Render error: {}", e);
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            log::error!("Failed to create render context: {}", e);
                        }
                    }
                });
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("Error while running application");
}