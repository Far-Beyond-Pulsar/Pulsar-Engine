use crate::viewport::state::{ViewportState, ViewportConfig, ViewportCommand, VulkanHandle};
use raw_window_handle::{HasRawDisplayHandle, HasRawWindowHandle, RawDisplayHandle, RawWindowHandle};
use crate::viewport::vulkan::VulkanState;
use tao::window::Window as TaoWindow;
use tauri::{State, Window, Manager};
use parking_lot::RwLock;
use log::{info, debug};
use std::sync::{atomic::AtomicBool, Arc};

#[tauri::command]
pub async fn initialize_viewport(
    window: Window,
    state: State<'_, ViewportState>,
) -> Result<(), String> {
    info!("Initializing viewport");
    
    // Get the raw window handle
    let raw_window_handle = window.raw_window_handle();
    
    // Create platform-agnostic window handle based on the raw handle
    let vulkan_handle = match raw_window_handle {
        #[cfg(target_os = "windows")]
        RawWindowHandle::Win32(handle) => VulkanHandle {
            hwnd: handle.hwnd as u64,
            is_active: Arc::new(AtomicBool::new(true)),
        },
        #[cfg(target_os = "linux")]
        RawWindowHandle::Xlib(handle) => VulkanHandle {
            xlib_window: handle.window as u64,
            is_active: Arc::new(AtomicBool::new(true)),
        },
        #[cfg(target_os = "macos")]
        RawWindowHandle::AppKit(handle) => VulkanHandle {
            ns_view: handle.ns_view as u64,
            is_active: Arc::new(AtomicBool::new(true)),
        },
        _ => return Err("Unsupported window system".to_string()),
    };
    
    // Store the handle
    state.set_vulkan_handle(vulkan_handle);

    // Create a thread-safe, nullable Vulkan state
    let vulkan_state = Arc::new(RwLock::new(None));

    // Create a custom wrapper that implements the required traits
    struct WindowHandleWrapper {
        raw_handle: RawWindowHandle,
    }

    unsafe impl HasRawWindowHandle for WindowHandleWrapper {
        fn raw_window_handle(&self) -> RawWindowHandle {
            self.raw_handle
        }
    }

    unsafe impl HasRawDisplayHandle for WindowHandleWrapper {
        fn raw_display_handle(&self) -> RawDisplayHandle {
            #[cfg(target_os = "windows")]
            return RawDisplayHandle::Windows(raw_window_handle::WindowsDisplayHandle::empty());
            #[cfg(target_os = "linux")]
            return RawDisplayHandle::Xlib(raw_window_handle::XlibDisplayHandle::empty());
            #[cfg(target_os = "macos")]
            return RawDisplayHandle::AppKit(raw_window_handle::AppKitDisplayHandle::empty());
        }
    }

    let handle_wrapper = WindowHandleWrapper {
        raw_handle: raw_window_handle,
    };

    // Attempt to create Vulkan state
    match VulkanState::new(&handle_wrapper) {
        Ok(state_instance) => {
            *vulkan_state.write() = Some(state_instance);
        },
        Err(e) => {
            return Err(format!("Failed to initialize Vulkan state: {}", e));
        }
    }

    // Start the render loop
    let running = state.running.clone();
    let receiver = state.command_receiver.clone();
    let render_thread = crate::viewport::renderer::RenderLoop::start(
        running, 
        receiver, 
        vulkan_state.clone(),
    );
    
    state.set_render_thread(render_thread);

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