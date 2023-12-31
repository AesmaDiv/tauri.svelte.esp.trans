use std::time::Duration;
use com_helper::ComHelper;

fn main() {
    println!("Hello, world!");

    let mut com = ComHelper::new("COM8", 19200);
    if com.open() {
        com.listen(Box::new(callback));
        std::thread::sleep(Duration::from_secs(60));
        com.unlisten();
        com.close();
    }
}

fn callback(bytes: Vec<u8>) {
    println!("BYTES: {:?}", bytes);
}
