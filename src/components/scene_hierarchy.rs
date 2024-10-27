use crate::state::AppState;

pub struct SceneHierarchy;

impl SceneHierarchy {
    pub fn show(ui: &mut egui::Ui, state: &mut AppState) {
        ui.add_space(4.0);
        ui.heading("Scene Hierarchy");
        ui.add_space(8.0);

        egui::ScrollArea::vertical().show(ui, |ui| {
            for object in &state.scene_objects {
                let response = ui.add(
                    egui::Button::new(object)
                        .fill(crate::theme::DARK_GRAY)
                        .min_size(egui::vec2(ui.available_width(), 24.0)),
                );

                if response.clicked() {
                    state.dock_state.selected_tab = "Properties".to_owned();
                    state.properties.clear();
                    state.properties.insert("Name".to_owned(), object.clone());
                    state.properties
                        .insert("Position".to_owned(), "0, 0, 0".to_owned());
                    state.properties
                        .insert("Rotation".to_owned(), "0, 0, 0".to_owned());
                }
            }

            if ui.button("➕ Add Object").clicked() {
                state.scene_objects
                    .push(format!("New Object {}", state.scene_objects.len()));
                state.console_logs
                    .push("New object added to scene".to_owned());
            }
        });
    }
}