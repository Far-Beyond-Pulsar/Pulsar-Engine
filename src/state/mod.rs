use std::collections::HashMap;

#[derive(Default)]
pub struct Tab {
    pub name: String,
    pub is_active: bool,
}

impl Tab {
    pub fn new(name: &str) -> Self {
        Tab {
            name: name.to_string(),
            is_active: true,
        }
    }
}

#[derive(Default)]
pub struct DockState {
    pub windows: HashMap<String, bool>,
    pub tabs: Vec<Tab>,
    pub selected_tab: String,
    pub panel_sizes: HashMap<String, f32>,
}

impl DockState {
    pub fn new() -> Self {
        let mut windows = HashMap::new();
        windows.insert("Scene Hierarchy".to_owned(), true);
        windows.insert("Properties".to_owned(), true);
        windows.insert("Console".to_owned(), true);

        let mut panel_sizes = HashMap::new();
        panel_sizes.insert("left_panel".to_owned(), 250.0);
        panel_sizes.insert("right_panel".to_owned(), 300.0);
        panel_sizes.insert("bottom_panel".to_owned(), 200.0);

        Self {
            windows,
            tabs: vec![Tab::new("Scene")],
            selected_tab: "Scene".to_owned(),
            panel_sizes,
        }
    }
}

#[derive(Default)]
pub struct AppState {
    pub dock_state: DockState,
    pub scene_objects: Vec<String>,
    pub properties: HashMap<String, String>,
    pub console_logs: Vec<String>,
}