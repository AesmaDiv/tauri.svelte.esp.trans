extern crate serial;

use std::time::Duration;
use std::sync::{Arc, Mutex};

use std::io::prelude::*;
use serial::windows::COMPort;
use serial::{SystemPort, SerialPort};


pub struct SerialHandler {
  /** Имя COM порта */
  name: String,
  /** Сокет */
  socket: Arc<Mutex<Option<SystemPort>>>,
  /** Состояние чтения */
  is_reading: Arc<Mutex<bool>>,
}

impl SerialHandler {
    pub fn new(port_name: &str) -> SerialHandler {
      SerialHandler {
        name: port_name.to_string(),
        socket: Arc::new(Mutex::new(None)),
        is_reading: Arc::new(Mutex::new(false))
      }
    }
    /** Открытие порта */
    pub fn open(&mut self) -> bool {
      if self.is_ready() { return true; }
      // открытие порта
      if let Ok(mut socket) = serial::open(&self.name) {
        // конфигурирование
        socket.reconfigure(&|settings| {
          settings.set_baud_rate(serial::Baud9600).unwrap();
          settings.set_char_size(serial::Bits8);
          settings.set_parity(serial::ParityNone);
          settings.set_stop_bits(serial::Stop1);
          settings.set_flow_control(serial::FlowNone);
          
          Ok(())
        }).unwrap();
        socket.set_timeout(Duration::from_millis(100)).unwrap();
        // сохранение сокета в структуре
        *self.socket.lock().unwrap() = Some(socket);

        println!("SerialPort {} connected", &self.name);
        return true;
      }
      println!("SerialPort error connecting {}", &self.name);
      return false;
    }
    /** Закрытие порта */
    pub fn close(&mut self) {
      // если сокет существует..
      if self.is_ready() {
        // ..прекратить прослушивание
        self.set_reading(false);
        // ..удалить сокет
        *self.socket.lock().unwrap() = None;
      }
    }

    /** Проверка готов из сокет */
    pub fn is_ready(&self) -> bool {
      let mut result = false;
      if let Ok(guard) = self.socket.lock() {
        result = guard.is_some();
        drop(guard);
      }
      self.print_state(&result, ["READY", "NOT ready"]);
      return result;
    }
    /** Проверка активно ли чтение с сокета */
    pub fn is_listening(&self) -> bool {
      let mut result = false;
      if let Ok(guard) = self.is_reading.lock() {
        result = *guard;
        drop(guard);
      }
      self.print_state(&result, ["listening", "not listening"]);
      return result;
    }
    /** Запись данных в сокет */
    pub fn send(&mut self, bytes: &[u8]) -> bool {
      let mut result = false;
      // получение ссылки на сокет
      let mut guard_socket = self.socket.lock().unwrap();
      if let Some(com) = guard_socket.as_mut() {
        result = Self::write(com, bytes)
      };
      // освобождение сокета
      drop(guard_socket);
      return result;
    }
    /** Отправка запроса и получение ответа */
    pub fn request(&mut self, bytes: &[u8]) -> Vec<u8> {
      let mut result = Vec::new();
      // получение ссылки на сокет
      let mut guard_socket = self.socket.lock().unwrap();
      if let Some(com) = guard_socket.as_mut() {
        if Self::write(com, bytes) { result = Self::read(com) }
      }
      // освобождение сокета
      drop(guard_socket);
      return result;
    }
    /** Запуск прослушивания сокета */
    pub fn listen(&mut self, callback: Box<fn(Vec<u8>)>) {
      // проверки готовности
      if !self.is_ready() { return; }
      if self.is_listening() { return; }
      // запуск прослушивания
      self.set_reading(true);
      // получение ссылок для передачи в поток прослушивания
      let socket = self.socket.clone();
      let is_reading = self.is_reading.clone();
      // запуск потока прослушивания
      std::thread::spawn(move|| {
        // счётчик попыток чтения с порта
        let mut count: u64 = 0;
        println!("SerialPort starts listening...");
        loop {
          // флаг прерывания прослушивания
          let mut interupt = !*is_reading.lock().unwrap();
          // получение ссылки на сокет
          let mut guard_socket = socket.lock().unwrap();
          if let Some(com) = guard_socket.as_mut(){
            // если считались данные, передаём наружу
            let bytes = Self::read(com);
            if bytes.len() > 0 { callback(bytes) }
          } else {
            // если сокет не обнаружен - прекращаем всё
            println!("SerialPort Error: socket lost");
            *is_reading.lock().unwrap() = false;
            interupt = true;
          }
          // освобождаем сокет
          drop(guard_socket);
          // проверка прерывания
          if interupt { break; }
          // пауза
          std::thread::sleep(Duration::from_millis(100));
          println!("Listen count: {}", count);
          count += 1;
        }
        println!("SerialPort stopped listening.")
      });
    }
    /** Прекращение прослушивания */
    pub fn stop_listen(&mut self) {
      self.set_reading(false);
    }

    /** Изменение флага прослушивания */
    fn set_reading(&mut self, state: bool) {
      *self.is_reading.lock().unwrap() = state;
    }
    /** Вывод состояния порта в консоль */
    fn print_state(&self, state: &bool, msg: [&str; 2]) {
      println!(
        "SeralPort {}",
        format!(
          "{} is {}", 
          self.name, 
          if *state {msg[0]} else {msg[1]}
        )
      );
    }
    /** Чтение из порта */

    fn read(com: &mut COMPort) -> Vec<u8> {
      // буфер приёма
      let mut buffer = [0u8; 1024];
      match com.read(&mut buffer) {
        Ok(count) => buffer[0..count].to_vec(),
        Err(err) => {
          println!("SerialPort read error {}", err);
          Vec::new()
        }
      }
    }
    /** Запись в порт */
    fn write(com: &mut COMPort, bytes: &[u8]) -> bool {
      match com.write(bytes) {
        Ok(written) => written > 0,
        Err(err) => {
          println!("SerialPort write error {}", err);
          false
        },
      }
    }

}
