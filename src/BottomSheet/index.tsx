import {
  createContext,
  forwardRef,
  useContext,
  type PropsWithChildren,
} from 'react';
import { BottomSheetModal as BottomSheetModalComponent } from './components/BottomSheetModal';
import {
  type BottomSheetProps,
  type BottomSheetModalProps,
  type BottomModalRefObject,
  type BottomSheetRefObject,
  type BottomModalContextProps,
} from './config/bottomSheet.types';
import { BottomSheet as BottomSheetComponent } from './components/BottomSheet';
import { BottomSheetFlatlist } from './components/BottomSheetFlatlist';
import { BottomSheetScrollView } from './components/BottomSheetScrollView';
import { bottomSheetController } from './controller';
import { useBottomSheetRef as useBottomSheetRefs } from './controller/hooks/useBottomSheetRef';
import { animateCloseTimingConfig } from './config/bottomSheet.constants';
import {
  usePortalComponent,
  ComponentMounter,
  ModalWrapper,
} from '@shaquillehinds/react-native-essentials';

export const BottomModalContext = createContext<BottomModalContextProps | null>(
  null
);

const BottomSheetModal = forwardRef(
  (
    props: PropsWithChildren<BottomSheetModalProps>,
    ref: BottomModalRefObject
  ) => {
    const { mounterRef, sheetRef, modalRef } = useBottomSheetRefs({
      ref,
      showModal: props.showModal,
      setShowModal: props.setShowModal,
    });
    const Modal = (
      <BottomModalContext.Provider value={{ modalRef }}>
        <ComponentMounter
          ref={mounterRef}
          showComponent={props.showModal}
          setShowComponent={props.setShowModal}
          unMountDelayInMilliSeconds={animateCloseTimingConfig.duration}
          onComponentShow={props.onModalShow}
          onComponentClose={props.onModalClose}
          component={
            <BottomSheetModalComponent
              {...props}
              _unMounter={() => mounterRef.current?.unMountComponent()}
              ref={sheetRef}
            />
          }
        />
      </BottomModalContext.Provider>
    );
    const portal = usePortalComponent({
      Component: Modal,
      name: 'smooth-bottom-modal',
      disable: props.disablePortal || props.useNativeModal,
      CustomPortalContext: props.CustomPortalContext,
    });
    if (portal && !props.disablePortal && !props.useNativeModal) {
      return <></>;
    } else {
      return Modal;
    }
  }
);

const BottomSheetControl = forwardRef(
  (props: PropsWithChildren<BottomSheetProps>, ref: BottomSheetRefObject) => {
    const controller = bottomSheetController(props);
    return (
      <ModalWrapper enableBackgroundContentPress>
        <BottomSheetComponent {...props} controller={controller} ref={ref} />
      </ModalWrapper>
    );
  }
);

const BottomSheet = forwardRef(
  (
    props: PropsWithChildren<BottomSheetModalProps>,
    ref: BottomModalRefObject
  ) => {
    const { mounterRef, sheetRef, modalRef } = useBottomSheetRefs({
      ref,
      showModal: props.showModal,
      setShowModal: props.setShowModal,
    });
    const Modal = (
      <BottomModalContext.Provider value={{ modalRef }}>
        <ComponentMounter
          ref={mounterRef}
          showComponent={props.showModal}
          setShowComponent={props.setShowModal}
          unMountDelayInMilliSeconds={animateCloseTimingConfig.duration}
          onComponentShow={props.onModalShow}
          onComponentClose={props.onModalClose}
          component={
            <BottomSheetControl
              {...props}
              _unMounter={() => mounterRef.current?.unMountComponent()}
              ref={sheetRef}
            />
          }
        />
      </BottomModalContext.Provider>
    );
    const portal = usePortalComponent({
      Component: Modal,
      name: 'smooth-bottom-modal',
      disable: props.disablePortal || props.useNativeModal,
      CustomPortalContext: props.CustomPortalContext,
    });
    if (portal && !props.disablePortal && !props.useNativeModal) {
      return <></>;
    } else {
      return Modal;
    }
  }
);

const useBottomSheetRef = () => {
  const context = useContext(BottomModalContext);
  return { modalRef: context?.modalRef };
};

export {
  BottomSheet,
  BottomSheetModal,
  BottomSheetFlatlist,
  BottomSheetScrollView,
  useBottomSheetRef,
};
