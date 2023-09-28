// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod commands_db;
pub mod commands_com;
pub mod commands_adam;
pub mod database;
pub mod hardware;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::logging,
            commands::file_exists,
            commands_db::read_testlist,
            commands_db::read_record,
            commands_db::read_dictionary,
            commands_db::write_record,
            commands_db::write_dictionary,
            commands_db::delete_record,
            commands_db::delete_dictionary,
            commands_com::serial_open,
            commands_com::serial_close,
            commands_com::serial_write,
            commands_com::serial_request,
            commands_adam::read_adam,
            commands_adam::write_adam,
          ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}