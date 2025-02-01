use std::{
    sync::{Arc, atomic::{AtomicBool, Ordering}},
    thread,
    time::Duration,
};
use crossbeam_channel::Receiver;
use log::debug;
use super::state::{ViewportConfig, ViewportCommand};
use crate::viewport::vulkan::VulkanState;
use parking_lot::RwLock;

pub struct RenderLoop;

impl RenderLoop {
    pub fn start(
        running: Arc<AtomicBool>,
        receiver: Receiver<ViewportCommand>,
        vulkan: Arc<RwLock<Option<VulkanState>>>,
    ) -> thread::JoinHandle<()> {
        thread::spawn(move || {
            while running.load(Ordering::Relaxed) {
                // Handle viewport updates
                while let Ok(cmd) = receiver.try_recv() {
                    match cmd {
                        ViewportCommand::UpdateConfig(config) => {
                            if let Some(vulkan) = vulkan.write().as_mut() {
                                if let Err(e) = vulkan.resize(config.width, config.height) {
                                    debug!("Failed to resize viewport: {}", e);
                                }
                            }
                        }
                        ViewportCommand::ResetCamera => {
                            // Handle camera reset
                        }
                        ViewportCommand::Shutdown => {
                            debug!("Shutting down render loop");
                            return;
                        }
                    }
                }

                // Render frame if vulkan state exists
                if let Some(_vulkan) = vulkan.read().as_ref() {
                    // Render frame
                }

                thread::sleep(Duration::from_millis(16));
            }
        })
    }
}