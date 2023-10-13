use std::io::prelude::*;
use std::net::{TcpStream, UdpSocket};
use std::time::Duration;
use models::{Data, SlotParam, Convert, Endian};

pub mod models;

// const TCP_ADDRESS: &str = "10.10.10.10:502";
// const UDP_ADDRESS: &str = "10.10.10.3:5168";
const CONNECT_TIMEOUT: u64 = 50;


pub fn read<T: Convert  + SlotParam>(address: &str, endian: Endian) -> Option<T> {
  match read_bytes::<T>(address) {
      Ok(data) => {
        let values: Vec<u16> = to_values(&data, endian);
        let result: Option<T> = T::convert(values);

        return result;
      },
      Err(error) => {
        println!(
          "!!! Error getting {} from {address} >> {:?}",
          std::any::type_name::<T>(),
          error.to_string()
        );
        return None;
      }
  };
}
pub fn write<T: SlotParam>(address: &str, data: &Data, endian: Endian) -> bool {
  let bytes = T::build_set(data, endian);
  match write_bytes(address, &bytes) {
      Ok(_) => return true,
      Err(error) => {
        println!(
          "!!! Error setting {} to {address} >> {:?}",
          std::any::type_name::<T>(),
          error.to_string()
        );
        return false;
      }
  };
}

pub fn listen(address: &str) -> std::io::Result<()> {
  let endpoint = [address, "5168"].join(":");
  let socket = UdpSocket::bind(endpoint)?;
  let mut buf = [0; 255];
  let mut count = 0;
  while count < 1 {
      let (_, _) = socket.recv_from(&mut buf)?;
      println!("Message №{} => {:?}", &count, &buf);
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
    
    if stream.write(&T::COMMAND_GET).is_ok() { stream.read(&mut bytes)?; }
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
  match endpoint.parse() {
      Ok(sock) => {
        println!("Adam write {:?}", bytes);
        let timeout = Duration::from_millis(CONNECT_TIMEOUT);
        let mut stream = TcpStream::connect_timeout(&sock, timeout)?;

        if stream.write(bytes).is_ok() { return Ok(()) };
      },
      Err(err) => eprintln!("Error {}", err)
  }
  Err(std::io::Error::new(
    std::io::ErrorKind::AddrNotAvailable,
    "error parsing IP address")
  )
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
