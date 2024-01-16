import React, { useState, useRef } from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

const SliderWidth = Dimensions.get('window').width - 40; // Slider width

const CustomSlider = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let newSliderValue = Math.max(
          0,
          Math.min(gestureState.dx, SliderWidth),
        );
        pan.x.setValue(newSliderValue);
        setSliderValue(Math.floor((newSliderValue / SliderWidth) * 100));
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: (sliderValue / 100) * SliderWidth, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.sliderTrack}>
        <Animated.View
          style={[styles.sliderThumb, { transform: [{ translateX: pan.x }] }]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sliderTrack: {
    width: SliderWidth,
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
  },
  sliderThumb: {
    width: 30,
    height: 30,
    backgroundColor: '#307ecc',
    borderRadius: 15,
    position: 'absolute',
  },
});

export default CustomSlider;
