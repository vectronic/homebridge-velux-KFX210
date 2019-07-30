import automationhat
import sys
import time

if len(sys.argv) != 3:
    print('Usage: python ./relay.py <relayNumber> <onTime>')
else:

    relayNumber = sys.argv[1]
    onTime = sys.argv[2]

    if relayNumber == '1':
        automationhat.relay.one.on()
        time.sleep(float(onTime))
        automationhat.relay.one.off()
    elif relayNumber == '2':
        automationhat.relay.two.on()
        time.sleep(float(onTime))
        automationhat.relay.two.off()
    elif relayNumber == '3':
        automationhat.relay.three.on()
        time.sleep(float(onTime))
        automationhat.relay.three.off()
