use std::time::Duration;
use std::sync::{Arc, Mutex};
use std::io::prelude::*;
use serialport::{COMPort, SerialPort};

pub struct ComHelper {
  pub rate: u32,
  pub name: String,
  pub is_open: bool,
  is_logged: bool,
  is_listening: Arc<Mutex<bool>>,
  port: Arc<Mutex<Option<COMPort>>>,
}
impl ComHelper {
  pub fn new(name: &str, rate: u32) -> Self {
    ComHelper {
      rate,
      name: String::from(name),
      is_open: false,
      is_logged: false,
      is_listening: Arc::new(Mutex::new(false)),
      port: Arc::new(Mutex::new(None)) }
  }

  pub fn open(&mut self) -> bool {
    if self.is_open { 
      if self.is_logged { println!("COMHelper::open::com aready opened. Reopening...") }
      self.close();
    }
    match serialport::new(&self.name, self.rate.into()).open_native() {
      Ok(mut socket) => {
        socket.set_parity(serialport::Parity::None).unwrap();
        socket.set_data_bits(serialport::DataBits::Eight).unwrap();
        socket.set_stop_bits(serialport::StopBits::One).unwrap();
        socket.set_timeout(Duration::from_millis(100)).unwrap();
        // socket.set_flow_control(serialport::FlowControl::Hardware).unwrap();
        *self.port.lock().unwrap() = Some(socket);
        if self.is_logged { println!("COMHelper::open::COM {} is opened.", self.name); }
        self.is_open = true;

        true
      },
      Err(err) => { eprintln!("ComHelper::open::{}", err); false }
    }
  }
  pub fn close(&mut self) {
    self.unlisten();
    *self.port.lock().unwrap() = None;
    if self.is_logged { println!("COMHelper::close::COM {} is closed.", self.name); }
  }

  pub fn read(&self) -> Vec<u8> {
    if *self.is_listening.lock().unwrap() {
      eprintln!("COMHelper::read::socket is on listening!");
      return Vec::new();
    }

    let mut result = Vec::new();
    let mut grd_serial = self.port.lock().unwrap();
    if let Some(com) = grd_serial.as_mut() {
      result = Self::com_read(com);
      if self.is_logged { println!("COMHelper::read::Bytes received {:?}" , result); }
    } else { eprintln!("COMHelper::read::com is none"); }
    drop(grd_serial);

    return result;
  }

  pub fn write(&self, bytes: &[u8]) -> usize {
    let mut result = 0;
    let mut grd_serial = self.port.lock().unwrap();
    if let Some(com) = grd_serial.as_mut() {
      result = com.write(bytes).unwrap_or(0);
      if self.is_logged { println!("COMHelper::write::{} bytes written", result); }
    } else { eprintln!("COMHelper::write::com is none"); }
    drop(grd_serial);

    return result;
  }

  pub fn write_read(&self, bytes: &[u8]) -> Vec<u8>{
    if bytes.len() == self.write(bytes) { self.read() } else { Vec::new() }
  }

  pub fn listen(&self, callback: Box<fn(Vec<u8>)>) {
    let port = self.port.clone();
    let is_listening = self.is_listening.clone();
    if self.is_logged { println!("COMHelper::listen::COM starts listening"); }
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
    if self.is_logged { println!("COMHelper::unlisten::COM stops listening."); }
  }

  fn com_read(com: &mut COMPort) -> Vec<u8> {
    let mut buf = vec![0u8;1024];
    match com.read(buf.as_mut_slice()) {
      Ok(count) => buf[0..count].to_vec(),
      Err(_) => Vec::new()
    }
  }
}