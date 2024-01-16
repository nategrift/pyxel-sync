import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const Nav = ({ name, slot, style }) => {
  return (
    <View style={{ ...styles.container, ...style }}>
      <Text style={styles.text}>{name}</Text>
      <View>{slot}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: '5%',
    paddingRight: '5%',
    width: '100%',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b5b5b5',
  },
});

export default Nav;
