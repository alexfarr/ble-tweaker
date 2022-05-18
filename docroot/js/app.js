
var findBtn = document.getElementById("ble-find");

findBtn.addEventListener('click', function(event){
    navigator.bluetooth.requestDevice({'acceptAllDevices':true})
});