// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// модули внешний комманд
pub mod commands;
pub mod database;
pub mod hardware;

fn main() {
    tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![
        // регистрация внешний комманд
        commands::logging,
        commands::file_exists,
        hardware::add_crc16,
        hardware::com_open,
        hardware::com_close,
        hardware::com_write,
        hardware::com_request,
        hardware::adam_read,
        hardware::adam_write,
        hardware::adam_write_bytes,
        database::read_testlist,
        database::read_record,
        database::read_dictionary,
        database::write_record,
        database::write_dictionary,
        database::delete_record,
        database::delete_dictionary,
      ])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}