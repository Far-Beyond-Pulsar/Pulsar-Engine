// use bevy::{
//     prelude::*,
//     render::{
//         render_resource::{
//             Extent3d, TextureDescriptor, TextureDimension, TextureFormat,
//             TextureUsages,
//         },
//         renderer::RenderDevice,
//     },
//     window::WindowPlugin,
// };
// use std::sync::Arc;
// use parking_lot::RwLock;
// use serde::{Serialize, Deserialize};

// // State management for the renderer
// #[derive(Default)]
// pub struct RendererState {
//     pub buffer: Arc<RwLock<Vec<u8>>>,
//     pub width: u32,
//     pub height: u32,
// }

// // Plugin for Bevy integration
// pub struct ViewportRenderPlugin;

// impl Plugin for ViewportRenderPlugin {
//     fn build(&self, app: &mut App) {
//         app.insert_resource(RendererState::default())
//             .add_systems(Update, update_viewport);
//     }
// }

// // Viewport update system
// fn update_viewport(
//     mut images: ResMut<Assets<Image>>,
//     mut state: ResMut<RendererState>,
// ) {
//     let mut buffer = state.buffer.write();
//     // Update viewport rendering logic here
// }

// // Viewport interaction types
// #[derive(Debug, Serialize, Deserialize)]
// pub struct ViewportEvent {
//     pub event_type: String,
//     pub x: f32,
//     pub y: f32,
//     pub button: Option<i32>,
//     pub delta: Option<f32>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct ViewportObject {
//     pub id: String,
//     pub object_type: String,
//     pub position: [f32; 3],
//     pub rotation: [f32; 3],
//     pub scale: [f32; 3],
// }

// // Main renderer struct
// pub struct BevyRenderer {
//     app: App,
//     render_state: RendererState,
// }

// impl BevyRenderer {
//     pub fn new(width: u32, height: u32) -> Self {
//         let mut app = App::new();
//         let buffer_size = (width * height * 4) as usize;
//         let render_state = RendererState {
//             buffer: Arc::new(RwLock::new(vec![0; buffer_size])),
//             width,
//             height,
//         };

//         app.add_plugins(MinimalPlugins)
//             .add_plugins(ViewportRenderPlugin);

//         Self {
//             app,
//             render_state,
//         }
//     }

//     pub fn update(&mut self) {
//         self.app.update();
//     }

//     pub fn resize(&mut self, width: u32, height: u32) {
//         let buffer_size = (width * height * 4) as usize;
//         self.render_state.buffer = Arc::new(RwLock::new(vec![0; buffer_size]));
//         self.render_state.width = width;
//         self.render_state.height = height;
//     }

//     pub fn handle_event(&mut self, event: ViewportEvent) -> Result<(), String> {
//         // Handle viewport events (mouse, keyboard, etc.)
//         Ok(())
//     }

//     pub fn get_frame_data(&self) -> Vec<u8> {
//         self.render_state.buffer.read().clone()
//     }
// }

// // Tauri command handlers
// #[tauri::command]
// async fn initialize_viewport(
//     width: u32, 
//     height: u32,
//     state: tauri::State<'_, Arc<parking_lot::RwLock<BevyRenderer>>>,
// ) -> Result<(), String> {
//     let mut renderer = BevyRenderer::new(width, height);
//     *state.write() = renderer;
//     Ok(())
// }

// #[tauri::command]
// async fn handle_viewport_event(
//     event: ViewportEvent,
//     state: tauri::State<'_, Arc<parking_lot::RwLock<BevyRenderer>>>,
// ) -> Result<(), String> {
//     state.write().handle_event(event)
// }


// #[tauri::command]
// async fn get_frame_data(
//     state: tauri::State<'_, Arc<parking_lot::RwLock<BevyRenderer>>>,
// ) -> Result<Vec<u8>, String> {
//     Ok(state.read().get_frame_data())
// }

// #[tauri::command]
// async fn resize_viewport(
//     width: u32,
//     height: u32,
//     state: tauri::State<'_, Arc<parking_lot::RwLock<BevyRenderer>>>,
// ) -> Result<(), String> {
//     state.write().resize(width, height);
//     Ok(())
// }