#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod renderer;

use log::info;
use parking_lot::RwLock;
use renderer::WgpuContext;
use std::sync::Arc;
use tauri::Manager;
use tokio::time::Duration;

pub struct RenderState {
    context: Arc<RwLock<Option<WgpuContext<'static>>>>
}

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("Starting application");

    tauri::Builder::default()
        .setup(|app| {
            let _main_window = app.get_window("main").unwrap();
            
            let render_window = tauri::WindowBuilder::new(
                app,
                "render",
                tauri::WindowUrl::External(tauri::Url::parse("about:blank").unwrap())
            )
            .title("Render Window")
            .inner_size(800.0, 600.0)
            .build()
            .expect("Failed to create render window");

            // Create Arc'd handle that can be safely shared
            let handle = Arc::new(app.handle());
            
            // Use spawn_blocking for the render loop since it involves GPU work
            let render_handle = handle.clone();
            let render_window = render_window.clone();
            
            std::thread::spawn(move || {
                let runtime = tokio::runtime::Runtime::new().unwrap();
                runtime.block_on(async {
                    // Small delay to ensure window is ready
                    tokio::time::sleep(Duration::from_millis(100)).await;
                    
                    match WgpuContext::new(render_window.clone()).await {
                        Ok(ctx) => {
                            render_handle.manage(RenderState {
                                context: Arc::new(RwLock::new(Some(ctx)))
                            });
                            
                            // Set up window handlers
                            let state = render_handle.state::<RenderState>();
                            let window_clone = render_window.clone();
                            let event_handle = render_handle.clone();
                            
                            window_clone.on_window_event(move |event| {
                                if let tauri::WindowEvent::Resized(size) = event {
                                    if let Some(ctx) = event_handle.state::<RenderState>().context.write().as_mut() {
                                        ctx.resize(size.width, size.height);
                                    }
                                }
                            });

                            // Render loop
                            let mut last_frame = std::time::Instant::now();
                            
                            loop {
                                let now = std::time::Instant::now();
                                let _dt = now - last_frame;
                                last_frame = now;

                                if let Some(ctx) = state.context.write().as_mut() {
                                    match ctx.draw() {
                                        Ok(_) => {
                                            std::thread::sleep(Duration::from_millis(16));
                                        }
                                        Err(e) => {
                                            log::error!("Render error: {}", e);
                                            std::thread::sleep(Duration::from_millis(16));
                                        }
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