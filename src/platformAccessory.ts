import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import { execSync, exec } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import type { KFX210Platform } from './platform.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class KFX210Accessory {
  private alarmService: Service;
  private errorService: Service;
  private comfortService: Service;

  private alarm = false;
  private error = false;
  private comfort = false;

  private readonly statePollInterval: number;
  private readonly comfortSwitchTime: number;
  private readonly pythonPath: string;
  private readonly inputScript: string;
  private readonly relayScript: string;

  constructor(
    private readonly platform: KFX210Platform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.statePollInterval = this.platform.config.state_poll_interval ?? 3;
    this.comfortSwitchTime = this.platform.config.comfort_switch_time ?? 0.5;
    this.pythonPath = this.platform.config.python_path ?? '/usr/bin/python';

    // Scripts are in the package root (one level up from dist/)
    this.inputScript = join(__dirname, '..', 'input.py');
    this.relayScript = join(__dirname, '..', 'relay.py');

    this.platform.log.info(`inputScript: ${this.inputScript}`);
    this.platform.log.info(`relayScript: ${this.relayScript}`);
    this.platform.log.info(`pythonPath: ${this.pythonPath}`);

    // Set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'vectronic')
      .setCharacteristic(this.platform.Characteristic.Model, 'Velux KFX210');

    // Alarm contact sensor
    this.alarmService = this.accessory.getService('Alarm')
      || this.accessory.addService(this.platform.Service.ContactSensor, 'Alarm', 'alarm');
    this.alarmService.getCharacteristic(this.platform.Characteristic.ContactSensorState)
      .onGet(this.getAlarm.bind(this));

    // Error contact sensor
    this.errorService = this.accessory.getService('Error')
      || this.accessory.addService(this.platform.Service.ContactSensor, 'Error', 'error');
    this.errorService.getCharacteristic(this.platform.Characteristic.ContactSensorState)
      .onGet(this.getError.bind(this));

    // Comfort switch
    this.comfortService = this.accessory.getService('Comfort')
      || this.accessory.addService(this.platform.Service.Switch, 'Comfort', 'comfort');
    this.comfortService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getComfort.bind(this))
      .onSet(this.setComfort.bind(this));

    // Start polling
    this.startStatePolling();
  }

  private startStatePolling() {
    const timeout = setTimeout(() => {
      try {
        const alarmState = execSync(`${this.pythonPath} ${this.inputScript} 1`);
        this.platform.log.debug(`alarmState result: ${alarmState.toString()}`);
        this.alarm = alarmState.toString().startsWith('1');
        this.alarmService.updateCharacteristic(
          this.platform.Characteristic.ContactSensorState,
          this.alarm,
        );

        const errorState = execSync(`${this.pythonPath} ${this.inputScript} 2`);
        this.platform.log.debug(`errorState result: ${errorState.toString()}`);
        this.error = errorState.toString().startsWith('1');
        this.errorService.updateCharacteristic(
          this.platform.Characteristic.ContactSensorState,
          this.error,
        );
      } catch (err) {
        this.platform.log.error(`State polling error: ${err}`);
      }
      this.startStatePolling();
    }, this.statePollInterval * 1000);

    timeout.unref();
  }

  async getAlarm(): Promise<CharacteristicValue> {
    this.platform.log.debug(`Getting current value of Alarm: ${this.alarm}`);
    return this.alarm;
  }

  async getError(): Promise<CharacteristicValue> {
    this.platform.log.debug(`Getting current value of Error: ${this.error}`);
    return this.error;
  }

  async getComfort(): Promise<CharacteristicValue> {
    this.platform.log.debug(`Getting current value of Comfort: ${this.comfort}`);
    return this.comfort;
  }

  async setComfort(value: CharacteristicValue) {
    this.platform.log.info(`Request to set Comfort to: ${value}`);
    this.comfort = value as boolean;

    const relayNumber = this.comfort ? 1 : 2;

    return new Promise<void>((resolve, reject) => {
      exec(`${this.pythonPath} ${this.relayScript} ${relayNumber} ${this.comfortSwitchTime}`, (error, stdout, stderr) => {
        if (error) {
          this.platform.log.error(`setComfort exec error: ${error}`);
          reject(error);
          return;
        }
        this.platform.log.debug(`setComfort stdout: ${stdout}`);
        this.platform.log.debug(`setComfort stderr: ${stderr}`);
        resolve();
      });
    });
  }
}
