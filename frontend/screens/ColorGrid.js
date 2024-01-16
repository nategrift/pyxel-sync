import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Button,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import ColorChooser from '../components/ColorPicker';
import PyxelGridSDK from '../lib/PyxelGridSDK';
import { useDispatch, useSelector } from 'react-redux';
import { hexToRgb, rgbToHex } from '../lib/colorUtils';
import Nav from '../components/Nav';
import IconButton from '../components/IconButton';
import { addAnimation, selectedDevice } from '../store/actions/deviceActions';
import HelpMenu from '../components/HelpMenu';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SavedGrids from '../components/SavedGrids';
import { capitalizeFirstLetter } from '../lib/utils';
import FrameSelector from '../components/FrameSelector';
import FrameDurationSlide from '../components/FrameDurationSlide';

const PICK_MODE = 'PICK_MODE';
const PAINT_MODE = 'PAINT_MODE';

const ColorGrid = () => {
  const [selectedColor, setSelectedColor] = useState('#FFFFFF'); // Default color
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gridFrames, setGridFrames] = useState([
    {
      pixels: new Array(64).fill('#000000'),
      duration: 1000,
    },
  ]);
  const [currentGridIndex, setCurrentGridIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [mode, setMode] = useState(PAINT_MODE);

  const [addSavedGridSlideFocus, setAddSavedGridSlideFocus] = useState(false);
  const [durationSlideFocus, setDurationSlideFocus] = useState(false);

  const currentlySelectedDevice = useSelector((state) => state.selectedDevice);
  const dispatch = useDispatch();

  const screenHeight = Dimensions.get('window').height;

  // Calculate 90% of the screen height
  const startValue = screenHeight * 0.9;

  const updateCurrentGridFrame = (grid) => {
    const updatedGridFrames = [...gridFrames];
    const duration = updatedGridFrames[currentGridIndex].duration;
    updatedGridFrames[currentGridIndex] = {
      pixels: grid,
      duration: duration,
    };
    setGridFrames(updatedGridFrames);
  };
  const updateCurrentGridFrameDuration = (duration) => {
    const updatedGridFrames = [...gridFrames];
    updatedGridFrames[currentGridIndex].duration = duration;
    setGridFrames(updatedGridFrames);
  };

  const handleSquareClick = (index) => {
    if (mode == PICK_MODE) {
      setSelectedColor(gridFrames[currentGridIndex].pixels[index]);
      setMode(PAINT_MODE);
    } else if (mode == PAINT_MODE) {
      const newGridColors = [...gridFrames[currentGridIndex].pixels];
      newGridColors[index] = selectedColor;
      applyChange(newGridColors);
      updateCurrentGridFrame(newGridColors);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    getData();
  };

  const getData = async () => {
    setError('');
    setLoading(true);
    const response = await PyxelGridSDK.getData(
      currentlySelectedDevice.id,
      currentlySelectedDevice.password,
    );
    if (!response.success) {
      setError(response.error);
    } else {
      const frames = response.data.frames.map((frame) => ({
        pixels: frame.pixels.map((pixel) =>
          rgbToHex(pixel.r, pixel.g, pixel.b),
        ),
        duration: frame.duration,
      }));
      setGridFrames(frames);

      // reset history
      setHistory([frames[0].pixels]);
      setCurrentHistoryIndex(0);
    }
    setLoading(false);
  };

  const onPressSubmit = async () => {
    setError('');
    setLoading(true);
    const frames = gridFrames.map((frame) => ({
      pixels: frame.pixels.map((hex) => hexToRgb(hex)),
      duration: frame.duration,
    }));
    try {
      const data = await PyxelGridSDK.updateData(
        currentlySelectedDevice.id,
        currentlySelectedDevice.password,
        frames,
      );
      console.log('PyxelSync Data:', data);
    } catch (error) {
      setError('Failed to fetch PyxelSync data:');
      console.error('Failed to fetch PyxelSync data:', error);
    }
    setLoading(false);
  };
  const onPressClear = async () => {
    const newContent = new Array(64).fill('#000000');
    applyChange(newContent);
    updateCurrentGridFrame(newContent);
  };

  function handleExitButton() {
    dispatch(selectedDevice(null));
  }

  function fillGrid() {
    const newState = new Array(64).fill(selectedColor);
    applyChange(newState);
    updateCurrentGridFrame(newState);
  }

  const applyChange = (newState) => {
    // Add the new state to the history and remove any future states if any
    const newHistory = [...history.slice(0, currentHistoryIndex + 1), newState];
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      updateCurrentGridFrame(history[currentHistoryIndex - 1]);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      updateCurrentGridFrame(history[currentHistoryIndex + 1]);
    }
  };

  const enableEyeDrop = () => {
    setMode(PICK_MODE);
  };

  const saveGrid = () => {
    dispatch(addAnimation(gridFrames));
  };

  const deleteFrame = (i) => {
    if (i == 0) {
      setCurrentGridIndex(0);
    } else {
      setCurrentGridIndex(i - 1);
    }

    const updatedGridFrames = [...gridFrames];
    updatedGridFrames.splice(i, 1);
    setGridFrames(updatedGridFrames);
  };

  const addFrame = () => {
    const updatedGridFrames = [...gridFrames];
    updatedGridFrames.push({
      ...gridFrames[currentGridIndex],
    });
    setCurrentGridIndex(currentGridIndex + 1);
    setGridFrames(updatedGridFrames);
  };

  const handleCloseDuration = () => {
    slideOut();
    setTimeout(() => {
      setDurationSlideFocus(false);
    }, 300);
  };

  // Animated value for sliding (start from 90% of the screen height)
  const slideAnim = useRef(new Animated.Value(startValue)).current;

  // Slide in
  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Slide out
  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: startValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseSlidein = () => {
    slideOut();
    setTimeout(() => {
      setAddSavedGridSlideFocus(false);
    }, 300);
  };

  // Trigger slide-in effect on mount
  useEffect(() => {
    if (addSavedGridSlideFocus) {
      slideIn();
    } else {
      slideOut();
    }
  }, [addSavedGridSlideFocus]);

  return (
    <View styles={styles.con}>
      <Nav
        name={capitalizeFirstLetter(`${currentlySelectedDevice.id}`)}
        slot={
          <View style={styles.icons}>
            <IconButton
              name="times"
              onPress={handleExitButton}
              size={20}
              color="#b5b5b5"
              style={styles.icon}
            />
            <IconButton
              name="sync"
              onPress={getData}
              size={20}
              color="#b5b5b5"
              style={styles.icon}
            />
          </View>
        }
      />
      <View style={styles.entireWidthCon}>
        <View style={styles.container}>
          {/* <View
            style={[styles.topBar, { backgroundColor: selectedColor }]}
          ></View> */}
          {error ? <Text style={styles.error}>Error: {error}</Text> : undefined}
          <View style={styles.grid}>
            {gridFrames[currentGridIndex].pixels.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.square,
                  {
                    backgroundColor: color,
                    border: color == '#FFFFFF' ? '1px solid #252422' : '',
                  },
                ]}
                onPress={() => handleSquareClick(index)}
              />
            ))}
          </View>
          <View style={styles.iconActions}>
            <IconButton
              name="clock"
              onPress={() => setDurationSlideFocus(true)}
              size={20}
              color="#b5b5b5"
              style={styles.icon}
            />
            <IconButton
              name="file-upload"
              onPress={saveGrid}
              size={20}
              color="#b5b5b5"
              style={styles.icon}
            />
            <IconButton
              name="file-download"
              onPress={() => setAddSavedGridSlideFocus(true)}
              size={20}
              color="#b5b5b5"
              style={styles.icon}
            />
            <IconButton
              name="fill-drip"
              onPress={fillGrid}
              size={20}
              color="#b5b5b5"
              style={styles.icon}
            />
            <IconButton
              name="snowplow"
              onPress={onPressClear}
              size={20}
              color="#b5b5b5"
              style={styles.icon}
            />
            <IconButton
              name="eye-dropper"
              onPress={enableEyeDrop}
              size={20}
              color={mode == PICK_MODE ? '#ffffff' : '#b5b5b5'}
              style={{
                ...styles.icon,
                ...(mode == PICK_MODE ? styles.selected : {}),
              }}
            />
            <IconButton
              name="undo"
              onPress={undo}
              size={20}
              color={currentHistoryIndex > 0 ? '#b5b5b5' : '#545454'}
              style={styles.icon}
            />
            <IconButton
              name="redo"
              onPress={redo}
              size={20}
              color={
                currentHistoryIndex < history.length - 1 > 0
                  ? '#b5b5b5'
                  : '#545454'
              }
              style={styles.icon}
            />
          </View>
          <ColorChooser
            onSelectColor={setSelectedColor}
            currentColor={selectedColor}
          />
          <FrameSelector
            frames={gridFrames}
            selectedFrame={currentGridIndex}
            setCurrentFrame={setCurrentGridIndex}
            deleteFrame={deleteFrame}
            addFrame={addFrame}
          />
        </View>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator
              style={styles.button}
              size="large"
              color="#EB5E28"
            />
          ) : (
            <View style={styles.button}>
              <Button onPress={onPressSubmit} title="Send" color="#bc491c" />
            </View>
          )}
        </View>
      </View>
      <HelpMenu>
        <View
          style={{
            ...styles.helpItem,
            borderBottomColor: '#b5b5b5',
            borderBottomWidth: 1,
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <Icon name="sync" size={20} color="#b5b5b5" />
          <Text style={styles.text}>
            Sync local with server version of grid
          </Text>
        </View>

        <View style={styles.helpItem}>
          <Icon name="file-download" size={20} color="#b5b5b5" />
          <Text style={styles.text}>
            Find animations to upload to this device
          </Text>
        </View>
        <View style={styles.helpItem}>
          <Icon name="file-upload" size={20} color="#b5b5b5" />
          <Text style={styles.text}>Save current animation (all frames)</Text>
        </View>
        <View style={styles.helpItem}>
          <Icon name="fill-drip" size={20} color="#b5b5b5" />
          <Text style={styles.text}>Fill grid with current color</Text>
        </View>
        <View style={styles.helpItem}>
          <Icon name="snowplow" size={20} color="#b5b5b5" />
          <Text style={styles.text}>Fill grid with black (off state)</Text>
        </View>
        <View style={styles.helpItem}>
          <Icon name="eye-dropper" size={20} color="#b5b5b5" />
          <Text style={styles.text}>Pick color</Text>
        </View>
        <View style={styles.helpItem}>
          <Icon name="undo" size={20} color="#b5b5b5" />
          <Text style={styles.text}>Undo</Text>
        </View>
        <View style={styles.helpItem}>
          <Icon name="redo" size={20} color="#b5b5b5" />
          <Text style={styles.text}>Redo</Text>
        </View>
      </HelpMenu>
      <Animated.View
        style={{
          ...styles.slideIn,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {addSavedGridSlideFocus ? (
          <SavedGrids
            close={() => handleCloseSlidein()}
            setAnimation={(animation) => {
              setCurrentGridIndex(0);
              setGridFrames(animation);
              handleCloseSlidein();
            }}
          />
        ) : undefined}
      </Animated.View>
      <Animated.View
        style={{
          ...styles.slideIn,
          transform: [{ translateY: -slideAnim }],
        }}
      >
        {durationSlideFocus ? (
          <FrameDurationSlide
            handleClose={() => handleCloseDuration()}
            setDuration={updateCurrentGridFrameDuration}
            duration={gridFrames[currentGridIndex].duration}
          />
        ) : undefined}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  con: {
    height: '100vh',
  },
  container: {
    paddingRight: 20,
    paddingLeft: 20,
  },
  entireWidthCon: {
    justifyContent: 'flex-start',
    height: '100%',
  },
  topBar: {
    width: '100%',
    height: 15,
    border: '1px solid #252422',
    borderRadius: 5,
    marginBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  square: {
    width: '12%', // 100% / 8
    aspectRatio: 1,
    borderRadius: 5,
    margin: '0.25%',
  },
  button: {
    marginTop: 20,
  },
  error: {
    color: '#EB5E28',
  },
  icons: {
    flexDirection: 'row-reverse',
  },
  icon: {
    marginLeft: 10,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  selected: {
    border: '1px solid #fff',
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#b5b5b5',
    marginLeft: 10,
  },
  helpItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 5,
  },
  slideIn: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
  },
});

export default ColorGrid;
