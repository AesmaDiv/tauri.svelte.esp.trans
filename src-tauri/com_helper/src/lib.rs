use std::time::Duration;
use std::sync::{Arc, Mutex};
use std::io::prelude::*;
use serialport::{COMPort, SerialPort};

pub struct ComHelper {
  rate: u32,
  name: String,
  is_logged: bool,
  is_listening: Arc<Mutex<bool>>,
  port: Arc<Mutex<Option<COMPort>>>,
}
impl ComHelper {
  pub fn new(name: &str, rate: u32) -> Self {
    ComHelper {
      rate,
      name: String::from(name),
      is_logged: true,
      is_listening: Arc::new(Mutex::new(false)),
      port: Arc::new(Mutex::new(None)) }
  }

  pub fn open(&mut self) -> bool {
    match serialport::new(&self.name, self.rate.into()).open_native() {
      Ok(mut socket) => {
        socket.set_parity(serialport::Parity::None).unwrap();
        socket.set_data_bits(serialport::DataBits::Eight).unwrap();
        socket.set_stop_bits(serialport::StopBits::One).unwrap();
        socket.set_timeout(Duration::from_millis(100)).unwrap();
        *self.port.lock().unwrap() = Some(socket);
        if self.is_logged { println!("COM {} is opened.", self.name); }
        true
      },
      Err(err) => { eprintln!("ComHelper::{}", err); false }
    }
  }
  pub fn close(&mut self) {
    self.unlisten();
    *self.port.lock().unwrap() = None;
    if self.is_logged { println!("COM {} is opened.", self.name); }
  }

  pub fn read(&self) -> Vec<u8> {
    if *self.is_listening.lock().unwrap() { return Vec::new(); }

    let mut result = Vec::new();
    let mut grd_serial = self.port.lock().unwrap();
    if let Some(com) = grd_serial.as_mut() {
      result = Self::com_read(com);
      if self.is_logged { println!("Bytes received {:?}" , result); }
    }
    drop(grd_serial);

    return result;
  }

  pub fn write(&self, bytes: &[u8]) -> usize {
    if *self.is_listening.lock().unwrap() { return 0; }

    let mut result = 0;
    let mut grd_serial = self.port.lock().unwrap();
    if let Some(com) = grd_serial.as_mut() {
      result = com.write(bytes).unwrap_or(0);
      if self.is_logged { println!("{} bytes written", result); }
    }
    drop(grd_serial);

    return result;
  }

  pub fn write_read(&self, bytes: &[u8]) -> Vec<u8>{
    if bytes.len() == self.write(bytes) { self.read() } else { Vec::new() }
  }

  pub fn listen(&self, callback: Box<fn(Vec<u8>)>) {
    let port = self.port.clone();
    let is_listening = self.is_listening.clone();
    if self.is_logged { println!("COM starts listening"); }
    std::thread::spawn(move|| {
      *is_listening.lock().unwrap() = true;
      loop {
        let mut grd_listen = is_listening.lock().unwrap();
        let mut grd_serial = port.lock().unwrap();
        if let Some(com) = grd_serial.as_mut() {
          let bytes = Self::com_read(com);
          if bytes.len() > 0 { callback(bytes) }
        } else { *grd_listen = false; }
        let interrupt = *grd_listen != true;
        drop(grd_serial);
        drop(grd_listen);
        if interrupt { break; }
        std::thread::sleep(Duration::from_millis(100));
      }
    });
  }

  pub fn unlisten(&self) {
    *self.is_listening.lock().unwrap() = false;
    if self.is_logged { println!("COM stops listening."); }
  }

  fn com_read(com: &mut COMPort) -> Vec<u8> {
    let mut buf = vec![0u8;1024];
    match com.read(buf.as_mut_slice()) {
      Ok(count) => buf[0..count].to_vec(),
      Err(_) => Vec::new()
    }
  }
}