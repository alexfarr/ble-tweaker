#include <Arduino.h>
#include <NimBLEDevice.h>
#include "Adafruit_seesaw.h"
#include <seesaw_neopixel.h>

#define setbit(data,b) (data|=(1<<b)) //set the b bit of data to 1
#define clrbit(data,b) (data&=~(1<<b)) //set the b bit of data to 0
#define SS_SWITCH        24
#define SS_NEOPIX        6
#define SEESAW_ADDR          0x36


const uint8_t code1Pin = D3;
const uint8_t code2Pin = D5;
const uint8_t code4Pin = D4;
const uint8_t code8Pin = D2;

const uint8_t sliderPin = A0;
const uint8_t sliderEnablePin = D9;


// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID        "673b3bf6-ce60-4ee7-bbc1-065fbfb1fd65"
#define KNOB_CHARACTERISTIC_UUID "8a9a1143-ee50-45ac-b607-3c8354fc7fcf"
#define SLIDER_CHARACTERISTIC_UUID "9a9a1143-ee50-45ac-b607-3c8354fc7fcf"
#define ENCODER_CHARACTERISTIC_UUID "7a9a1143-ee50-45ac-b607-3c8354fc7fcf"

void readKnob();
void readEncoder();
void readSlider();

uint32_t Wheel(byte WheelPos);
uint8_t code8421 = 0;
Adafruit_seesaw ss;
seesaw_NeoPixel sspixel = seesaw_NeoPixel(1, SS_NEOPIX, NEO_GRB + NEO_KHZ800);
int32_t encoder_position;
int slider_value = 0;

BLECharacteristic* knobCharacteristic = null;
BLECharacteristic* sliderCharacteristic = null;
BLECharacteristic* encoderCharacteristic = null;

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);
  Serial.println("Starting BLE work!");

  pinMode(code8Pin, INPUT);
  pinMode(code4Pin, INPUT);
  pinMode(code2Pin, INPUT);
  pinMode(code1Pin, INPUT);

  pinMode(sliderPin, INPUT_PULLDOWN);
  pinMode(sliderEnablePin, OUTPUT);
  digitalWrite(sliderEnablePin, 0);

  BLEDevice::init("BLE Tweaker");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  knobCharacteristic = pService->createCharacteristic(
                                        KNOB_CHARACTERISTIC_UUID,
                                        NIMBLE_PROPERTY::READ |
                                        NIMBLE_PROPERTY::NOTIFY 
                                       );

  knobCharacteristic->setValue(0);
  sliderCharacteristic = pService->createCharacteristic(
                                        SLIDER_CHARACTERISTIC_UUID,
                                        NIMBLE_PROPERTY::READ |
                                        NIMBLE_PROPERTY::NOTIFY 
                                       );

  sliderCharacteristic->setValue(0);
  encoderCharacteristic = pService->createCharacteristic(
                                        ENCODER_CHARACTERISTIC_UUID,
                                        NIMBLE_PROPERTY::READ |
                                        NIMBLE_PROPERTY::NOTIFY 
                                       );

  sliderCharacteristic->encoderCharacteristic(0);
  pService->start();
  // BLEAdvertising *pAdvertising = pServer->getAdvertising();  // this still is working for backward compatibility
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMaxPreferred(0x12);

  BLEDevice::startAdvertising();
  
  // START OF SS 
  if (! ss.begin(SEESAW_ADDR) || ! sspixel.begin(SEESAW_ADDR)) {
    Serial.println("Couldn't find seesaw on default address");
    while(1) delay(10);
  }
  Serial.println("seesaw started");

  // set not so bright!
  sspixel.setBrightness(20);
  sspixel.show();
  
  // use a pin for the built in encoder switch
  ss.pinMode(SS_SWITCH, INPUT_PULLUP);

  // get starting position
  encoder_position = -ss.getEncoderPosition();

  Serial.println("Turning on interrupts");
  delay(10);
  ss.setGPIOInterrupts((uint32_t)1 << SS_SWITCH, 1);
  ss.enableEncoderInterrupt();
}

void loop() {
  readKnob();
  readSlider();
  readEncoder();
  // put your main code here, to run repeatedly:
  delay(2000);
}

void readEncoder() {
    if (! ss.digitalRead(SS_SWITCH)) {
    Serial.println("Button pressed!");
  }

  int32_t new_position = -ss.getEncoderPosition();
  // did we move arounde?
  if (encoder_position != new_position) {
    Serial.println(new_position);         // display new position

    // change the neopixel color
    sspixel.setPixelColor(0, Wheel(new_position & 0xFF));
    sspixel.show();
    encoder_position = new_position;      // and save for next round
  }
}

void readKnob() {
  uint8_t new_code8421 = 0;

  if (digitalRead(code8Pin) == HIGH){
    setbit(new_code8421, 3);
  }else{
    clrbit(new_code8421, 3);
  }

  if (digitalRead(code4Pin) == HIGH){
    setbit(new_code8421, 2);
  }else{
    clrbit(new_code8421, 2);
  }

  if (digitalRead(code2Pin) == HIGH){
    setbit(new_code8421, 1);
  }else{
    clrbit(new_code8421, 1);
  }

  if (digitalRead(code1Pin) == HIGH){
    setbit(new_code8421, 0);
  }else{
    clrbit(new_code8421, 0);
  }

  if(new_code8421 != code8421) {
    Serial.print("Now code8421 is:  ");
    knobCharacteristic.setValue(code8421);
    knobCharacteristic.notify(true);

    Serial.println(code8421, HEX);
    code8421 = new_code8421;
  }
}

void readSlider() {
  // Enable the slider.
  digitalWrite(sliderEnablePin, 1);
  
  // Read slider value;
  int value = analogRead(sliderPin);

  if(value != slider_value) {
    // Set and notify.
    knobCharacteristic.setValue();
    knobCharacteristic.notify(true);
    slider_value = value;
    Serial.print('Slider value: ');
    Serial.println(slider_value);
  }

  // Disable the slider.
  digitalWrite(sliderEnablePin, 0);
}

uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if (WheelPos < 85) {
    return sspixel.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if (WheelPos < 170) {
    WheelPos -= 85;
    return sspixel.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return sspixel.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}