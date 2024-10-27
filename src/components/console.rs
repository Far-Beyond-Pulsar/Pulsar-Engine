use crate::state::AppState;
use crate::theme;

pub struct Console;

impl Console {
    pub fn show(ui: &mut egui::Ui, state: &mut AppState) {
        ui.add_space(4.0);
        
        // Console header with controls
        ui.horizontal(|ui| {
            ui.heading("Console");
            
            ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                if ui.button("Clear").clicked() {
                    state.console_logs.clear();
                }
                
                if ui.button("Copy").clicked() {
                    let log_text = state.console_logs.join("\n");
                    ui.output_mut(|o| o.copied_text = log_text);
                }
                
                // Filter dropdown
                egui::ComboBox::from_label("")
                    .selected_text("All logs")
                    .show_ui(ui, |ui| {
                        ui.selectable_value(&mut (), (), "All logs");
                        ui.selectable_value(&mut (), (), "Errors only");
                        ui.selectable_value(&mut (), (), "Warnings only");
                    });
            });
        });
        
        ui.add_space(8.0);

        // Console output area
        egui::ScrollArea::vertical()
            .stick_to_bottom(true)
            .show(ui, |ui| {
                for (index, log) in state.console_logs.iter().enumerate() {
                    let is_error = log.to_lowercase().contains("error");
                    let is_warning = log.to_lowercase().contains("warning");
                    
                    ui.horizontal(|ui| {
                        // Timestamp
                        ui.label(format!("[{}]", Self::format_timestamp(index)));
                        
                        // Log level indicator
                        let (text, color) = if is_error {
                            ("ERROR", egui::Color32::RED)
                        } else if is_warning {
                            ("WARN", egui::Color32::YELLOW)
                        } else {
                            ("INFO", egui::Color32::GREEN)
                        };
                        
                        ui.colored_label(color, text);
                        
                        // Log message
                        ui.label(log);
                    });
                    
                    ui.add_space(2.0);
                }
            });

        // Input area
        ui.add_space(4.0);
        ui.horizontal(|ui| {
            let mut command = String::new();
            let text_edit = ui.text_edit_singleline(&mut command);
            
            if text_edit.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter)) {
                if !command.is_empty() {
                    state.console_logs.push(format!("> {}", command));
                }
            }
            
            if ui.button("Send").clicked() && !command.is_empty() {
                state.console_logs.push(format!("> {}", command));
            }
        });
    }

    fn format_timestamp(index: usize) -> String {
        // This is a placeholder - in a real app, you'd use actual timestamps
        format!("{:02}:{:02}:{:02}", index % 24, index % 60, index % 60)
    }
}