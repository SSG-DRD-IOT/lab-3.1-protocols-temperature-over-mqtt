/*
 * Author: Daniel Holmlund <daniel.w.holmlund@Intel.com>
 * Copyright (c) 2015 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

////////////////////////////////////////////////////////////////////////////////
// ISTV Block 1
// First load the MRAA library and set the serial communciation port
////////////////////////////////////////////////////////////////////////////////
var mraa = require("mraa");
mraa.addSubplatform(mraa.GENERIC_FIRMATA, "/dev/ttyACM0");
// end ISTV block

////////////////////////////////////////////////////////////////////////////////
// ISTV Block 2
// Load the MQTT library and setup the connections to the MQTT broker on the Gateway
////////////////////////////////////////////////////////////////////////////////
var mqtt = require('mqtt');
var mqttClient = mqtt.connect("mqtt://gateway-ip-address/");
// end ISTV block


// Include the JavaScript UPM libraries
var groveSensor = require('jsupm_grove');

// The Offset is necessary for Firmata
var OFFSET = 512;

// Instantiate the temperature sensor and LCD actuator
var temp = new groveSensor.GroveTemp(0 + OFFSET, 0.60); // Create a new instance of a Grove Temperature Sensor

// monitor: creates an anonymous function that runs once per second
// The function will get the temperature and display it on the LCD.
function monitor() {
  setInterval(function() {
    // Read the temperature sensor
    var celsius = temp.value();

    // Convert it to fahrenheit
    var fahrenheit = Math.round(celsius * 9.0 / 5.0 + 32.0);

    // Log it to the console window
    console.log(celsius + "° Celsius, or " + fahrenheit + "° Fahrenheit");

    // Get the current time
    var current_time = (new Date).getTime();

    /*
          This JSON structure is extremely important
          future labs will assume that every temperature
          reading has a "sensor_id", "value" and "timestamp"
        */
    var json = {
      sensor_id: "temperature",
      value: celsius,
      timestamp: current_time
    };

    // Convert the JSON object to a string
    var str = JSON.stringify(json);

    // Log the string to the console
    console.log(str);

    // Publish the temperature reading string on the MQTT topic
    mqttClient.publish("sensors/temperature/data", str);
  }, 1000);
}

// Call the monitor function once
monitor();
