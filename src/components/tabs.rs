use crate::state::AppState;
use crate::theme;
use egui::{Ui, PointerButton};

pub struct Tabs;

impl Tabs {
    pub fn show(ui: &mut Ui, state: &mut AppState) {
        ui.horizontal(|ui| {
            // New tab button
            let new_button = ui.button("+ New");
            if new_button.clicked_by(PointerButton::Primary) {
                state.dock_state.tabs.push(crate::state::Tab::new(&format!(
                    "Tab {}",
                    state.dock_state.tabs.len() + 1
                )));
            }

            ui.separator();

            // Tab list with scrolling
            egui::ScrollArea::horizontal()
                .id_salt("tabs_scroll_area")
                .show(ui, |ui| {
                    let tabs_len = state.dock_state.tabs.len();
                    let mut tab_to_remove = None;
                    
                    for i in 0..tabs_len {
                        let is_selected = state.dock_state.tabs[i].name == state.dock_state.selected_tab;
                        let tab_name = state.dock_state.tabs[i].name.clone();
                        
                        let button = egui::Button::new(&tab_name)
                            .fill(if is_selected {
                                theme::ACCENT_COLOR
                            } else {
                                theme::TAB_COLOR
                            });

                        let response = ui.add(button);

                        // Handle click
                        if response.clicked() {
                            state.dock_state.selected_tab = tab_name.clone();
                        }

                        // Context menu
                        response.context_menu(|ui| {
                            if ui.button("Rename").clicked() {
                                // TODO: Implement rename functionality
                                ui.close_menu();
                            }
                            
                            if ui.button("Close").clicked() {
                                // Don't close if it's the last tab
                                if tabs_len > 1 {
                                    tab_to_remove = Some(tab_name.clone());
                                }
                                ui.close_menu();
                            }
                        });

                        // Add small spacing between tabs
                        ui.add_space(4.0);
                    }

                    // Handle tab removal outside the iteration
                    if let Some(tab_name) = tab_to_remove {
                        state.dock_state.tabs.retain(|t| t.name != tab_name);
                        if state.dock_state.selected_tab == tab_name {
                            state.dock_state.selected_tab = state.dock_state.tabs[0].name.clone();
                        }
                    }
                });
        });
    }
}