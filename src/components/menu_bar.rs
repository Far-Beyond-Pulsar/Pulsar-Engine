use crate::state::AppState;

pub struct MenuBar;

impl MenuBar {
    pub fn show(ui: &mut egui::Ui, state: &mut AppState) {
        egui::menu::bar(ui, |ui| {
            ui.menu_button("File", |ui| Self::file_menu(ui, state));
            ui.menu_button("Edit", |ui| Self::edit_menu(ui, state));
            ui.menu_button("View", |ui| Self::view_menu(ui, state));
            ui.menu_button("Git", |ui| Self::git_menu(ui));
            ui.menu_button("Project", |ui| Self::project_menu(ui));
            ui.menu_button("Build", |ui| Self::build_menu(ui));
            ui.menu_button("Debug", |ui| Self::debug_menu(ui));
            ui.menu_button("Tools", |ui| Self::tools_menu(ui));
            ui.menu_button("Window", |ui| Self::window_menu(ui));
            ui.menu_button("Help", |ui| Self::help_menu(ui));
        });
    }

    fn file_menu(ui: &mut egui::Ui, state: &mut AppState) {
        if ui.button("New Scene").clicked() {
            state.scene_objects.clear();
            state.console_logs.push("Created new scene".to_owned());
            ui.close_menu();
        }
        if ui.button("Exit").clicked() {
            std::process::exit(0);
        }
        ui.separator();
        ui.menu_button("Recent Files", |ui| {
            if ui.button("Test Game 1").clicked() {}
            if ui.button("Test Game 2").clicked() {}
            if ui.button("Test Game 3").clicked() {}
        });
        ui.separator();
        if ui.button("Save").clicked() {}
        if ui.button("Save As...").clicked() {}
        if ui.button("Save All").clicked() {}
    }

    fn edit_menu(ui: &mut egui::Ui, state: &mut AppState) {
        if ui.button("Undo").clicked() {}
        if ui.button("Redo").clicked() {}
        ui.separator();
        if ui.button("Cut").clicked() {}
        if ui.button("Copy").clicked() {}
        if ui.button("Paste").clicked() {}
        ui.separator();
        ui.menu_button("Go to...", |ui| {
            if ui.button("Go to All").clicked() {}
            if ui.button("Go to File").clicked() {}
            if ui.button("Go to Symbol").clicked() {}
        });
    }

    fn view_menu(ui: &mut egui::Ui, state: &mut AppState) {
        for (name, shown) in &mut state.dock_state.windows {
            ui.checkbox(shown, name);
        }
    }

    fn git_menu(ui: &mut egui::Ui) {
        if ui.button("Create Commit").clicked() {}
        if ui.button("Pull from remote").clicked() {}
        if ui.button("Push to remote").clicked() {}
    }

    fn project_menu(ui: &mut egui::Ui) {
        if ui.button("New Wave Graph").clicked() {}
        if ui.button("New Rust Module").clicked() {}
        if ui.button("New Plugin").clicked() {}
        ui.separator();
        if ui.button("Compile Project").clicked() {}
    }

    fn build_menu(ui: &mut egui::Ui) {
        if ui.button("Build All").clicked() {}
        if ui.button("Build Lights").clicked() {}
        if ui.button("Build Reflections").clicked() {}
    }

    fn debug_menu(ui: &mut egui::Ui) {
        if ui.button("Start Debugging").clicked() {}
        if ui.button("Step Over").clicked() {}
        if ui.button("Step Into").clicked() {}
    }

    fn tools_menu(ui: &mut egui::Ui) {
        if ui.button("Options").clicked() {}
        if ui.button("Extensions").clicked() {}
    }

    fn window_menu(ui: &mut egui::Ui) {
        if ui.button("New Window").clicked() {}
        if ui.button("Split Editor").clicked() {}
    }

    fn help_menu(ui: &mut egui::Ui) {
        if ui.button("Documentation").clicked() {}
        if ui.button("About").clicked() {}
    }
}