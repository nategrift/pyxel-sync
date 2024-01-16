#include <FastLED.h>
#include <HTTPUpdate.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <WiFi.h>

// Define the data pin (GPIO pin)
#define DATA_PIN 19
#define LED_PIN 2
#define BUTTON_PIN 4
#define BUZZER_PIN 17

#define NUM_LEDS 64
CRGB leds[NUM_LEDS];

class AnimationManager
{
public:
    AnimationManager(CRGB *leds);
    void applyPixelData(const uint8_t *data, size_t length);
    void runAnimation();

private:
    CRGB *_leds;
};

class NetworkManager
{
public:
    NetworkManager(const char *ssid, const char *password, const String &pyxelId, const String &pyxelPassword, const char *currentFirmwareVersion, const String &serverUrl);
    void connectToWiFi();
    bool fetchGridDetails();
    bool parseAnimationData(uint8_t *data, size_t dataSize);
    void checkForUpdates();

private:
    const char *_ssid;
    const char *_password;
    String _serverUrl;
    String _framesPath;
    String _firmwarePath;
};

const char *ssid = "<REDACTED>";
const char *password = "<REDACTED>";
const char *currentFirmwareVersion = "0.0.6";
String serverUrl = "http://pyxel.nategrift.com/api";
String pyxelId = "<REDACTED>";
String pyxelPassword = "<REDACTED>";

// Instances of your managers
NetworkManager netManager(ssid, password, pyxelId, pyxelPassword, currentFirmwareVersion, serverUrl);
AnimationManager animManager(leds);

// Task handles
TaskHandle_t Task1;
TaskHandle_t Task2;

// Define the structure for animation frames
struct Frame
{
    CRGB leds[NUM_LEDS];
    unsigned long duration;
};

Frame *frames = nullptr;
size_t numberOfFrames = 0;

void TaskNetworkManager(void *pvParameters)
{
    (void)pvParameters;

    static unsigned long lastRequestTime = 0;
    static unsigned long lastUpdateRequestTime = 0;

    for (;;)
    {
        // Ensure WiFi is connected
        if (WiFi.status() != WL_CONNECTED)
        {
            netManager.connectToWiFi();
        }

        unsigned long currentTime = millis();

        // get led status
        if (currentTime - lastRequestTime >= 5000)
        {
            netManager.fetchGridDetails();
            lastRequestTime = currentTime; // Update the last request time
        }

        // updates
        if (currentTime - lastUpdateRequestTime >= 30000)
        {
            netManager.checkForUpdates();
            lastUpdateRequestTime = currentTime;
        }

        vTaskDelay(10000 / portTICK_PERIOD_MS); // Delay between each network operation
    }
}

void TaskAnimationManager(void *pvParameters)
{
    (void)pvParameters;

    for (;;)
    {
        animManager.runAnimation();
    }
}

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

    // Create tasks
    xTaskCreatePinnedToCore(
        TaskNetworkManager,   // Task function
        "TaskNetworkManager", // Name of the task
        15000,                // Stack size in words
        NULL,                 // Task input parameter
        1,                    // Priority of the task
        &Task1,               // Task handle
        0);                   // Core where the task should run

    xTaskCreatePinnedToCore(
        TaskAnimationManager,
        "TaskAnimationManager",
        2000,
        NULL,
        2,
        &Task2,
        1); // Running on the other core
}

void loop()
{
    // Empty. The logic is handled in tasks.
}