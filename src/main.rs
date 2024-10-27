mod app;
mod components;
mod state;
mod theme;

pub use app::GameEngineUI;
pub use state::DockState;

pub fn init_ui() -> eframe::Result<()> {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([1920.0, 1080.0])
            .with_min_inner_size([800.0, 600.0]),
        ..Default::default()
    };

    eframe::run_native(
        "Pulsar Engine",
        options,
        Box::new(|cc| Ok(Box::new(GameEngineUI::default()))),
    )
}

fn main() {
    init_ui();
}