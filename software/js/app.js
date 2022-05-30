let bleFindBtn = document.getElementById("bleDevice-find");
let bleResettBtn = document.getElementById("bleDevice-find");

let bleDeviceInfo = document.getElementById("bleDevice-info");
let modeElement = document.getElementById("mode");
let page = document.getElementsByClassName('page')[0];
let element = document.getElementsByClassName("element")[0];

let serviceUUID = '673b3bf6-ce60-4ee7-bbc1-065fbfb1fd65';
let knobCharUUID = '8a9a1143-ee50-45ac-b607-3c8354fc7fcf';
let sliderCharUUID = '9a9a1143-ee50-45ac-b607-3c8354fc7fcf';
let encoderCharUUID = '7a9a1143-ee50-45ac-b607-3c8354fc7fcf';
let encoderButtonCharUUID = '6a9a1143-ee50-45ac-b607-3c8354fc7fcf';

var bluetoothDevice;
let mouseMovePrevVal = 0;
var characteristics = {};

var Tweaker = {
  mode: 0,
  setMode: mode => {
    Tweaker.mode = mode;
  },
  doMode: (action, value) => {
    Tweaker.modeCallbacks[Tweaker.mode](action, value);
  },
  modeCallbacks: {
    0:(action, value) => {
      element.style.width = value + "px";
    },
    1:(action, value) => {
      element.style.height = value + "px";
    },
    2:(action, value) => {},
    3:(action, value) => {},
    4:(action, value) => {},
    5:(action, value) => {},
    6:(action, value) => {},
    7:(action, value) => {},
    8:(action, value) => {},
    9:(action, value) => {},
    10:(action, value) => {},
    11:(action, value) => {},
    12:(action, value) => {},
    13:(action, value) => {},
    14:(action, value) => {},
    15:(action, value) => {},
  }
};

page.addEventListener('mousemove', e => {
    let value = 0;
    if (e.offsetY > mouseMovePrevVal) {
        value = 1;
    } else {
        value = -1;
    }
    bluIncrementAction(value, thing);
    mouseMovePrevVal = e.offsetY;
});

/**
 *
 * @param {string} direction
 * @param {object} thingObject
 */
let bluIncrementAction = (direction, thingObject) => {
    if (direction == 1) {
        thingObject.value = thingObject.value + thingObject.step;
    } else if (direction == -1 && thingObject.value > 0) {
        thingObject.value = thingObject.value - thingObject.step;
    }
    thingObject.callback(thingObject);
};

let thing = {
    value: 0,
    step: 10,
    selector: "element",
    callback: (thingObject) => {
        document.getElementsByClassName(thingObject.selector)[0].style.height = thingObject.value + "px";
    },
};


bleFindBtn.addEventListener("click", onBleBtnClick);
//bleResettBtn.addEventListener("click", onResetButtonClick);

function onBleBtnClick() {
  return (bluetoothDevice ? Promise.resolve() : requestDevice())
  .then(connectDeviceAndCacheCharacteristics)
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

function requestDevice() {
    console.log('Requesting bleTweaker Bluetooth Device...');
  return navigator.bluetooth.requestDevice({
      filters: [{'services' : [serviceUUID]}]
  })
  .then(device => {
    bluetoothDevice = device;
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
  });
}

function connectDeviceAndCacheCharacteristics() {
  if (bluetoothDevice.gatt.connected && characteristicOne) {
    return Promise.resolve();
  }

  console.log('Connecting to GATT Server...');
  return bluetoothDevice.gatt.connect()
  .then(server => {
    console.log('Getting Service...');
    return server.getPrimaryService(serviceUUID);
  })
  .then(service => {
    console.log('Getting Characteristic...');
    return service.getCharacteristics();
  })
  .then(characteristicsRecieved => {
    characteristics = characteristicsRecieved;
    characteristics.forEach(characteristic => {
        //@TODO need to map to known characteristics
        characteristic.startNotifications().then(_ => {
          console.log("starting notifications for: " + _.uuid);
          characteristic.addEventListener('characteristicvaluechanged',
          handleCharateristicChanged);
        });
    });

    document.querySelector('#bleDevice-notify').disabled = false;
    document.querySelector('#bleDevice-stopNotify').disabled = true;
  });
}

function handleCharateristicChanged(event) {
  let characteristic = event.target;
  let charValue = characteristic.value.getInt8();
  if(characteristic.uuid === knobCharUUID){
    Tweaker.setMode(charValue);
    modeElement.innerHTML = charValue;

  }
  if(characteristic.uuid === encoderCharUUID) {
    Tweaker.doMode('knob', charValue);
  }
  if(characteristic.uuid === encoderButtonCharUUID) {
    Tweaker.doMode('button', charValue);
  }

  console.log('Char value is ' + charValue);
}

function onStartNotificationsButtonClick() {
    console.log('Starting Notifications...');
  characteristicOne.startNotifications()
  .then(_ => {
    console.log('> Notifications started');
    document.querySelector('#startNotifications').disabled = true;
    document.querySelector('#stopNotifications').disabled = false;
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

function onStopNotificationsButtonClick() {
    console.log('Stopping Notifications...');
  characteristicOne.stopNotifications()
  .then(_ => {
    console.log('> Notifications stopped');
    document.querySelector('#startNotifications').disabled = false;
    document.querySelector('#stopNotifications').disabled = true;
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}
/*
function onResetButtonClick() {
  if (characteristicOne) {
    characteristicOne.removeEventListener('characteristicvaluechanged',
        handleBatteryLevelChanged);
        characteristicOne = null;
  }
  // Note that it doesn't disconnect device.
  bluetoothDevice = null;
  console.log('> Bluetooth Device reset');
}*/

function onDisconnected() {
    console.log('> Bluetooth Device disconnected');
  connectDeviceAndCacheCharacteristics()
  .catch(error => {
    console.log('Argh! ' + error);
  });
}