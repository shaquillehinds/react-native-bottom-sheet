import { useContext } from 'react';
import { useAnimatedScrollHandler } from 'react-native-reanimated';
import type {
  BottomSheetScrollViewProps,
  ReanimatedOnScroll,
} from '../config/bottomSheet.types';
import { BottomSheetContext } from '../components/BottomSheet';

export function bottomScrollViewController(props: BottomSheetScrollViewProps) {
  const { onScroll, refScrollView, ...scrollViewProps } = props;

  const context = useContext(BottomSheetContext);

  const scrollY = context?.scrollY;

  const animatedScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (scrollY) scrollY.value = event.contentOffset.y;
      // A worklet's captured values are constants on the UI runtime —
      // reassigning one fails to compile there and aborts on the first scroll.
      if (onScroll) (onScroll as ReanimatedOnScroll)(event);
    },
  });

  if (context && refScrollView)
    context.scrollableComponentRef.current = refScrollView.current;

  const assignRef = () => {
    if (!context) return;
    if (!context.scrollableComponentRef.current && refScrollView)
      context.scrollableComponentRef.current = refScrollView.current;
  };

  return {
    context,
    onScroll,
    assignRef,
    refScrollView,
    scrollViewProps,
    animatedScrollHandler,
  };
}
