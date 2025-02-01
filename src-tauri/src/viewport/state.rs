use serde::{Serialize, Deserialize};
use std::{
    sync::{Arc, atomic::{AtomicBool, Ordering}},
    thread::JoinHandle,
};
use parking_lot::RwLock;
use crossbeam_channel::{bounded, Sender, Receiver};
use raw_window_handle::{HasRawWindowHandle, RawWindowHandle};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ViewportConfig {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub device_pixel_ratio: f64,
}

// Platform-agnostic window handle storage
#[derive(Clone)]
pub struct VulkanHandle {
    #[cfg(target_os = "windows")]
    pub(crate) hwnd: u64,
    #[cfg(target_os = "linux")]
    pub(crate) xlib_window: u64,
    #[cfg(target_os = "macos")]
    pub(crate) ns_view: u64,
    pub(crate) is_active: Arc<AtomicBool>,
}

impl VulkanHandle {
    pub fn new<W: HasRawWindowHandle>(window: &W) -> Result<Self, Box<dyn std::error::Error>> {
        let raw_handle = window.raw_window_handle();
        
        Ok(match raw_handle {
            #[cfg(target_os = "windows")]
            RawWindowHandle::Win32(handle) => Self {
                hwnd: handle.hwnd as u64,
                is_active: Arc::new(AtomicBool::new(true)),
            },
            #[cfg(target_os = "linux")]
            RawWindowHandle::Xlib(handle) => Self {
                xlib_window: handle.window as u64,
                is_active: Arc::new(AtomicBool::new(true)),
            },
            #[cfg(target_os = "macos")]
            RawWindowHandle::AppKit(handle) => Self {
                ns_view: handle.ns_view as u64,
                is_active: Arc::new(AtomicBool::new(true)),
            },
            _ => return Err("Unsupported window system".into()),
        })
    }
}

#[derive(Clone)]
pub enum ViewportCommand {
    UpdateConfig(ViewportConfig),
    ResetCamera,
    Shutdown,
}

pub struct ViewportState {
    config: RwLock<ViewportConfig>,
    vulkan_handle: RwLock<Option<VulkanHandle>>,
    render_thread: RwLock<Option<JoinHandle<()>>>,
    running: Arc<AtomicBool>,
    command_sender: Sender<ViewportCommand>,
    command_receiver: Receiver<ViewportCommand>,
}

impl ViewportState {
    pub fn new() -> Self {
        let (sender, receiver) = bounded(10);
        Self {
            config: RwLock::new(ViewportConfig {
                x: 0,
                y: 0,
                width: 800,
                height: 600,
                device_pixel_ratio: 1.0,
            }),
            vulkan_handle: RwLock::new(None),
            render_thread: RwLock::new(None),
            running: Arc::new(AtomicBool::new(true)),
            command_sender: sender,
            command_receiver: receiver,
        }
    }
    
    pub fn set_vulkan_handle(&self, handle: VulkanHandle) {
        *self.vulkan_handle.write() = Some(handle);
    }
    
    pub fn send_command(&self, cmd: ViewportCommand) -> Result<(), String> {
        self.command_sender.send(cmd)
            .map_err(|e| e.to_string())
    }
    
    pub fn set_render_thread(&self, thread: JoinHandle<()>) {
        *self.render_thread.write() = Some(thread);
    }
}
