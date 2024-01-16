import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import IconButton from './IconButton';

const HelpMenu = ({ children }) => {
  const [isHelpShown, setHelpShown] = useState(false);
  return (
    <View>
      <IconButton
        name="question-circle"
        onPress={() => setHelpShown(true)}
        size={20}
        color="#b5b5b5"
        style={styles.help}
      />
      {isHelpShown ? (
        <View style={styles.container}>
          <IconButton
            name="times"
            onPress={() => setHelpShown(false)}
            size={20}
            color="#b5b5b5"
          />
          {typeof children == 'string' ? (
            <Text style={styles.text}>{children}</Text>
          ) : (
            <View style={styles.text}>{children}</View>
          )}
        </View>
      ) : undefined}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    alignItems: 'flex-end',
    width: '100%',
    backgroundColor: '#2b2b2b',
    padding: 20,
    bottom: 0,
    left: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#b5b5b5',
    width: '100%',
  },
  help: {
    position: 'fixed',
    left: 10,
    bottom: 10,
  },
});

export default HelpMenu;
