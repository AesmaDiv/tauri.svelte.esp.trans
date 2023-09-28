use once_cell::sync::OnceCell;

extern crate serial_handler;
use serial_handler::SerialHandler;


static mut SERIAL: OnceCell<SerialHandler> = OnceCell::new();
static mut WINDOW: OnceCell<tauri::Window> = OnceCell::new();

#[tauri::command]
pub fn serial_open(wnd: tauri::Window, do_listen: bool ) {
  unsafe {
    let mut serial = SerialHandler::new("COM3");
    if let Some(socket) = SERIAL.take() {
      serial = socket;
    }
    serial.open();
    if do_listen { serial.listen(Box::new(on_received)) }
    SERIAL.set(serial);
    WINDOW.set(wnd);
  }
}

#[tauri::command]
pub fn serial_close() {
  unsafe {
    if let Some(com) = SERIAL.get_mut() {
      com.close();
    }
  }
}

#[tauri::command]
pub fn serial_write(bytes: Vec<u8>) -> bool {
  unsafe {
    if let Some(com) = SERIAL.get_mut() {
      return com.send(&bytes);
    }
    return false;
  }
}

#[tauri::command]
pub fn serial_request(bytes: Vec<u8>) -> Vec<u8> {
  unsafe {
    if let Some(com) = SERIAL.get_mut() {
      return com.request(&bytes);
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
      wnd.emit("rohm_measured", Payload { data }).unwrap();
    }
  }
}