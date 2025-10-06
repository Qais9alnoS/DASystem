#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, command};
use tauri_plugin_decorum::WebviewWindowExt;

// Command to handle search functionality
#[command]
async fn handle_search(query: &str) -> Result<String, String> {
    println!("Search requested for: {}", query);
    // In a real implementation, this would perform the actual search
    Ok(format!("Searching for: {}", query))
}

// Command to toggle theme
#[command]
async fn toggle_theme() -> Result<String, String> {
    println!("Theme toggle requested");
    // In a real implementation, this would toggle the theme
    Ok("Theme toggled".to_string())
}

// Command to open settings
#[command]
async fn open_settings() -> Result<String, String> {
    println!("Settings requested");
    // In a real implementation, this would open the settings window
    Ok("Settings opened".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_decorum::init())
        .invoke_handler(tauri::generate_handler![handle_search, toggle_theme, open_settings])
        .setup(|app| {
            // Create a custom titlebar for main window
            let main_window = app.get_webview_window("main").unwrap();
            main_window.create_overlay_titlebar().unwrap();
            
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}