extern crate adam;
use adam::models::{Data, AdamData};
use super::hardware as hw;


#[tauri::command]
pub fn read_adam(address: &str) -> AdamData {
  hw::read_adam(address)
}

#[tauri::command]
pub fn write_adam(address: &str, data: Data, slottype: &str) -> bool {
  hw::write_adam(address, &data, slottype)
}
