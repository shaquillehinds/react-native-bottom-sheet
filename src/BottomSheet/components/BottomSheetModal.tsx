import {
  ModalBackgroundAnimated,
  ModalWrapper,
} from '@shaquillehinds/react-native-essentials';
import { forwardRef, type PropsWithChildren } from 'react';
import { bottomModalStyle as styles } from '../config/bottomSheet.styles';
import { BottomSheet } from '../components/BottomSheet';
import {
  type BottomSheetModalProps,
  type BottomSheetRefObject,
} from '../config/bottomSheet.types';
import { bottomSheetController } from '../controller';

export const BottomSheetModal = forwardRef(
  (
    props: PropsWithChildren<BottomSheetModalProps>,
    ref: BottomSheetRefObject
  ) => {
    const controller = bottomSheetController(props);
    return (
      <ModalWrapper
        useNativeModal={props.useNativeModal}
        enableBackgroundContentPress={props.enableBackgroundContentPress}
        onRequestClose={controller.onRequestClose}
        disableAndroidBackButton={props.disableAndroidBackButton}
      >
        {!props.enableBackgroundContentPress ? (
          <ModalBackgroundAnimated
            onPress={
              props.disableCloseOnBackdropPress
                ? undefined
                : controller.onModalBackdropPress
            }
            style={styles.background}
            animatedStyle={controller.backdropOpacityStyle}
            avoidStatusBar={props.useNativeModal}
          >
            {props.BackdropComponent}
          </ModalBackgroundAnimated>
        ) : undefined}
        <BottomSheet {...props} controller={controller} ref={ref}>
          {props.children}
        </BottomSheet>
      </ModalWrapper>
    );
  }
);
