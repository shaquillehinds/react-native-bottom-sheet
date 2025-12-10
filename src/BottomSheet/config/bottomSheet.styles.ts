import { StyleSheet } from 'react-native';
import { modalBottomOffset, modalHeight } from './bottomSheet.constants';
import {
  relativeShort,
  relativeX,
  relativeY,
  maxZIndex,
} from '@shaquillehinds/react-native-essentials';

export const bottomModalStyle = StyleSheet.create({
  bottomSheet: {
    backgroundColor: 'white',
    width: relativeX(100),
    height: modalHeight,
    borderRadius: relativeShort(7),
    position: 'absolute',
    bottom: modalBottomOffset,
    zIndex: maxZIndex,
    overflow: 'hidden',
  },
  contentContainer: {
    paddingBottom: relativeY(10),
  },
  bumper: {
    backgroundColor: 'rgba(156,170,180,0.3)',
    width: relativeX(15),
    borderRadius: 5,
    height: relativeY(0.2),
    alignSelf: 'center',
    marginVertical: relativeY(1.4),
  },
  bumperContainer: {
    zIndex: maxZIndex + 5,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: maxZIndex,
    backgroundColor: 'rgba(0,0,0,.1)',
    opacity: 1,
  },
});
