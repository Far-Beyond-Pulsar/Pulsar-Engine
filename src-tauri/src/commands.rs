use tauri::{State, Window};
use log::{info, debug};
use raw_window_handle::HasRawWindowHandle;
use crate::viewport::state::{ViewportState, ViewportConfig, ViewportCommand, VulkanHandle};

#[tauri::command]
pub async fn initialize_viewport(
    window: Window,
    state: State<'_, ViewportState>,
) -> Result<(), String> {
    info!("Initializing viewport");
    
    // Create platform-agnostic window handle
    let vulkan = VulkanHandle::new(&window)
        .map_err(|e| e.to_string())?;
    
    // Store the handle
    state.set_vulkan_handle(vulkan);

    Ok(())
}

#[tauri::command]
pub async fn update_native_viewport(
    state: State<'_, ViewportState>,
    config: ViewportConfig,
) -> Result<(), String> {
    debug!("Updating viewport: {:?}", config);
    state.send_command(ViewportCommand::UpdateConfig(config))
}

#[tauri::command]
pub async fn reset_viewport_camera(
    state: State<'_, ViewportState>,
) -> Result<(), String> {
    debug!("Resetting viewport camera");
    state.send_command(ViewportCommand::ResetCamera)
}