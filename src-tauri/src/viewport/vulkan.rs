use ash::{self, vk, Entry};
use log::{error, info};
use raw_window_handle::{HasRawWindowHandle, RawWindowHandle, HasRawDisplayHandle};
use std::ffi::CString;

pub struct VulkanState {
    pub instance: ash::Instance,
    pub device: ash::Device,
    pub physical_device: vk::PhysicalDevice,
    pub surface: vk::SurfaceKHR,
    pub surface_loader: ash::extensions::khr::Surface,
    pub swapchain: vk::SwapchainKHR,
    pub swapchain_loader: ash::extensions::khr::Swapchain,
    pub command_pool: vk::CommandPool,
    pub command_buffers: Vec<vk::CommandBuffer>,
    image_extent: vk::Extent2D,
    queue_family_index: u32,
    entry: Entry,
}

impl VulkanState {
    pub fn new<W: HasRawWindowHandle + HasRawDisplayHandle>(window: &W) -> Result<Self, Box<dyn std::error::Error>> {
        // Load Vulkan entry points
        let entry = unsafe { 
            Entry::load().map_err(|e| {
                error!("Failed to load Vulkan entry points: {:?}", e);
                format!("Failed to load Vulkan entry points: {:?}", e)
            })?
        };
        
        // Prepare application and engine names
        let app_name = CString::new("Vulkan Viewport")?;
        let engine_name = CString::new("No Engine")?;
        
        // Create application info
        let app_info = vk::ApplicationInfo::builder()
            .application_name(&app_name)
            .application_version(vk::make_api_version(0, 1, 0, 0))
            .engine_name(&engine_name)
            .engine_version(vk::make_api_version(0, 1, 0, 0))
            .api_version(vk::make_api_version(0, 1, 3, 0));
    
        // Get required extensions for the window system
        let extensions = ash_window::enumerate_required_extensions(window.raw_display_handle())
            .map_err(|e| {
                error!("Failed to enumerate required Vulkan extensions: {:?}", e);
                e
            })?;
    
        // Create Vulkan instance
        let instance = unsafe {
            let create_info = vk::InstanceCreateInfo::builder()
                .application_info(&app_info)
                .enabled_extension_names(&extensions);
            entry.create_instance(&create_info, None).map_err(|e| {
                error!("Failed to create Vulkan instance: {:?}", e);
                e
            })?
        };
    
        // Select physical device
        let physical_device = unsafe {
            instance.enumerate_physical_devices()
                .map_err(|e| {
                    error!("Failed to enumerate physical devices: {:?}", e);
                    e
                })?
                .into_iter()
                .next()
                .ok_or_else(|| {
                    error!("No physical device found");
                    "No physical device found"
                })?
        };
    
        // Create surface
        let surface = unsafe {
            ash_window::create_surface(
                &entry,
                &instance,
                window.raw_display_handle(),
                window.raw_window_handle(),
                None,
            ).map_err(|e| {
                error!("Failed to create surface: {:?}", e);
                e
            })?
        };
    
        // Create surface loader
        let surface_loader = ash::extensions::khr::Surface::new(&entry, &instance);
    
        // Find graphics queue family
        let queue_family_index = unsafe {
            instance
                .get_physical_device_queue_family_properties(physical_device)
                .into_iter()
                .enumerate()
                .find(|(_, properties)| {
                    properties.queue_flags.contains(vk::QueueFlags::GRAPHICS)
                })
                .map(|(index, _)| index as u32)
                .ok_or_else(|| {
                    error!("No graphics queue family found");
                    "No graphics queue family found"
                })?
        };
    
        // Prepare device queue creation info
        let queue_priorities = [1.0];
        let queue_info = vk::DeviceQueueCreateInfo::builder()
            .queue_family_index(queue_family_index)
            .queue_priorities(&queue_priorities);
    
        // Define device extensions and features
        let device_extensions = [ash::extensions::khr::Swapchain::name().as_ptr()];
        let device_features = vk::PhysicalDeviceFeatures::default();
        
        // Create logical device
        let device = unsafe {
            let device_create_info = vk::DeviceCreateInfo::builder()
                .queue_create_infos(std::slice::from_ref(&queue_info))
                .enabled_extension_names(&device_extensions)
                .enabled_features(&device_features);
    
            instance.create_device(physical_device, &device_create_info, None).map_err(|e| {
                error!("Failed to create logical device: {:?}", e);
                e
            })?
        };
    
        // Create swapchain loader
        let swapchain_loader = ash::extensions::khr::Swapchain::new(&instance, &device);
    
        // Get surface capabilities
        let surface_caps = unsafe {
            surface_loader.get_physical_device_surface_capabilities(physical_device, surface)
                .map_err(|e| {
                    error!("Failed to get surface capabilities: {:?}", e);
                    e
                })?
        };
        let image_extent = surface_caps.current_extent;
    
        // Create swapchain
        let swapchain = Self::create_swapchain(
            &device,
            &surface_loader,
            surface,
            physical_device,
            &swapchain_loader,
            image_extent,
        ).map_err(|e| {
            error!("Failed to create swapchain: {:?}", e);
            e
        })?;
    
        // Create command pool
        let command_pool = unsafe {
            let command_pool_info = vk::CommandPoolCreateInfo::builder()
                .queue_family_index(queue_family_index)
                .flags(vk::CommandPoolCreateFlags::RESET_COMMAND_BUFFER);
    
            device.create_command_pool(&command_pool_info, None).map_err(|e| {
                error!("Failed to create command pool: {:?}", e);
                e
            })?
        };
    
        // Allocate command buffers
        let command_buffers = unsafe {
            let alloc_info = vk::CommandBufferAllocateInfo::builder()
                .command_pool(command_pool)
                .level(vk::CommandBufferLevel::PRIMARY)
                .command_buffer_count(1);
    
            device.allocate_command_buffers(&alloc_info).map_err(|e| {
                error!("Failed to allocate command buffers: {:?}", e);
                e
            })?
        };
    
        // Log successful initialization
        info!("Vulkan state initialized successfully");
    
        Ok(Self {
            entry,
            instance,
            device,
            physical_device,
            surface,
            surface_loader,
            swapchain,
            swapchain_loader,
            command_pool,
            command_buffers,
            image_extent,
            queue_family_index,
        })
    }

    pub fn resize(&mut self, width: u32, height: u32) -> Result<(), Box<dyn std::error::Error>> {
        unsafe { self.device.device_wait_idle()? };

        let new_extent = vk::Extent2D { width, height };
        if new_extent == self.image_extent {
            return Ok(());
        }

        self.image_extent = new_extent;

        // Recreate swapchain
        let new_swapchain = Self::create_swapchain(
            &self.device,
            &self.surface_loader,
            self.surface,
            self.physical_device,
            &self.swapchain_loader,
            new_extent,
        )?;

        unsafe {
            // Destroy old swapchain
            self.swapchain_loader.destroy_swapchain(self.swapchain, None);
        }

        self.swapchain = new_swapchain;
        Ok(())
    }

    fn create_swapchain(
        device: &ash::Device,
        surface_loader: &ash::extensions::khr::Surface,
        surface: vk::SurfaceKHR,
        physical_device: vk::PhysicalDevice,
        swapchain_loader: &ash::extensions::khr::Swapchain,
        extent: vk::Extent2D,
    ) -> Result<vk::SwapchainKHR, Box<dyn std::error::Error>> {
        let surface_format = unsafe {
            surface_loader
                .get_physical_device_surface_formats(physical_device, surface)?
                .first()
                .ok_or("No surface formats available")?
                .clone()
        };

        let present_mode = unsafe {
            surface_loader
                .get_physical_device_surface_present_modes(physical_device, surface)?
                .first()
                .ok_or("No present modes available")?
                .clone()
        };

        let swapchain_create_info = vk::SwapchainCreateInfoKHR::builder()
            .surface(surface)
            .min_image_count(2)
            .image_format(surface_format.format)
            .image_color_space(surface_format.color_space)
            .image_extent(extent)
            .image_array_layers(1)
            .image_usage(vk::ImageUsageFlags::COLOR_ATTACHMENT)
            .pre_transform(vk::SurfaceTransformFlagsKHR::IDENTITY)
            .composite_alpha(vk::CompositeAlphaFlagsKHR::OPAQUE)
            .present_mode(present_mode);

        unsafe {
            swapchain_loader
                .create_swapchain(&swapchain_create_info, None)
                .map_err(|e| e.into())
        }
    }

    pub unsafe fn cleanup(&mut self) {
        self.device.device_wait_idle().ok();
        self.device.destroy_command_pool(self.command_pool, None);
        self.swapchain_loader.destroy_swapchain(self.swapchain, None);
        self.surface_loader.destroy_surface(self.surface, None);
        self.device.destroy_device(None);
        self.instance.destroy_instance(None);
    }
}

impl Drop for VulkanState {
    fn drop(&mut self) {
        unsafe { self.cleanup(); }
    }
}