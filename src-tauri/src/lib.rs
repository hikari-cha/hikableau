use tauri_plugin_dialog::DialogExt;

#[tauri::command]
fn open_csv_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = app
        .dialog()
        .file()
        .add_filter("CSV Files", &["csv"])
        .blocking_pick_file();

    let Some(file_path) = path else {
        return Ok(None);
    };

    let path_buf = file_path
        .into_path()
        .map_err(|e| format!("Invalid path: {e}"))?;

    let content = std::fs::read_to_string(&path_buf)
        .map_err(|e| format!("Failed to read file: {e}"))?;

    Ok(Some(content))
}

#[tauri::command]
fn save_csv_file(app: tauri::AppHandle, content: String, filename: String) -> Result<bool, String> {
    let path = app
        .dialog()
        .file()
        .add_filter("CSV Files", &["csv"])
        .set_file_name(&filename)
        .blocking_save_file();

    let Some(file_path) = path else {
        return Ok(false);
    };

    let path_buf = file_path
        .into_path()
        .map_err(|e| format!("Invalid path: {e}"))?;

    std::fs::write(&path_buf, content.as_bytes())
        .map_err(|e| format!("Failed to write file: {e}"))?;

    Ok(true)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![open_csv_file, save_csv_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
