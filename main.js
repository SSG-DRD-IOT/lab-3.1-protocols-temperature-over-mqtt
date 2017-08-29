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
const mraa = require("mraa");
mraa.addSubplatform(mraa.GENERIC_FIRMATA, "/dev/ttyACM0");
// end ISTV block

////////////////////////////////////////////////////////////////////////////////
// ISTV Block 2
// Load the MQTT library, the certs and setup the parameters to make a connection
// to the MQTT broker on the Gateway
////////////////////////////////////////////////////////////////////////////////
const mqtt = require('mqtt');
var KEY = fs.readFileSync('/etc/tls-certs/certs/server.key');
var CERT = fs.readFileSync('/etc/tls-certs/certs/server.crt');
var TRUSTED_CA_LIST = [fs.readFileSync('/etc/tls-certs/ca_certificates/ca.crt')];

var options = {
  port: 'localhost',
  host: 8883,
  protocol: 'mqtts',
  protocolId: 'MQIsdp',
  keyPath: KEY,
  certPath: CERT,
  rejectUnauthorized : false,
  //The CA list will be used to determine if server is authorized
  ca: TRUSTED_CA_LIST,
  secureProtocol: 'TLSv1_method',
  protocolVersion: 3
};
var mqttClient = mqtt.connect(options);
// end ISTV block

////////////////////////////////////////////////////////////////////////////////
// ISTV Block 3
// Load the UPM library that contains the temperature sensor and declare
// an offset because we are using Firmata and instantiate a temperature sensor
////////////////////////////////////////////////////////////////////////////////
const upm = require('jsupm_grove');
const OFFSET = 512;
var temp = new upm.GroveTemp(0 + OFFSET);
// end ISTV block

////////////////////////////////////////////////////////////////////////////////
// ISTV Block 4
// use the setInterval to run a function to read from the temperature sensor
// and publish the value over MQTT once per second. Note that we will be publishing
// the sensor value over MQTT as a stringified JSON object.
////////////////////////////////////////////////////////////////////////////////
setInterval(function() {
// end ISTV block

  ////////////////////////////////////////////////////////////////////////////////
  // ISTV Block 5
  // Read the temperature sensor and get the current time
  ////////////////////////////////////////////////////////////////////////////////
  var celsius = temp.value();
  var current_time = (new Date).getTime();
  // end ISTV block

  ////////////////////////////////////////////////////////////////////////////////
  // ISTV Block 6
  // This JSON structure is extremely important. Future labs will assume that
  // every temperature reading has a "sensor_id", "value" and "timestamp"
  ////////////////////////////////////////////////////////////////////////////////
  var json = {
    sensor_id: "temperature",
    value: celsius,
    timestamp: current_time
  };
  // end ISTV block

  ////////////////////////////////////////////////////////////////////////////////
  // ISTV Block 7
  // Convert the JSON object to a string
  // Publish the temperature reading string on the MQTT topic
  ////////////////////////////////////////////////////////////////////////////////
  var str = JSON.stringify(json);
  mqttClient.publish("sensors/temperature/data", str);
  // end ISTV block

}, 1000);
