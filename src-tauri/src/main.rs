#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod viewport;
mod commands;

use log::info;
use tauri::Manager;
use viewport::state::ViewportState;

fn main() {
    env_logger::init();
    info!("Starting viewport application");

    tauri::Builder::default()
        .manage(ViewportState::new())
        .invoke_handler(tauri::generate_handler![
            commands::initialize_viewport,
            commands::update_native_viewport,
            commands::reset_viewport_camera
        ])
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
