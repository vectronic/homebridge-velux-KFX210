import automationhat
import sys

if len(sys.argv) != 3:
    print('Usage: python ./relay.py <relayNumber> <state>')
else:

    relayNumber = sys.argv[1]
    state = sys.argv[2]

    if relayNumber == '1':
        if state == 'on':
            automationhat.relay.one.on()
        else:
            automationhat.relay.one.off()
    elif relayNumber == '2':
        if state == 'on':
            automationhat.relay.two.on()
        else:
            automationhat.relay.two.off()
    elif relayNumber == '3':
        if state == 'on':
            automationhat.relay.three.on()
        else:
            automationhat.relay.three.off()

