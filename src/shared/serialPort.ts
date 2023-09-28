export class SerialPort {
  port = undefined;
  reader = undefined;
  is_reading = true;
  timer = undefined;

  async connect() {
    try {
      this.port = await navigator.serial.requestPort();
      if (this.port) await this.port.open({baudRate: 9600, bufferSize: 1024});
      console.log("Connected %o", this.port);
    } catch (error) {
      console.log("SerialPort Error: %o", error);
    }
  }
  async writing(command: string) {
    if (!this.port) return;
    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      writer.write(encoder.encode(command));
      writer.releaseLock();
    } catch (error) {
      console.log("SerialPort Error: %o", error);
    }
    console.log("Writing %o", command);
  }
  async reading() {
    if (!this.port) return;
    this.reader = this.port.readable.getReader();
    this.timer = setInterval(async() => {
    // while (true) {
      try {
        const {value, done} = await this.reader.read();
        const msg = new TextDecoder().decode(value);
        console.log("Data: %o", value);
        console.log("Msg %o", msg);
        // if (done) break;
      } catch (error) {
        console.log("SerialPort Error: %o", error);
      }
    // }
    this.reader.releaseLock();
    }, 50);
    
    console.log("Readed");
  }
  stopReading() {
    this.reader.releaseLock();
    clearInterval(this.timer);
  }
  async disconnect() {
    try {
      this.stopReading();
    } catch (error) {
      console.log("SerialPort Error: %o", error);
    } finally {
      await this.port.close();
      await this.port.forget();
    }
    console.log("Disconnected");
  }
}