# homebridge-plugin-velux-KFX210
> A [Homebridge](https://github.com/nfarina/homebridge) plugin integrating with a Velux KFX 210 control panel via RaspberryPi + [Pimoroni Automation HAT](https://github.com/pimoroni/automation-hat/blob/master/documentation/REFERENCE.md).

### Aim

Provides:
 
* contact sensor for alarm state
* contact sensor for error state
* open/close switch for comfort mode

A separate Eve Door sensor is used to sense the open/close state of the vent.

The Pimoroni Automation HAT is controlled via the provided Python API with some extremely simple Python scripts which are spawned as required by 
this NodeJS plugin.

### Installation

1. Install Homebridge using: `npm install -g homebridge`
1. Install this plugin using: `npm install -g git+https://github.com/vectronic/homebridge-plugin-velux-KFX210.git`
1. Update your configuration file. See a sample `config.json` snippet below.

### Configuration

Example `config.json` entry:

 
```
"platforms": [
  {
    "platform": "VeluxKFX210",
    "state_poll_interval": 30
    "comfort_switch_time": 1
  }
]
```

Where:

* `state_poll_interval` is the polling interval in seconds for the `alarm` and `error` states.
* `comfort_switch_time` is the time in seconds for the comfort open or close relay to be switched on.

### Velux Integration

* Connect 5V from Automation HAT to the Common Terminals on Alarm (terminal 4) and Error (terminal 2) Velux connector blocks.
* Connect Alarm output (terminal 5) on Alarm Velux connector block to Buffered Input 1 on the Automation HAT.
* Connect Error output (terminal 3) on Error Velux connector block to Buffered Input 2 on the Automation HAT.
* Connect terminal 1 on Comfort Velux connector block to Normally Open Relay 1 on the Automation HAT. 
* Connect terminal 2 on Comfort Velux connector block to Normally Open Relay 2 on the Automation HAT.
* Connect terminal 3 on Comfort Velux connector block to Common on Relay 1 and Relay 2 on the Automation HAT.


