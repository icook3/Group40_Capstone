// bluetooth.test.js: Unit tests for TrainerBluetooth
import { TrainerBluetooth } from '../js/bluetooth.js';

describe('TrainerBluetooth', () => {
  let trainer;
  beforeEach(() => {
    trainer = new TrainerBluetooth();
  });

  test('should initialize with null device and server', () => {
    expect(trainer.device).toBeNull();
    expect(trainer.server).toBeNull();
    expect(trainer.characteristics).toEqual({});
    expect(trainer.onData).toBeNull();
  });

  test('handlePower parses power correctly', () => {
    // Simulate DataView for power
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setInt16(2, 123, true); // offset 2, little-endian
    let result;
    trainer.onData = (data) => { result = data; };
    trainer.handlePower({ target: { value: view } });
    expect(result.power).toBe(123);
  });

  test('handleCadence parses cadence and speed correctly', () => {
    // Simulate DataView for cadence and speed
    const buffer = new ArrayBuffer(6);
    const view = new DataView(buffer);
    view.setUint16(2, 88, true); // cadence
    view.setUint16(4, 2500, true); // speed (25.00 km/h)
    let result;
    trainer.onData = (data) => { result = data; };
    trainer.handleCadence({ target: { value: view } });
    expect(result.cadence).toBe(88);
    expect(result.speed).toBe(25);
  });
});
