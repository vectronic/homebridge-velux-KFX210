# homebridge-velux-KFX210
> A [Homebridge](https://github.com/nfarina/homebridge) plugin integrating with a
> [Velux Smoke Vent](https://www.velux.co.uk/professional/products/roof-windows/special-function/smoke-ventilation-for-sloping-roof) 
> KFX 210 control panel via RaspberryPi + [Pimoroni Automation HAT](https://shop.pimoroni.com/products/automation-hat).

### Aim

Provides:
 
* contact sensor for alarm state
* contact sensor for error state
* open/close switch for comfort mode

The Pimoroni Automation HAT is controlled via the provided Python API with some extremely simple Python scripts which are spawned as required by 
this NodeJS plugin.

The KFX 210 control panel does not provide the ability to sense the current open/close comfort state of the
smoke vent. The state for this plugin defaults to closed on startup, so if you ensure the vent is indeed
closed at this point AND only use this plugin to open/close, the state will remain in sync.

Otherwise, you can use a separate Homekit sensor to maintain track of the vent comfort state.

### Installation

1. Install Homebridge using: `npm install -g homebridge`
1. Install this plugin using: `npm install -g homebridge-velux-kfx210`
1. Update your configuration file. See a sample `config.json` snippet below.

### Configuration

Example `config.json` entry:

 
```
"platforms": [
  {
    "platform": "KFX210",
    "state_poll_interval": 30,
    "comfort_switch_time": 1,
    "python_path": "/usr/local/python"
  }
]
```

Where:

* `state_poll_interval` is the polling interval in seconds for the `alarm` and `error` states.
* `comfort_switch_time` is the time in seconds for the comfort open or close relay to be switched on.
* `python_path` is the path to python for invoking automation HAT API

### Velux Integration

The pinout for the Automation HAT is available [here](https://pinout.xyz/pinout/automation_hat)

The installation manual for Velux control panel ([PDF](https://weshare.velux.com/A/We%20Share/67803?encoding=UTF-8%C2%A0)) provides connector block information.

* Connect 5V from Automation HAT to the Common Terminals on Alarm (terminal 4) and Error (terminal 2) Velux connector blocks.
* Connect Alarm output (terminal 5) on Alarm Velux connector block to Buffered Input 1 on the Automation HAT.
* Connect Error output (terminal 3) on Error Velux connector block to Buffered Input 2 on the Automation HAT.
* Connect terminal 1 on Comfort Velux connector block to Normally Open Relay 1 on the Automation HAT. 
* Connect terminal 2 on Comfort Velux connector block to Normally Open Relay 2 on the Automation HAT.
* Connect terminal 3 on Comfort Velux connector block to Common on Relay 1 and Relay 2 on the Automation HAT.

