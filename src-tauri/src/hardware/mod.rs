/*
  МОДУЛЬ ДЛЯ РАБОТЫ С ОБОРУДОВАНИЕМ
*/
extern crate adam;
extern crate tauri;
extern crate com_helper;

use adam::models::{Data, Analog, Digital, AdamData, Endian};
use adam::{read_async, write, write_bytes, crc16};
use com_helper::ComHelper;
use once_cell::sync::OnceCell;

/// переменная для хранения ссылки на СОМ-порт
static mut SERIAL: OnceCell<ComHelper> = OnceCell::new();
/// переменная для хранения ссылки на окно программы
static mut WINDOW: OnceCell<tauri::Window> = OnceCell::new();
const LOGGED: bool = false;


#[tauri::command]
/// чтение карт аналоговых и дискретных каналов
pub async fn adam_read(address: &str) -> Result<AdamData, ()> {
  //// On error will return empty, but valid structure
  // let mut analog = read::<Analog>(address, Endian::BIG);
  // let mut digital = read::<Digital>(address, Endian::BIG);
  // unsafe {
  //   if analog.is_none() { analog = Some(ANALOG.clone()) }
  //   if digital.is_none() { digital = Some(DIGITAL.clone()) }
  // }
  //// On error will return None for slots
  let mut analog: Option<Analog> = None;
  let mut digital: Option<Digital> = None;
  async {
    analog = read_async::<Analog>(address, Endian::BIG).await;
    digital = read_async::<Digital>(address, Endian::BIG).await;
  }.await;

  return Ok(AdamData{ analog, digital });
}
#[tauri::command]
/// запись данных в адам
pub fn adam_write(address: &str, data: Data, slottype: &str) -> bool {
  match slottype {
    "analog" => return write::<Analog>(address, &data, Endian::BIG),
    "digital" => return write::<Digital>(address, &data, Endian::BIG),
    _ => return false
  }
}
#[tauri::command]
/// отправка в адам байтовой комманды
pub fn adam_write_bytes(address: &str, bytes: Vec<u8>) -> bool {
  if let Err(err) = write_bytes(address, &bytes) {
    eprintln!("Adam::write_bytes::!!!Error {err}");
    return false;
  }
  true
}
#[tauri::command]
/// добавление CRC16 суммы к сообщению
pub fn add_crc16(bytes: Vec<u8>) -> Vec<u8> {
  let crc = crc16(&bytes).to_be_bytes();
  return [bytes.clone(), crc.to_vec()].concat();
}

#[tauri::command]
/// открытие СОМ-порта
pub fn com_open(wnd: tauri::Window, name: &str, rate: u32, do_listen: bool) -> bool {
  unsafe {
    if let Some(mut com) = SERIAL.take().or(Some(ComHelper::new(name, rate))) {
      com.close();
      if com.open() {
        // если do_listen задано - порт в режиме прослушивания
        if do_listen { com.listen(Box::new(on_received)) }
        WINDOW.take();
        SERIAL.set(com);
        WINDOW.set(wnd).unwrap();

        return true;
      }
    }
    false
  }
}

#[tauri::command]
/// закрытие СОМ-порта
pub fn com_close() {
  unsafe {
    if let Some(mut com) = SERIAL.take() { com.close() }
  }
}

#[tauri::command]
/// запись в СОМ-порт
pub fn com_write(bytes: Vec<u8>) -> bool {
  unsafe {
    if let Some(com) = SERIAL.get_mut() {
      return com.write(&bytes) > 0;
    }
    eprintln!("COM_WRITE: Socket not found.");
    return false;
  }
}

#[tauri::command]
/// отправка запроса в СОМ-порт и получение ответа
pub fn com_request(bytes: Vec<u8>) -> Vec<u8> {
  unsafe {
    if let Some(com) = SERIAL.get_mut() {
      return com.write_read(&bytes);
    }
    eprintln!("COM_REQUEST: Socket not found.");
    return Vec::new();
  }
}
/// функция обработки пришедший данных в режиме прослушивания
fn on_received(data: Vec<u8>) {
  unsafe {
    if let Some(wnd) = WINDOW.get() {
      #[derive(Clone, serde::Serialize)]
      struct Payload { data: Vec<u8>, }
      if LOGGED { println!("Bytes received: {:?}", data) }
      wnd.emit("serial_incoming", Payload { data }).unwrap();
    }
  }
}
