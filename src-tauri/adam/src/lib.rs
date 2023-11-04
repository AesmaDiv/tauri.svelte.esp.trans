use std::io::{prelude::*, Error};
use std::net::{TcpStream, UdpSocket, Ipv4Addr, SocketAddr};
use std::time::Duration;
use models::{Data, SlotParam, Convert, Endian};

pub mod models;

// const TCP_ADDRESS: &str = "10.10.10.10:502";
// const UDP_ADDRESS: &str = "10.10.10.3:5168";
const CONNECT_TIMEOUT: u64 = 1000;
const LOGGED: bool = false;


pub fn read<T: Convert  + SlotParam>(address: &str, endian: Endian) -> Option<T> {
  match read_bytes::<T>(address) {
      Ok(data) => {
        let values: Vec<u16> = to_values(&data, endian);
        let result: Option<T> = T::convert(values);

        return result;
      },
      Err(error) => {
        eprintln!(
          "Adam::read::!!! Error reading {} from {address} >> {:?}",
          std::any::type_name::<T>(),
          error.to_string()
        );
        return None;
      }
  };
}
pub fn write<T: SlotParam>(address: &str, data: &Data, endian: Endian) -> bool {
  let bytes = T::build_set(data, endian);
  if let Err(err) = write_bytes(address, &bytes) {
    eprintln!(
      "Adam::write::!!!Error writing {} to {address} >> {:?}",
      std::any::type_name::<T>(),
      err.to_string()
    );
    return false;
  }
  true
}

pub fn listen(address: &str) -> std::io::Result<()> {
  let endpoint = [address, "5168"].join(":");
  let socket = UdpSocket::bind(endpoint)?;
  let mut buf = [0; 255];
  let mut count = 0;
  while count < 1 {
      let (_, _) = socket.recv_from(&mut buf)?;
      if LOGGED { println!("Message №{} => {:?}", &count, &buf) }
      count += 1;
  }

  Ok(())
}
pub fn read_bytes<T: SlotParam>(address: &str) -> std::io::Result<Vec<u8>> {
  let endpoint: &str = &[address, "502"].join(":");
  if let Ok(sock) = endpoint.parse() {
    let timeout = Duration::from_millis(CONNECT_TIMEOUT);
    let mut stream = TcpStream::connect_timeout(&sock, timeout)?;
    let mut bytes = vec![0x0; T::SIZE[0]];
    let mut result = vec![0x0; T::SIZE[1]];
    stream.write(&T::COMMAND_GET)?;
    stream.read(&mut bytes)?;
    result.copy_from_slice(&bytes[9..]);

    return Ok(result);
  }
  Err(std::io::Error::new(
    std::io::ErrorKind::AddrNotAvailable,
    "error parsing IP address")
  )
}
pub fn write_bytes(address: &str, bytes: &[u8]) -> std::io::Result<()> {
  let endpoint: &str = &[address, "502"].join(":");
  if let Ok(sock) = endpoint.parse::<SocketAddr>() {
    if LOGGED { println!("Adam write {:?}", bytes) }
    // match TcpStream::connect(sock) {
    //   Ok(mut stream) =>  if stream.write(bytes).is_ok() {return Ok(()) },
    //   Err(err) => eprintln!("WriteBytes connection error {}", err)
    // }
    let timeout = Duration::from_millis(CONNECT_TIMEOUT);
    let mut stream = TcpStream::connect_timeout(&sock, timeout)?;
    let count = stream.write(bytes)?;
    // println!("Adam::write_bytes::{size} bytes written.");

    return if count != bytes.len() {
      Err(std::io::Error::new(
        std::io::ErrorKind::Interrupted,
        "Not all bytes was written"))
    } else { Ok(()) }
  }
  Err(std::io::Error::new(
    std::io::ErrorKind::AddrNotAvailable,
    "error parsing IP address")
  )
}
pub fn crc16(bytes: &Vec<u8>) -> u16 {
  let mut crc: u16 = 0xFFFF;
  for byte in bytes {
    crc ^= *byte as u16;
    for _ in 0..8 {
      if crc & 0x0001 != 0 {
        crc >>= 1;
        crc ^= 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }

  return crc.to_be();
}

fn to_values(source: &Vec<u8>, endian: Endian) -> Vec<u16> {
  match endian {
    Endian::BIG => { 
      source.chunks(2).map(|bytes| u16::from_be_bytes([bytes[0],bytes[1]])).collect::<Vec<u16>>()
    },
    _ => {
      source.chunks(2).map(|bytes| u16::from_le_bytes([bytes[0],bytes[1]])).collect::<Vec<u16>>()
    }
  }
}
