#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <FastLED.h>
#include <HTTPUpdate.h>
#include <Arduino.h>

// Define the number of LEDs in your matrix
#define NUM_LEDS 64

// Define the data pin (GPIO pin)
#define DATA_PIN 19
#define LED_PIN 2
#define BUTTON_PIN 4
#define BUZZER_PIN 17

// Create a CRGB array to store the LED colors
CRGB leds[NUM_LEDS];

// CONFIG
const char *ssid = "Webster Flat";
const char *password = "xgllslayers";
const char *currentFirmwareVersion = "0.0.5";
String server = "http://pyxel.nategrift.com/api";
String pyxelId = "xgllslayers";
String pyxelPassword = "xgllslayers";

// UpdateData request parameters
String updatePath = "/getDataRaw/" + pyxelId + "/" + pyxelPassword;
String firmwarePath = "/firmware/" + pyxelId + "/" + pyxelPassword + "/" + currentFirmwareVersion;

void setup()
{
  Serial.begin(115200);
  // Initialize FastLED library
  FastLED.addLeds<WS2812, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(25); // Set the LED brightness (0-255)
  FastLED.setMaxPowerInVoltsAndMilliamps(5, 500);

  pinMode(LED_PIN, OUTPUT);

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(LED_PIN, HIGH);

  // Check if the ESP32 woke up from deep sleep and why
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0)
  {
    if (sendHttpsRequest())
    {

      FastLED.show();
    }
  }

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Perform the HTTPS request
  if (sendHttpsRequest())
  {
    // Parse and handle the JSON response
  }
}

void loop()
{
  static unsigned long lastRequestTime = 0;
  static unsigned long lastUpdateRequestTime = 0;
  unsigned long currentTime = millis();

  // get led status
  if (currentTime - lastRequestTime >= 5000)
  {
    if (sendHttpsRequest())
    {
      // The LEDs are updated in the applyPixelData function
      FastLED.show();
    }
    lastRequestTime = currentTime; // Update the last request time
  }

  // updates
  if (currentTime - lastUpdateRequestTime >= 30000)
  {
    checkForUpdates();
    lastUpdateRequestTime = currentTime;
  }

  // Check if the button is pressed (LOW means pressed if using a pullup resistor)
  if (digitalRead(BUTTON_PIN) == LOW)
  {
    Serial.println("Connecting to WiFi...");
    // Enable wake up by the button (external wakeup on pin BUTTON_PIN)
    esp_sleep_enable_ext0_wakeup(GPIO_NUM_4, LOW); // Wake up if button is low
    digitalWrite(LED_PIN, LOW);
    fill_solid(leds, NUM_LEDS, CRGB::Black);
    FastLED.show(); // Update the LED strip to apply the changes
    delay(1000);

    // Enter deep sleep
    esp_deep_sleep_start();
  }

  // No delay needed here, loop will continue running
  delay(20);
}

bool sendHttpsRequest()
{
  HTTPClient http;

  http.begin(server + updatePath); // HTTP
  int httpCode = http.GET();

  // httpCode will be negative on error
  if (httpCode > 0)
  {
    // file found at server
    if (httpCode == HTTP_CODE_OK)
    {
      int len = http.getSize();

      // Create buffer for the response
      uint8_t responseBody[len];

      // Get tcp stream
      WiFiClient *stream = http.getStreamPtr();

      // Read all data from server
      stream->readBytes(responseBody, len);

      // Use the data
      bool success = applyPixelData(responseBody, len / 3);
    }
    else
    {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] GET... code: %d\n", httpCode);
    }
  }
  else
  {
    Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();

  return true;
}

bool applyPixelData(uint8_t *data, size_t numPixels)
{
  bool changes = false;
  for (size_t i = 0; i < numPixels; ++i)
  {
    size_t dataIndex = i * 3;
    CRGB newColor = CRGB(data[dataIndex], data[dataIndex + 1], data[dataIndex + 2]);
    if (leds[i] != newColor)
    {
      leds[i] = newColor;
      changes = true;
    }
  }
  return changes;
}

void checkForUpdates()
{
  WiFiClient client;
  t_httpUpdate_return ret = httpUpdate.update(client, server + firmwarePath);

  switch (ret)
  {
  case HTTP_UPDATE_FAILED:
    Serial.printf("HTTP_UPDATE_FAILED Error (%d): %s\n", httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str());
    break;
  case HTTP_UPDATE_NO_UPDATES:
    Serial.println("HTTP_UPDATE_NO_UPDATES");
    break;
  case HTTP_UPDATE_OK:
    Serial.println("HTTP_UPDATE_OK");
    ESP.restart(); // Restart the ESP32 to apply the update
    break;
  }
}