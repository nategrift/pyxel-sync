
NetworkManager::NetworkManager(const char *ssid, const char *password, const String &pyxelId, const String &pyxelPassword, const char *currentFirmwareVersion, const String &serverUrl)
{
    this->_ssid = ssid;
    this->_password = password;
    this->_serverUrl = serverUrl;
    this->_framesPath = "/getDataRaw/" + pyxelId + "/" + pyxelPassword;
    this->_firmwarePath = "/firmware/" + pyxelId + "/" + pyxelPassword + "/" + currentFirmwareVersion;
}

void NetworkManager::connectToWiFi()
{
    while (true)
    { // Infinite loop to keep trying
        WiFi.begin(this->_ssid, this->_password);
        unsigned long startTime = millis();

        while (millis() - startTime < 60000)
        { // Try for up to 60 seconds
            if (WiFi.status() == WL_CONNECTED)
            {
                Serial.println("\nConnected to WiFi");
                return; // Exit the function once connected
            }
            delay(1000); // Check every second
            Serial.print(".");
        }

        // If not connected within 60 seconds, this point is reached
        Serial.println("\nConnection Timeout. Retrying...");
        WiFi.disconnect();
        delay(1000); // Short delay before retrying
    }
}

bool NetworkManager::fetchGridDetails()
{
    HTTPClient http;
    http.begin(this->_serverUrl + this->_framesPath);
    int httpCode = http.GET();

    if (httpCode > 0)
    {
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
            parseAnimationData(responseBody, len);
            http.end();
            return true;
        }
    }
    Serial.println("Failed to fetch grid details");
    http.end();
    return false;
}

bool NetworkManager::parseAnimationData(uint8_t *data, size_t dataSize)
{
    const size_t pixelsDataSize = NUM_LEDS * 3;      // 192 bytes for 64 RGB LEDs
    const size_t frameDataSize = pixelsDataSize + 4; // 196 bytes per frame

    // Calculate the number of frames in the data
    size_t numFrames = dataSize / frameDataSize;

    // Allocate memory for frames
    if (frames != nullptr)
    {
        delete[] frames;
    }
    frames = new Frame[numFrames];
    numberOfFrames = numFrames;

    for (size_t frameIndex = 0; frameIndex < numFrames; ++frameIndex)
    {
        size_t offset = frameIndex * frameDataSize;

        // Extract RGB values for each LED and fill the frames array
        for (size_t ledIndex = 0; ledIndex < NUM_LEDS; ++ledIndex)
        {
            size_t pixelOffset = offset + ledIndex * 3;
            frames[frameIndex].leds[ledIndex] = CRGB(data[pixelOffset], data[pixelOffset + 1], data[pixelOffset + 2]);
        }

        // Extract the frame duration in big-endian format and store in frames array
        frames[frameIndex].duration = (unsigned long)data[offset + pixelsDataSize] << 24 |
                                      (unsigned long)data[offset + pixelsDataSize + 1] << 16 |
                                      (unsigned long)data[offset + pixelsDataSize + 2] << 8 |
                                      (unsigned long)data[offset + pixelsDataSize + 3];
    }

    return true;
}

void NetworkManager::checkForUpdates()
{
    WiFiClient client;
    t_httpUpdate_return ret = httpUpdate.update(client, this->_serverUrl + this->_firmwarePath);

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
        ESP.restart();
        break;
    }
}