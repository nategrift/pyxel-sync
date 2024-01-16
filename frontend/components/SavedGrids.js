import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Nav from './Nav';
import IconButton from './IconButton';
import { removeAnimation } from '../store/actions/deviceActions';
import Grid from './Grid';

const SavedGrids = ({ close, setAnimation }) => {
  const animations = useSelector((state) => state.animations);
  const dispatch = useDispatch();

  function animationPressedHandler(animation) {
    setAnimation(animation);
  }

  function deleteAnimation(grid) {
    dispatch(removeAnimation(grid));
  }
  return (
    <View style={styles.container}>
      <Nav
        style={styles.nav}
        name="Saved Grids"
        slot={
          <IconButton name="times" onPress={close} size={20} color="#b5b5b5" />
        }
      />
      <View style={styles.list}>
        {animations.length > 0 ? (
          animations.map((animation) => (
            <Grid
              onPressHandler={() => animationPressedHandler(animation)}
              grid={animation[0].pixels}
              key={animation}
              style={styles.grid}
            >
              <IconButton
                style={styles.closeButton}
                name="times"
                onPress={() => deleteAnimation(animation)}
                size={20}
                color="#b5b5b5"
              />
              <Text style={styles.frameCount}>{animation.length} frames</Text>
            </Grid>
          ))
        ) : (
          <Text style={styles.textAlt}>
            No animations saved yet, save one to see it here.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '90vh',
    width: '100%',
    position: 'fixed',
    alignItems: 'flex-start',
    backgroundColor: '#2b2b2b',
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
  },
  nav: {
    maxWidth: '500px',
  },
  list: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingLeft: '5%',
    paddingRight: '5%',
    maxWidth: '500px',
  },
  grid: {
    width: '45%',
    marginTop: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b5b5b5',
  },
  textAlt: {
    fontSize: 16,
    color: '#b5b5b5',
    textAlign: 'center',
    width: '100%',
    paddingTop: 20,
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
  frameCount: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    zIndex: '1',
    backgroundColor: '#b5b5b5',
    borderRadius: 100,
    height: 25,
    minWidth: 25,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b2b2b',
    textAlign: 'center',
    lineHeight: 22,
    paddingRight: 2,
    paddingLeft: 3,
  },
});

export default SavedGrids;
