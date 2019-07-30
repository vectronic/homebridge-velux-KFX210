import automationhat
import sys

if len(sys.argv) != 2:
    print('Usage: python ./input.py <inputNumber>')
else:

    inputNumber = sys.argv[1]

    output = 0

    if inputNumber == '1':
        output = automationhat.input.one.read()
    elif inputNumber == '2':
        output = automationhat.input.two.read()
    elif inputNumber == '3':
        output = automationhat.input.three.read()

    print(str(output))
    sys.stdout.flush()

