import { View } from 'react-native';
import Devices from './screens/Devices';

import { useSelector } from 'react-redux';
import ColorGrid from './screens/ColorGrid';

const Router = () => {
  const selectedDevice = useSelector((state) => state.selectedDevice);

  return <View>{selectedDevice ? <ColorGrid /> : <Devices />}</View>;
};

export default Router;
