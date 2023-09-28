use serial_handler::SerialHandler;
use once_cell::sync::OnceCell;


static mut SERIAL_PACK : OnceCell<SerialHandler> = OnceCell::new();


fn main() {
    let com3 = SerialHandler::new("COM3");
    unsafe { SERIAL_PACK.set(com3); }
    serial_execute();
    println!("Exit");
}

fn serial_execute() {
    unsafe {
        if let Some(com) = SERIAL_PACK.get_mut() {
            com.listen(Box::new(print_vec));
            let mut timer = 0;
            while com.is_listening() {
                std::thread::sleep(std::time::Duration::from_secs(1));
                println!("Timer count: {}", timer);
                timer += 1;
                if timer % 3 == 0 { com.write(&[0x40, 0x30, 0x31, 0x0D]); }
                if timer == 20 { com.stop_listen(); }
            }
        }
    }
}

fn print_vec(bytes: Vec<u8>) {
    println!("DATA: {:2X?}", bytes);
}
