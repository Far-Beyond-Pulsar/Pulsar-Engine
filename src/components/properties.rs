
use crate::state::AppState;

pub struct Properties;

impl Properties {
    pub fn show(ui: &mut egui::Ui, state: &mut AppState) {
        ui.add_space(4.0);
        ui.heading("Properties");
        ui.add_space(8.0);

        if state.properties.is_empty() {
            ui.centered_and_justified(|ui| {
                ui.label("No object selected");
            });
            return;
        }

        egui::ScrollArea::vertical().show(ui, |ui| {
            let keys = vec!["Name", "Position", "Rotation", "Scale"];
            
            for key in keys {
                let value = state.properties.entry(key.to_owned()).or_insert_with(|| {
                    match key {
                        "Name" => "Unnamed Object".to_owned(),
                        "Position" | "Rotation" => "0, 0, 0".to_owned(),
                        "Scale" => "1, 1, 1".to_owned(),
                        _ => String::new(),
                    }
                });

                ui.group(|ui| {
                    ui.set_width(ui.available_width());
                    ui.label(key);
                    ui.add_space(2.0);
                    
                    let response = ui.text_edit_singleline(value);
                    
                    if response.changed() {
                        state.console_logs.push(format!("Modified {} property", key));
                    }
                });
                
                ui.add_space(4.0);
            }

            // Add custom properties section
            ui.add_space(8.0);
            ui.separator();
            ui.add_space(4.0);
            ui.heading("Custom Properties");
            
            if ui.button("+ Add Property").clicked() {
                let new_key = format!("Property {}", state.properties.len());
                state.properties.insert(new_key, "New Value".to_owned());
            }
        });
    }
}