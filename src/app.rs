use crate::{
    components::*,
    state::AppState,
    theme,
};

pub struct GameEngineUI {
    state: AppState,
}

impl Default for GameEngineUI {
    fn default() -> Self {
        Self {
            state: AppState {
                dock_state: crate::state::DockState::new(),
                scene_objects: vec![
                    "Main Camera".to_owned(),
                    "Player".to_owned(),
                    "Environment".to_owned(),
                ],
                properties: Default::default(),
                console_logs: vec!["Game engine initialized...".to_owned()],
            },
        }
    }
}

impl eframe::App for GameEngineUI {
    fn update(&mut self, ctx: &egui::Context, frame: &mut eframe::Frame) {
        theme::configure_visuals(ctx);

        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            TitleBar::show(ui);
            ui.add_space(4.0);
            MenuBar::show(ui, &mut self.state);
            ui.add_space(4.0);
            Tabs::show(ui, &mut self.state);
        });

        egui::SidePanel::left("scene_hierarchy_panel")
            .default_width(250.0)
            .width_range(200.0..=400.0)
            .resizable(true)
            .show_animated(
                ctx,
                *self.state.dock_state.windows.get("Scene Hierarchy").unwrap_or(&false),
                |ui| {
                    ui.set_min_width(200.0);
                    SceneHierarchy::show(ui, &mut self.state);
                },
            );

        egui::SidePanel::right("properties_panel")
            .default_width(300.0)
            .width_range(250.0..=500.0)
            .resizable(true)
            .show_animated(
                ctx,
                *self.state.dock_state.windows.get("Properties").unwrap_or(&false),
                |ui| {
                    ui.set_min_width(250.0);
                    Properties::show(ui, &mut self.state);
                },
            );

        egui::TopBottomPanel::bottom("console_panel")
            .default_height(200.0)
            .height_range(100.0..=400.0)
            .resizable(true)
            .show_animated(
                ctx,
                *self.state.dock_state.windows.get("Console").unwrap_or(&false),
                |ui| {
                    Console::show(ui, &mut self.state);
                },
            );

        egui::CentralPanel::default().show(ctx, |ui| {
            //GameView::show(ui, &mut self.state);
        });
    }
}