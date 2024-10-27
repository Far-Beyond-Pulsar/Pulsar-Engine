pub struct TitleBar;

impl TitleBar {
    pub fn show(ui: &mut egui::Ui) {
        let title_bar_rect = ui.available_rect_before_wrap();
        ui.painter()
            .rect_filled(title_bar_rect, 0.0, crate::theme::TITLE_BAR_COLOR);
    }
}
