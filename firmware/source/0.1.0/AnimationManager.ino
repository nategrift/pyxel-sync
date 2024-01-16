
AnimationManager::AnimationManager(CRGB *leds)
{
    this->_leds = leds;
}

void AnimationManager::runAnimation()
{
    for (size_t frameIndex = 0; frameIndex < numberOfFrames; ++frameIndex)
    {
        // Update the LEDs to the current frame
        for (int ledIndex = 0; ledIndex < NUM_LEDS; ++ledIndex)
        {
            _leds[ledIndex] = frames[frameIndex].leds[ledIndex];
        }
        FastLED.show();

        // Wait for the duration of the current frame
        vTaskDelay(frames[frameIndex].duration / portTICK_PERIOD_MS);
    }
}