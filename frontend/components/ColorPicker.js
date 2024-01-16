// ColorPicker.js
import React, { useEffect, useState } from 'react';
import ColorPicker, {
  HueSlider,
  BrightnessSlider,
  SaturationSlider,
} from 'reanimated-color-picker';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hexToRgb } from '../lib/colorUtils';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ColorChooser = ({ onSelectColor, currentColor }) => {
  const [savedColors, setSavedColors] = useState([]);
  function handleUpdateColor(color) {
    onSelectColor(color.hex);
  }

  useEffect(() => {
    loadSavedColors();
  }, []);

  const getBrightness = (color) => {
    const rgb = hexToRgb(color); // Assuming you already have this function
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  };

  function handleSaveColor(color) {
    let newColors;
    if (savedColors.length < 6) {
      newColors = [color, ...savedColors];
    } else {
      savedColors.splice(savedColors.length - 1, 1);
      newColors = [color, ...savedColors];
    }

    setSavedColors(newColors);
    saveColorToStorage(newColors);
  }

  function handleRemoveColor(index) {
    const newColors = [...savedColors];
    newColors.splice(index, 1);
    setSavedColors(newColors);
    saveColorToStorage(newColors);
  }

  async function loadSavedColors() {
    try {
      const savedColorsString = await AsyncStorage.getItem('savedColors');
      if (savedColorsString !== null) {
        setSavedColors(JSON.parse(savedColorsString));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function saveColorToStorage(newColors) {
    try {
      const jsonValue = JSON.stringify(newColors);
      await AsyncStorage.setItem('savedColors', jsonValue);
    } catch (error) {
      console.error(error);
    }
  }

  const renderColorItem = ({ item, index }) => (
    <TouchableOpacity
      onLongPress={() => handleRemoveColor(index)}
      onPress={() => onSelectColor(item)}
      style={[styles.colorItem, { backgroundColor: item }]}
    />
  );

  return (
    <View style={styles.container}>
      <ColorPicker
        style={styles.colorOptions}
        value={currentColor}
        onComplete={handleUpdateColor}
      >
        <HueSlider style={styles.colorSelectors} />
        <View style={styles.combinedSlider}>
          <BrightnessSlider
            style={{ ...styles.halfSlider, ...styles.colorSelectors }}
          />
          <SaturationSlider
            style={{ ...styles.halfSlider, marginLeft: '30px' }}
          />
        </View>
      </ColorPicker>
      <View style={styles.savedColorsContainer}>
        <TouchableOpacity onPress={() => handleSaveColor(currentColor)}>
          <View
            style={[styles.iconStyleCon, { backgroundColor: currentColor }]}
          >
            <Icon
              name="plus"
              size={30}
              color={getBrightness(currentColor) < 128 ? '#FFFFFF' : '#000000'}
              style={styles.iconStyle}
            />
          </View>
        </TouchableOpacity>
        <FlatList
          data={savedColors}
          renderItem={renderColorItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  colorOptions: {
    width: '100%',
    margin: 5,
    borderRadius: 5,
  },
  colorSelectors: {
    marginBottom: 10,
  },
  savedColorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    paddingTop: 0,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  combinedSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfSlider: {
    flex: 1,
  },
  iconStyle: {
    width: 30,
    height: 30,
    opacity: 0.8,
    lineHeight: 30,
    textAlign: 'center',
  },
  iconStyleCon: {
    padding: 5,
    backgroundColor: '#e6e6e6',
    marginRight: 10,
    borderRadius: 15,
    border: '0.5px solid #2b2b2b',
  },
});

export default ColorChooser;
