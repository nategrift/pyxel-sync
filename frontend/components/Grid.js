import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const Grid = ({ grid, onPressHandler, style, children }) => {
  function handlePress() {
    if (onPressHandler) {
      onPressHandler(grid);
    }
  }
  return (
    <View style={{ ...styles.grid, ...style }}>
      {children}
      <TouchableOpacity onPress={handlePress} style={styles.subGrid}>
        {grid.map((color, index) => (
          <View
            key={index}
            style={[
              styles.square,
              {
                backgroundColor: color,
                border: color == '#FFFFFF' ? '1px solid #252422' : '',
              },
            ]}
          ></View>
        ))}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    position: 'relative',
  },
  subGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  square: {
    width: '12%', // 100% / 8
    aspectRatio: 1,
    borderRadius: '15%',
    margin: '0.25%',
  },
});

export default Grid;
