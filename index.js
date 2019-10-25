'use strict';

const path = require('path');
const { execSync, exec } = require('child_process');

let Service;
let Characteristic;

/**
 * Platform "KFX210"
 */

function KFX210Platform(log, config) {

    this.log = log;
    this.config = config;
}

KFX210Platform.prototype.accessories = function(callback) {

    this.kFX210Accessory = new KFX210Accessory(this.log, this.config);

    callback( [ this.kFX210Accessory ] );
};


/**
 * Accessory "KFX210"
 */

function KFX210Accessory(log, config) {

    this.log = log;

    this.name = 'Velux KFX210';

    this.statePollInterval = config.state_poll_interval || 10;
    this.comfortSwitchTime = config.comfort_switch_time || 3;
    this.pythonPath = config.python_path || '/usr/bin/python';

    this.alarm = false;
    this.error = false;
    this.comfort = false;

    this.alarmService = new Service.ContactSensor('Alarm', 'alarm');
    this.alarmService.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getAlarm.bind(this));

    this.errorService = new Service.ContactSensor('Error', 'error');
    this.errorService.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getError.bind(this));

    this.comfortService = new Service.Switch('Comfort', 'comfort');
    this.comfortService.getCharacteristic(Characteristic.On)
        .on('get', this.getComfort.bind(this))
        .on('set', this.setComfort.bind(this));

    this.accessoryInformationService = new Service.AccessoryInformation();
    this.accessoryInformationService.setCharacteristic(Characteristic.Manufacturer, "vectronic");
    this.accessoryInformationService.setCharacteristic(Characteristic.Model, "Velux KFX210");

    this.inputScript = path.join(__dirname, 'input.py');
    this.log(`inputScript: ${this.inputScript}`);

    this.relayScript = path.join(__dirname, 'relay.py');
    this.log(`relayScript: ${this.relayScript}`);

    this.log(`pythonPath: ${this.pythonPath}`);

    this.startStateTimeout();
}


KFX210Accessory.prototype.startStateTimeout = function() {
    const that = this;

    this.stateTimeout = setTimeout((function() {

        try {
            const alarmState = execSync(`${this.pythonPath} ${that.inputScript} 1`);
            that.log(`alarmState result: ${alarmState.toString()}`);
            that.alarm = alarmState.toString().startsWith('1');

            const errorState = execSync(`${this.pythonPath} ${that.inputScript} 2`);
            that.log(`errorState result: ${errorState.toString()}`);
            that.error = errorState.toString().startsWith('1');
        }
        catch (err) {
            that.log(`stateTimeout error: ${err}`);
        }
        this.startStateTimeout();
    }).bind(this), this.statePollInterval * 1000);

    this.stateTimeout.unref();
};


KFX210Accessory.prototype.getComfort = function(callback) {
    this.log(`Getting current value of Comfort: ${this.comfort}`);
    callback(null, this.comfort);
};


KFX210Accessory.prototype.execRelay = function(relayNumber, callback) {

    const that = this;

    exec(`${this.pythonPath} ${this.relayScript} ${relayNumber} ${this.comfortSwitchTime}`, (error, stdout, stderr) => {
        if (error) {
            that.log(`setComfort exec error: ${error}`);
            callback(error);
            return;
        }
        that.log(`setComfort stdout: ${stdout}`);
        that.log(`setComfort stderr: ${stderr}`);
        callback();
    });
};


KFX210Accessory.prototype.setComfort = function(comfort, callback) {
    this.log(`Request to set current value of Comfort to: ${comfort}`);

    this.comfort = comfort;

    try {
        if (this.comfort) {
            this.execRelay(1, callback);
        }
        else {
            this.execRelay(2, callback);
        }
    }
    catch (err) {
        this.log(`setComfort error: ${err}`);
        callback(err);
    }
};


KFX210Accessory.prototype.getAlarm = function(callback) {
    this.log(`Getting current value of Alarm: ${this.error}`);
    callback(null, this.alarm);
};


KFX210Accessory.prototype.getError = function(callback) {
    this.log(`Getting current value of Error: ${this.error}`);
    callback(null, this.error);
};


KFX210Accessory.prototype.getServices = function() {

    this.log('getServices');

    return [
        this.accessoryInformationService,
        this.comfortService,
        this.alarmService,
        this.errorService
    ];
};


module.exports = function(homebridge) {

    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerPlatform("homebridge-plugin-velux-KFX210", "KFX210", KFX210Platform);
};
