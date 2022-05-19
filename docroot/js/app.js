let findBtn = document.getElementById("ble-find");
let page = document.getElementsByClassName('page')[0];
let element = document.getElementsByClassName("element");

findBtn.addEventListener('click', e => {
    navigator.bluetooth.requestDevice({'acceptAllDevices': true})
        .then(device => {
            // Human-readable name of the device.
            console.log(device.name);

            // Attempts to connect to remote GATT Server.
            return device.gatt.connect();
        })
        .then(service => {
            // Getting Battery Level Characteristic…
            return service.getCharacteristic('serial');
        })
        .then(characteristic => {
            // Reading Battery Level…
            return characteristic.readValue();
        })
});

let mouseMovePrevVal = 0;
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
