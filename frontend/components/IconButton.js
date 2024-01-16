import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const IconButton = ({ name, onPress, size = 24, color = 'black', style }) => {
  return (
    <TouchableOpacity style={{ ...style, ...styles.button }} onPress={onPress}>
      <Icon name={name} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    // Add styles for your button
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
