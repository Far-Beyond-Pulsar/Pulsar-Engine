#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use log::info;
use parking_lot::RwLock;
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
            
            //std::thread::spawn(move || {
            //    let runtime = tokio::runtime::Runtime::new().unwrap();
            //    runtime.block_on(async {
            //        // Small delay to ensure window is ready
            //        tokio::time::sleep(Duration::from_millis(100)).await;
            //        
            //    });
            //});

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("Error while running application");
}