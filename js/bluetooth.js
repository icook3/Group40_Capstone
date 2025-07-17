// bluetooth.js: Handles Bluetooth connection to smart trainer (Wahoo FTMS or similar)
export class TrainerBluetooth {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristics = {};
    this.onData = null; // callback({power, cadence, speed})
  }

  static get DEVICE_INFO_SERVICE_UUID() { return '0000180a-0000-1000-8000-00805f9b34fb'; }
  static get FITNESS_MACHINE_SERVICE_UUID() { return '00001826-0000-1000-8000-00805f9b34fb'; }
  static get CYCLING_POWER_SERVICE_UUID() { return '00001818-0000-1000-8000-00805f9b34fb'; }
  static get CYCLING_POWER_MEASUREMENT_UUID() { return '00002a63-0000-1000-8000-00805f9b34fb'; }

  async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          TrainerBluetooth.DEVICE_INFO_SERVICE_UUID,
          TrainerBluetooth.FITNESS_MACHINE_SERVICE_UUID,
          TrainerBluetooth.CYCLING_POWER_SERVICE_UUID
        ]
      });
      this.server = await this.device.gatt.connect();

      // Diagnostic: log all services and characteristics
      const services = await this.server.getPrimaryServices();
      for (const svc of services) {
        console.log('[DIAG] Found service', svc.uuid);
        let chars = [];
        try {
          chars = await svc.getCharacteristics();
        } catch (err) {
          console.warn('[DIAG] Could not get characteristics for service', svc.uuid, err);
        }
        for (const char of chars) {
          console.log('[DIAG] Found characteristic', char.uuid, 'in service', svc.uuid);
          // Try to read value if possible
          if (char.properties.read) {
            try {
              const value = await char.readValue();
              // Attempt to decode as string, fallback to hex
              let str = '';
              try {
                const decoder = new TextDecoder('utf-8');
                str = decoder.decode(value.buffer);
              } catch (e) {
                str = Array.from(new Uint8Array(value.buffer)).map(b => b.toString(16).padStart(2, '0')).join(' ');
              }
              console.log(`[DIAG] Read value from char ${char.uuid}:`, str, value);
            } catch (err) {
              console.warn(`[DIAG] Could not read value from char ${char.uuid}:`, err);
            }
          }
          if (char.properties.notify || char.properties.indicate) {
            try {
              char.addEventListener('characteristicvaluechanged', e => {
                const value = e.target.value;
                // Log all notification events and attempt to print as string and hex
                let str = '';
                try {
                  const decoder = new TextDecoder('utf-8');
                  str = decoder.decode(value.buffer);
                } catch (e) {
                  str = Array.from(new Uint8Array(value.buffer)).map(b => b.toString(16).padStart(2, '0')).join(' ');
                }
                console.log(`[DIAG] [NOTIFY] Notification from service ${svc.uuid}, char ${char.uuid}:`, value, 'as string:', str, 'as hex:', Array.from(new Uint8Array(value.buffer)).map(b => b.toString(16).padStart(2, '0')).join(' '));

                // If this is the Cycling Power Measurement characteristic, parse power and call onData
                if (char.uuid === TrainerBluetooth.CYCLING_POWER_MEASUREMENT_UUID) {
                  const flags = value.getUint16(0, true);
                  const power = value.getInt16(2, true); // offset 2, little-endian
                  console.log('[DIAG] [POWER] Cycling Power Measurement:', power, 'Flags:', flags, value);
                  if (this.onData) this.onData({ power });
                }
              });
              await char.startNotifications();
              console.log(`[DIAG] Subscribed to notifications for char ${char.uuid}`);
            } catch (err) {
              console.warn(`[DIAG] Could not subscribe to notifications for char ${char.uuid}:`, err);
            }
          }
        }
      }
      return true;
    } catch (e) {
      alert('Bluetooth connection failed: ' + e);
      return false;
    }
  }

  handlePower(event) {
    // Parse power from DataView (see FTMS spec)
    const value = event.target.value;
    const power = value.getInt16(2, true); // offset 2, little-endian
    console.log('[DIAG] handlePower called, value:', value, 'power:', power);
    if (this.onData) this.onData({power});
  }

  handleCadence(event) {
    // Parse cadence and speed from DataView (see FTMS spec)
    const value = event.target.value;
    const cadence = value.getUint16(2, true); // offset 2, little-endian
    const speed = value.getUint16(4, true) / 100; // offset 4, little-endian, convert to km/h
    console.log('[DIAG] handleCadence called, value:', value, 'cadence:', cadence, 'speed:', speed);
    if (this.onData) this.onData({cadence, speed});
  }
}
