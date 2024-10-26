#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(rustdoc::missing_crate_level_docs)]

use eframe::egui;
use egui::Theme;
use std::collections::HashMap;

const DARK_GRAY: egui::Color32 = egui::Color32::from_rgb(40, 40, 40);
const DARKER_GRAY: egui::Color32 = egui::Color32::from_rgb(30, 30, 30);
const TITLE_BAR_COLOR: egui::Color32 = egui::Color32::from_rgb(25, 25, 25);
const ACCENT_COLOR: egui::Color32 = egui::Color32::from_rgb(0, 120, 215);
const TAB_COLOR: egui::Color32 = egui::Color32::from_rgb(45, 45, 45);
const HOVER_COLOR: egui::Color32 = egui::Color32::from_rgb(60, 60, 60);

#[derive(Default)]
struct Tab {
    name: String,
    is_active: bool,
}

#[derive(Default)]
struct DockState {
    windows: HashMap<String, bool>,
    tabs: Vec<Tab>,
    selected_tab: String,
    panel_sizes: HashMap<String, f32>,
}

struct GameEngineUI {
    dock_state: DockState,
    scene_objects: Vec<String>,
    properties: HashMap<String, String>,
    console_logs: Vec<String>,
}

impl Default for GameEngineUI {
    fn default() -> Self {
        let mut windows = HashMap::new();
        windows.insert("Scene Hierarchy".to_owned(), true);
        windows.insert("Properties".to_owned(), true);
        windows.insert("Console".to_owned(), true);

        let mut panel_sizes = HashMap::new();
        panel_sizes.insert("left_panel".to_owned(), 250.0);
        panel_sizes.insert("right_panel".to_owned(), 300.0);
        panel_sizes.insert("bottom_panel".to_owned(), 200.0);

        let mut tabs = vec![
            Tab { name: "Scene".to_owned(), is_active: true },
            Tab { name: "Game".to_owned(), is_active: false },
        ];

        Self {
            dock_state: DockState {
                windows,
                tabs,
                selected_tab: "Scene".to_owned(),
                panel_sizes,
            },
            scene_objects: vec!["Main Camera".to_owned(), "Player".to_owned(), "Environment".to_owned()],
            properties: HashMap::new(),
            console_logs: vec!["Game engine initialized...".to_owned()],
        }
    }
}

impl GameEngineUI {
    fn configure_visuals(ctx: &egui::Context) {
        let mut visuals = egui::Visuals::dark();
        visuals.window_fill = DARKER_GRAY;
        visuals.panel_fill = DARK_GRAY;
        visuals.widgets.noninteractive.bg_fill = DARK_GRAY;
        visuals.widgets.inactive.bg_fill = DARK_GRAY;
        visuals.widgets.hovered.bg_fill = HOVER_COLOR;
        visuals.widgets.active.bg_fill = ACCENT_COLOR;
        ctx.set_visuals(visuals);
    }

    fn show_title_bar(&mut self, ui: &mut egui::Ui) {
        let title_bar_rect = ui.available_rect_before_wrap();
        ui.painter().rect_filled(title_bar_rect, 0.0, TITLE_BAR_COLOR);
        ui.horizontal(|ui| {
            ui.add_space(8.0);
            ui.heading("Pulsar Engine");
            ui.add_space(16.0);
        });
    }

    fn show_tabs(&mut self, ui: &mut egui::Ui) {
        ui.horizontal(|ui| {
            for tab in &mut self.dock_state.tabs {
                let button = egui::Button::new(&tab.name)
                    .fill(if tab.is_active { TAB_COLOR } else { DARKER_GRAY });
                if ui.add(button).clicked() {
                    // for t in &mut self.dock_state.tabs {
                    //     t.is_active = false;
                    // }
                    tab.is_active = true;
                    self.dock_state.selected_tab = tab.name.clone();
                }
            }
        });
    }

    fn show_scene_hierarchy(&mut self, ui: &mut egui::Ui) {
        ui.add_space(4.0);
        ui.heading("Scene Hierarchy");
        ui.add_space(8.0);
        
        egui::ScrollArea::vertical().show(ui, |ui| {
            for object in &self.scene_objects {
                let response = ui.add(
                    egui::Button::new(object)
                        .fill(DARK_GRAY)
                        .min_size(egui::vec2(ui.available_width(), 24.0))
                );
                
                if response.clicked() {
                    self.dock_state.selected_tab = "Properties".to_owned();
                    self.properties.clear();
                    self.properties.insert("Name".to_owned(), object.clone());
                    self.properties.insert("Position".to_owned(), "0, 0, 0".to_owned());
                    self.properties.insert("Rotation".to_owned(), "0, 0, 0".to_owned());
                }
            }
            
            if ui.button("➕ Add Object").clicked() {
                self.scene_objects.push(format!("New Object {}", self.scene_objects.len()));
                self.console_logs.push("New object added to scene".to_owned());
            }
        });
    }

    fn show_properties(&mut self, ui: &mut egui::Ui) {
        ui.add_space(4.0);
        ui.heading("Properties");
        ui.add_space(8.0);
        
        egui::ScrollArea::vertical().show(ui, |ui| {
            for (key, value) in &mut self.properties {
                ui.group(|ui| {
                    ui.set_width(ui.available_width());
                    ui.label(key);
                    ui.add_space(2.0);
                    let _ = ui.text_edit_singleline(value);
                });
                ui.add_space(4.0);
            }
        });
    }

    fn show_console(&mut self, ui: &mut egui::Ui) {
        ui.add_space(4.0);
        ui.horizontal(|ui| {
            ui.heading("Console");
            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                if ui.button("Clear").clicked() {
                    self.console_logs.clear();
                }
            });
        });
        ui.add_space(8.0);
        
        egui::ScrollArea::vertical()
            .stick_to_bottom(true)
            .show(ui, |ui| {
                for log in &self.console_logs {
                    ui.label(log);
                    ui.add_space(2.0);
                }
            });
    }

    fn show_game_view(&mut self, ui: &mut egui::Ui) {
        let is_scene_tab = self.dock_state.tabs.iter()
            .find(|t| t.name == "Scene")
            .map_or(false, |t| t.is_active);

        if is_scene_tab {
            ui.heading("Scene View");
        } else {
            ui.heading("Game View");
        }

        let available_size = ui.available_size();
        let (rect, _) = ui.allocate_exact_size(available_size, egui::Sense::hover());
        ui.painter().rect_filled(rect, 4.0, DARKER_GRAY);
        
        // Add a grid pattern for the scene view
        if is_scene_tab {
            let grid_color = egui::Color32::from_rgba_unmultiplied(255, 255, 255, 15);
            let grid_size = 20.0;
            let x_lines = (available_size.x / grid_size) as i32;
            let y_lines = (available_size.y / grid_size) as i32;
            
            for i in 0..=x_lines {
                let x = rect.min.x + (i as f32 * grid_size);
                ui.painter().line_segment(
                    [egui::pos2(x, rect.min.y), egui::pos2(x, rect.max.y)],
                    egui::Stroke::new(1.0, grid_color),
                );
            }
            
            for i in 0..=y_lines {
                let y = rect.min.y + (i as f32 * grid_size);
                ui.painter().line_segment(
                    [egui::pos2(rect.min.x, y), egui::pos2(rect.max.x, y)],
                    egui::Stroke::new(1.0, grid_color),
                );
            }
        }
    }
}

pub fn initUI() -> eframe::Result<()> {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([1920.0, 1080.0])
            .with_min_inner_size([800.0, 600.0]),
        //default_theme: Theme::Dark,
        ..Default::default()
    };

    eframe::run_native(
        "Pulsar Engine",
        options,
        Box::new(|cc| Ok(Box::new(GameEngineUI::default()))),
    )
}

impl eframe::App for GameEngineUI {
    fn update(&mut self, ctx: &egui::Context, frame: &mut eframe::Frame) {
        Self::configure_visuals(ctx);

        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            self.show_title_bar(ui);
            
            ui.add_space(4.0);
            egui::menu::bar(ui, |ui| {
                ui.menu_button("File", |ui| {
                    if ui.button("New Scene").clicked() {
                        self.scene_objects.clear();
                        self.console_logs.push("Created new scene".to_owned());
                        ui.close_menu();
                    }
                    if ui.button("Exit").clicked() {
        //                frame.quit();
                    }
                });
                ui.menu_button("View", |ui| {
                    for (name, shown) in &mut self.dock_state.windows {
                        ui.checkbox(shown, name);
                    }
                });
            });
            
            ui.add_space(4.0);
            self.show_tabs(ui);
        });

        let panel_margin = 4.0;
        
        egui::SidePanel::left("scene_hierarchy_panel")
            .default_width(250.0)
            .width_range(200.0..=400.0)
            .resizable(true)
            .show_animated(ctx, *self.dock_state.windows.get("Scene Hierarchy").unwrap_or(&false), |ui| {
                ui.set_min_width(200.0);
                self.show_scene_hierarchy(ui);
            });

        egui::SidePanel::right("properties_panel")
            .default_width(300.0)
            .width_range(250.0..=500.0)
            .resizable(true)
            .show_animated(ctx, *self.dock_state.windows.get("Properties").unwrap_or(&false), |ui| {
                ui.set_min_width(250.0);
                self.show_properties(ui);
            });

        egui::TopBottomPanel::bottom("console_panel")
            .default_height(200.0)
            .height_range(100.0..=400.0)
            .resizable(true)
            .show_animated(ctx, *self.dock_state.windows.get("Console").unwrap_or(&false), |ui| {
                self.show_console(ui);
            });

        egui::CentralPanel::default()
            .frame(egui::Frame::central_panel(&ctx.style()).inner_margin(panel_margin))
            .show(ctx, |ui| {
                self.show_game_view(ui);
            });
    }
}