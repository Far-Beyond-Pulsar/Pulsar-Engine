use egui::Color32;

pub const DARK_GRAY: Color32 = Color32::from_rgb(40, 40, 40);
pub const DARKER_GRAY: Color32 = Color32::from_rgb(30, 30, 30);
pub const TITLE_BAR_COLOR: Color32 = Color32::from_rgb(25, 25, 25);
pub const ACCENT_COLOR: Color32 = Color32::from_rgb(0, 120, 215);
pub const TAB_COLOR: Color32 = Color32::from_rgb(45, 45, 45);
pub const HOVER_COLOR: Color32 = Color32::from_rgb(60, 60, 60);

pub fn configure_visuals(ctx: &egui::Context) {
    let mut visuals = egui::Visuals::dark();
    visuals.window_fill = DARKER_GRAY;
    visuals.panel_fill = DARK_GRAY;
    visuals.widgets.noninteractive.bg_fill = DARK_GRAY;
    visuals.widgets.inactive.bg_fill = DARK_GRAY;
    visuals.widgets.hovered.bg_fill = HOVER_COLOR;
    visuals.widgets.active.bg_fill = ACCENT_COLOR;
    ctx.set_visuals(visuals);
}