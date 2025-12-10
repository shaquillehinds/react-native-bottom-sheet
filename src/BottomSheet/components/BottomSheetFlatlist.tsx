//$lf-ignore
import Animated from 'react-native-reanimated';
import type {
  BottomSheetFlatlistProps,
  DefaultOnScroll,
} from '../config/bottomSheet.types';
import type { FlatList } from 'react-native';
import { bottomFlatlistController } from '../controller/bottomFlatlist.controller';
import { DragGesture } from '@shaquillehinds/react-native-essentials';

export function BottomSheetFlatlist<T>(props: BottomSheetFlatlistProps<T>) {
  const controller = bottomFlatlistController(props);

  if (!controller.context)
    return (
      <Animated.FlatList
        {...controller.flatlistProps}
        ref={controller.refFlatlist}
        onScroll={controller.onScroll as DefaultOnScroll}
      />
    );

  return (
    <DragGesture
      minDistance={15}
      enableContentScroll
      onDragStart={controller.context.onBeginScroll}
      onDrag={controller.context.onUpdateScroll}
      onDragEnd={controller.context.onEndScroll}
    >
      <Animated.FlatList
        {...controller.flatlistProps}
        onScrollBeginDrag={controller.onScrollBegin}
        onLayout={controller.onLayout}
        onContentSizeChange={controller.onContentSizeChange}
        ref={
          controller.refFlatlist ||
          (controller.context
            .scrollableComponentRef as React.RefObject<FlatList>)
        }
        bounces={false}
        onScroll={controller.animatedScrollHandler}
      />
    </DragGesture>
  );
}
