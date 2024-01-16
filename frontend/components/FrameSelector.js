import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import IconButton from './IconButton';
import Grid from './Grid';
import { convertToSeconds } from '../lib/utils';

const FrameSelector = ({
  frames,
  setCurrentFrame,
  selectedFrame,
  deleteFrame,
  addFrame,
}) => {
  return (
    <View style={styles.list}>
      {frames.map((grid, i) => (
        <Grid
          onPressHandler={() => setCurrentFrame(i)}
          grid={grid.pixels}
          style={{
            ...styles.grid,
            ...(selectedFrame == i ? styles.selectedFrame : {}),
          }}
        >
          {frames.length > 1 ? (
            <IconButton
              style={styles.closeButton}
              name="times"
              onPress={() => deleteFrame(i)}
              size={20}
              color="#b5b5b5"
            />
          ) : undefined}
          <Text style={styles.numberIndicator}>
            {convertToSeconds(grid.duration)}
          </Text>
        </Grid>
      ))}
      <Grid
        onPressHandler={addFrame}
        grid={new Array(64).fill('#000000')}
        key="new"
        style={styles.grid}
      >
        <IconButton
          onPress={addFrame}
          style={styles.plusButton}
          name="plus"
          size={40}
          color="#EB5E28"
        />
      </Grid>
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 20,
    overflow: 'scroll',
  },
  grid: {
    width: '20%',
    marginLeft: 20,
  },
  selectedFrame: {
    border: '1px solid #fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b5b5b5',
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: '1',
    backgroundColor: '#EB5E28',
    borderRadius: 100,
    width: 25,
    height: 25,
  },
  plusButton: {
    position: 'absolute',
    top: '50%',
    right: '50%',
    transform: 'translateX(50%) translateY(-50%)',
    zIndex: '1',
    backgroundColor: '#b5b5b5',
    borderRadius: 100,
    width: 60,
    height: 60,
  },
  numberIndicator: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    zIndex: '1',
    backgroundColor: '#2b2b2b',
    borderRadius: 100,
    height: 25,
    minWidth: 25,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b5b5b5',
    textAlign: 'center',
    lineHeight: 22,
    paddingRight: 2,
    paddingLeft: 3,
  },
});

export default FrameSelector;
