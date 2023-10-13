extern crate adam;
extern crate tauri;
extern crate com_helper;

use adam::models::{Data, Analog, Digital, AdamData, Endian};
use adam::{read, write, write_bytes};
use com_helper::ComHelper;
use once_cell::sync::OnceCell;


static mut SERIAL: OnceCell<ComHelper> = OnceCell::new();
static mut WINDOW: OnceCell<tauri::Window> = OnceCell::new();


#[tauri::command]
pub fn adam_read(address: &str) -> AdamData {
  //// On error will return empty, but valid structure
  // let mut analog = read::<Analog>(address, Endian::BIG);
  // let mut digital = read::<Digital>(address, Endian::BIG);
  // unsafe {
  //   if analog.is_none() { analog = Some(ANALOG.clone()) }
  //   if digital.is_none() { digital = Some(DIGITAL.clone()) }
  // }
  //// On error will return None for slots
  let analog = read::<Analog>(address, Endian::BIG);
  let digital = read::<Digital>(address, Endian::BIG);

  return AdamData{ analog, digital };
}
#[tauri::command]
pub fn adam_write(address: &str, data: Data, slottype: &str) -> bool {
  match slottype {
    "analog" => return write::<Analog>(address, &data, Endian::BIG),
    "digital" => return write::<Digital>(address, &data, Endian::BIG),
    _ => return false
  }
}
#[tauri::command]
pub fn adam_write_bytes(address: &str, bytes: &[u8]) -> bool {
  write_bytes(address, bytes).is_ok()
}

#[tauri::command]
pub fn com_open(wnd: tauri::Window, name: &str, rate: u32, do_listen: bool) -> bool {
  unsafe {
    let mut com = ComHelper::new(name, rate);
    if com.open() {
      if do_listen { com.listen(Box::new(on_received)) }
      SERIAL.take();
      WINDOW.take();
      SERIAL.set(com);
      WINDOW.set(wnd).unwrap();
      return true;
    }
    return false;
  }
}

#[tauri::command]
pub fn com_close() {
  unsafe {
    if let Some(mut com) = SERIAL.take() { com.close() }
  }
}

#[tauri::command]
pub fn com_write(bytes: Vec<u8>) -> bool {
  unsafe {
    if let Some(com) = SERIAL.get_mut() {
      return com.write(&bytes) > 0;
    }
    return false;
  }
}

#[tauri::command]
pub fn com_request(bytes: Vec<u8>) -> Vec<u8> {
  unsafe {
    if let Some(com) = SERIAL.get_mut() {
      return com.write_read(&bytes);
    }
    return Vec::new();
  }
}

fn on_received(data: Vec<u8>) {
  unsafe {
    if let Some(wnd) = WINDOW.get() {
      #[derive(Clone, serde::Serialize)]
      struct Payload { data: Vec<u8>, }
      println!("Bytes received: {:?}", data);
      wnd.emit("serial_incoming", Payload { data }).unwrap();
    }
  }
}
