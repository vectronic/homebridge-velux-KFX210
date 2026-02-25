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

1. Install Homebridge on the Raspberry PI: https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian
1. Install this plugin using: `sudo hb-service add homebridge-velux-kfx210`
1. Ensure `python`.
1. Install automation hat support: `https://github.com/pimoroni/automation-hat` as a user with sudo access (to allow system install):
   * `git clone https://github.com/pimoroni/automation-hat`
   * `cd automation-hat`
   * `./install.sh`
1. ALSO install automation hat support running in the `homebridge` user shell (to allow homebridge access to the virtual environment):
   * `sudo -u homebridge -H bash` and then:
   * `cd /home/homebridge`
   * `git clone https://github.com/pimoroni/automation-hat`
   * `cd automation-hat`
   * `./install.sh` (ctrl-c the steps requiring sudo access as these were done in the last step)
1. Update the `homebridge-velux-kfx210` plugin configuration See a sample `config.json` snippet below.
   *  NOTE: Make sure to set the `homebridge-velux-kfx210` plugin `python_path` property to use `pimoroni` virtual environment python installation (see example below).

### Configuration

Example `config.json` entry:

 
```
"platforms": [
  {
    "platform": "KFX210",
    "state_poll_interval": 3,
    "comfort_switch_time": 0.5,
    "python_path": "/home/homebridge/.virtualenvs/pimoroni/bin/python"
  }
]
```

Where:

* `state_poll_interval` is the polling interval in seconds for the `alarm` and `error` states. Default is `3`.
* `comfort_switch_time` is the time in seconds for the comfort open or close relay to be switched on. Default is `0.5`.
* `python_path` is the path to python for invoking automation HAT API. This should point to the virtual environment created by the Pimoroni automation hat installer when running as the `homebridge` user. Default is `/usr/bin/python`.

**NOTE**: The `comfort_switch_time` should be set to 0.5 seconds to simulate a momentary push of a comfort button.
Any longer and it will be treated as a button hold and therefore should be set to several seconds. 

### Velux Integration

The pinout for the Automation HAT is available [here](https://pinout.xyz/pinout/automation_hat)

The installation manual for Velux control panel ([PDF](https://weshare.velux.com/A/We%20Share/67803?encoding=UTF-8%C2%A0)) provides connector block information.

* Connect 5V from Automation HAT to the Common Terminals on Alarm (terminal 4) and Error (terminal 2) Velux connector blocks.
* Connect Alarm output (terminal 5) on Alarm Velux connector block to Buffered Input 1 on the Automation HAT.
* Connect Error output (terminal 3) on Error Velux connector block to Buffered Input 2 on the Automation HAT.
* Connect terminal 1 on Comfort Velux connector block to Normally Open Relay 1 on the Automation HAT. 
* Connect terminal 2 on Comfort Velux connector block to Normally Open Relay 2 on the Automation HAT.
* Connect terminal 3 on Comfort Velux connector block to Common on Relay 1 and Relay 2 on the Automation HAT.

