
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

let BoxWidthProperty = {};
let BoxHeightProperty = {};
let BoxColourBlueProperty = {};
let BoxColourGreenProperty = {};
let BoxColourRedProperty = {};
let BoxXProperty = {};
let BoxYProperty = {};

var Tweaker = {
  mode: 0,
  setMode: mode => {
    Tweaker.mode = mode;
    switch (mode) {
      case 0:
        modeElement.innerHTML = "Box Width";
        break;
      case 1:
        modeElement.innerHTML = "Box Height";
        break;
      case 2:
        modeElement.innerHTML = "Box Blue";
        break;
      case 3:
        modeElement.innerHTML = "Box Green";
        break;
      case 4:
        modeElement.innerHTML = "Box Red";
        break;
      case 14:
        modeElement.innerHTML = "Box Y";
        break;
      case 15:
        modeElement.innerHTML = "Box X";
        break;
    }
  },
  doMode: (action, value) => {
    switch (action) {
      case "encoder":
        Tweaker.encoderCallbacks[Tweaker.mode](value);
        break;
      case "encoderButton":
        alert("Button pressed!");
        Tweaker.encoderButtonCallbacks[Tweaker.mode]();
        break;
      case "slider":
        console.log(value);
        Tweaker.sliderCallbacks[Tweaker.mode](value);
        break;
    }
  },
  encoderCallbacks: {
    0: (value) => {
      bleIncrementAction(value, BoxWidthProperty);
    },
    1: (value) => {
      bleIncrementAction(value, BoxHeightProperty);
    },
    2: (value) => {
      bleIncrementAction(value, BoxColourBlueProperty);
    },
    3: (value) => {
      bleIncrementAction(value, BoxColourGreenProperty);
    },
    4: (value) => {
      bleIncrementAction(value, BoxColourRedProperty);
    },
    5: (value) => { },
    6: (value) => { },
    7: (value) => { },
    8: (value) => { },
    9: (value) => { },
    10: (value) => { },
    11: (value) => { },
    12: (value) => { },
    13: (value) => { },
    14: (value) => {
      bleIncrementAction(value, BoxYProperty);
    },
    15: (value) => {
      bleIncrementAction(value, BoxXProperty);
    },
  },
  encoderButtonCallbacks: {
    0: (value) => {
    },
    1: (value) => {
    },
    2: (value) => {
    },
    3: (value) => {
    },
    4: (value) => {
    },
    5: (value) => { },
    6: (value) => { },
    7: (value) => { },
    8: (value) => { },
    9: (value) => { },
    10: (value) => { },
    11: (value) => { },
    12: (value) => { },
    13: (value) => { },
    14: (value) => {
    },
    15: (value) => {
    },
  },
  sliderCallbacks: {
    0: (value) => {
    },
    1: (value) => {
    },
    2: (value) => {
    },
    3: (value) => {
    },
    4: (value) => {
    },
    5: (value) => { },
    6: (value) => { },
    7: (value) => { },
    8: (value) => { },
    9: (value) => { },
    10: (value) => { },
    11: (value) => { },
    12: (value) => { },
    13: (value) => { },
    14: (value) => {
    },
    15: (value) => {
    },
  },
};

document.addEventListener('DOMContentLoaded', (event) => {

  BoxXProperty = {
    value: 0,
    step: 10,
    element: document.getElementsByClassName("element")[0],
    value: window.getComputedStyle(element).left,
    callback: function () {
      this.element.style.left = this.value + "px";
    },
  };

  BoxYProperty = {
    value: 0,
    step: 10,
    element: document.getElementsByClassName("element")[0],
    value: window.getComputedStyle(element).top,
    callback: function () {
      this.element.style.top = this.value + "px";
    },
  };

  BoxWidthProperty = {
    value: 0,
    step: 10,
    element: document.getElementsByClassName("element")[0],
    value: element.clientWidth,
    callback: function () {
      this.element.style.width = this.value + "px";
    },
  };

  BoxHeightProperty = {
    step: 10,
    element: document.getElementsByClassName("element")[0],
    value: element.clientHeight,
    callback: function () {
      this.element.style.height = this.value + "px";
    },
  };

  BoxColourRedProperty = {
    element: document.getElementsByClassName("element")[0],
    value: parseInt((element.style.backgroundColor.slice(1, 3) & 0), 16),
    step: 10,
    callback: function () {
      if (this.value > 256) {
        this.value = 255;
      } else if (this.value < 0) {
        this.value = 0;
      }
      console.log(this.value);

      if (!this.element.style.backgroundColor) {
        this.element.style.backgroundColor = "#000000";
      }

      let hexValue = rgb2hex(this.element.style.backgroundColor);
      let green = hexValue.slice(3, 5);
      let blue = hexValue.slice(5, 7);

      let red = this.value;

      let colour = "#" + zeroPad(red.toString(16), 2) + zeroPad(green, 2) + zeroPad(blue, 2);
      this.element.style.backgroundColor = colour;
    },
  };

  BoxColourGreenProperty = {
    element: document.getElementsByClassName("element")[0],
    value: parseInt((element.style.backgroundColor.slice(3, 5) & 0), 16),
    step: 10,
    callback: function () {
      if (this.value > 256) {
        this.value = 255;
      } else if (this.value < 0) {
        this.value = 0;
      }
      console.log(this.value);

      if (!this.element.style.backgroundColor) {
        this.element.style.backgroundColor = "#000000";
      }

      let hexValue = rgb2hex(this.element.style.backgroundColor);

      let red = hexValue.slice(1, 3);
      let blue = hexValue.slice(5, 7);

      let green = this.value;

      let colour = "#" + zeroPad(red, 2) + zeroPad(green.toString(16), 2) + zeroPad(blue, 2);
      this.element.style.backgroundColor = colour;
    },
  };


  BoxColourBlueProperty = {
    element: document.getElementsByClassName("element")[0],
    value: parseInt((element.style.backgroundColor.slice(5, 7) & 0), 16),
    step: 10,
    callback: function () {
      if (this.value > 256) {
        this.value = 255;
      } else if (this.value < 0) {
        this.value = 0;
      }
      console.log(this.value);

      if (!this.element.style.backgroundColor) {
        this.element.style.backgroundColor = "#000000";
      }

      let hexValue = rgb2hex(this.element.style.backgroundColor);

      let red = hexValue.slice(1, 3);
      let green = hexValue.slice(3, 5);

      let blue = this.value;

      let colour = "#" + zeroPad(red, 2) + zeroPad(green, 2) + zeroPad(blue.toString(16), 2);
      this.element.style.backgroundColor = colour;
    },
  };

  bleFindBtn.addEventListener("click", onBleBtnClick);
  //bleResettBtn.addEventListener("click", onResetButtonClick);
});

const zeroPad = (num, places) => String(num).padStart(places, '0');
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

/**
   *
   * @param {string} direction
   * @param {object} thingObject
   */
let bleIncrementAction = (direction, thingObject) => {
  if (direction == 1) {
    thingObject.value = parseInt(thingObject.value) + parseInt(thingObject.step);
  } else if (direction == -1 && thingObject.value > 0) {
    thingObject.value = parseInt(thingObject.value) - parseInt(thingObject.step);
  }
  thingObject.callback();
};

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
    filters: [{ 'services': [serviceUUID] }]
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
          
            if (characteristic.uuid === knobCharUUID) {
              characteristic.readValue().then(value => {
                Tweaker.setMode(value.getInt8());
              });
            }

            if (characteristic.uuid === sliderCharUUID) {
              characteristic.readValue().then(value => {
                Tweaker.doMode("slider", value.getInt8());
              });
            }
        });
      });

      document.querySelector('#bleDevice-notify').disabled = false;
      document.querySelector('#bleDevice-stopNotify').disabled = true;
    });
}

function handleCharateristicChanged(event) {
  let characteristic = event.target;
  let charValue = characteristic.value.getInt8();
  if (characteristic.uuid === knobCharUUID) {
    Tweaker.setMode(charValue);
  }
  if (characteristic.uuid === encoderCharUUID) {
    Tweaker.doMode("encoder", charValue);
  }
  if (characteristic.uuid === encoderButtonCharUUID) {
    Tweaker.doMode("encoderButton", charValue);
  }
  if (characteristic.uuid === sliderCharUUID) {
    charValue = characteristic.value.getUint8();
    Tweaker.doMode("slider", charValue);
  }
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