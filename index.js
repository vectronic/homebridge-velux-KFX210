'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

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
    this.comfortSwitchTime = config.comfort_switch_time || 2;

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

    this.startStateTimeout();
}


KFX210Accessory.prototype.startStateTimeout = function() {

    this.log('startStateTimeout()');

    const that = this;

    this.stateTimeout = setTimeout((function() {

        this.log('stateTimeout occurred');

        const alarmInput = spawn('python', [that.inputScript, '1']);

        alarmInput.stdout.on('data', function (data) {
            const result = data.toString();
            that.log(`alarmInput result: ${result}`);
            that.alarm = (result === '1');
        });
        alarmInput.stdout.on('error', function (err) {
            that.log(`alarmInput error: ${err}`)
        });

        const errorInput = spawn('python', [that.inputScript, '2']);

        errorInput.stdout.on('data', function (data) {
            const result = data.toString();
            that.log(`errorInput result: ${result}`);
            that.error = (result === '1');
        });
        errorInput.stdout.on('error', function (err) {
            that.log(`errorInput error: ${err}`)
        });

        this.startStateTimeout();
    }).bind(this), this.statePollInterval * 1000);

    this.stateTimeout.unref();
};


KFX210Accessory.prototype.getComfort = function(callback) {
    this.log(`Getting current value of Comfort: ${this.comfort}`);
    callback(null, this.comfort);
};


KFX210Accessory.prototype.setComfort = function(comfort, callback) {
    this.log(`Request to set current value of Comfort to: ${comfort}`);

    this.comfort = comfort;

    const that = this;

    if (this.comfort) {
        try {
            const comfortOpen = spawn('python', [that.relayScript, '1', this.comfortSwitchTime]);

            comfortOpen.stdout.on('close', function () {

                that.log('comfortOpen completed');

            });
            comfortOpen.stdout.on('error', function (err) {
                that.log(`comfortOpen error: ${err}`)
            });
        }
        catch (error) {
            this.log(`Failed to spawn: ${error}`);
        }
    }
    else {
        try {
            const comfortClose = spawn('python', [that.relayScript, '2', this.comfortSwitchTime]);

            comfortClose.stdout.on('close', function () {

                that.log('comfortClose completed');

            });
            comfortClose.stdout.on('error', function (err) {
                that.log(`comfortClose error: ${err}`)
            });
        }
        catch (error) {
            this.log(`Failed to spawn: ${error}`);
        }
    }
    callback(null);
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
