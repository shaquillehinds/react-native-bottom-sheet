# @shaquillehinds/react-native-bottom-sheet

A performant, highly customizable bottom sheet component for React Native that just works. Built with React Native Reanimated and Gesture Handler for smooth 60fps animations and natural gesture interactions.

[![npm version](https://badge.fury.io/js/@shaquillehinds%2Freact-native-bottom-sheet.svg)](https://badge.fury.io/js/@shaquillehinds%2Freact-native-bottom-sheet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Multiple Snap Points** - Define custom snap positions as percentages of screen height
- 📱 **Keyboard Aware** - Intelligent keyboard avoidance with per-input customization
- 🎨 **Fully Customizable** - Style every aspect from bumper to backdrop
- 🔄 **Portal Support** - Optional portal rendering for complex navigation hierarchies
- 📜 **Scrollable Content** - Built-in FlatList and ScrollView components with proper gesture handling
- ⚡ **High Performance** - Optimized animations using `useImperativeHandle` for render isolation
- 🎭 **Modal & Inline Modes** - Use as a full modal or inline component
- 🔒 **Type Safe** - Full TypeScript support with comprehensive type definitions
- 🌐 **Cross Platform** - iOS and Android support with platform-specific optimizations
- 🎬 **Flexible Drag Areas** - Configure draggable regions (full, bumper, or none)
- 💾 **Keep Mounted Option** - Persist component state with partial visibility
- ⏱️ **Content Loading Strategies** - Delay content rendering for improved performance

## Installation

```bash
npm install @shaquillehinds/react-native-bottom-sheet
```

or

```bash
yarn add @shaquillehinds/react-native-bottom-sheet
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react-native-reanimated react-native-gesture-handler @shaquillehinds/react-native-essentials
```

## Quick Start

### Basic Modal Bottom Sheet

```tsx
import React, { useRef, useState } from 'react';
import { View, Text, Button } from 'react-native';
import {
  BottomSheetModal,
  useBottomSheetRef,
} from '@shaquillehinds/react-native-bottom-sheet';
import type { BottomModalRefObject } from '@shaquillehinds/react-native-bottom-sheet';

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const bottomSheetRef = useRef<BottomModalRefObject>(null);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open Bottom Sheet" onPress={() => setShowModal(true)} />

      <BottomSheetModal
        ref={bottomSheetRef}
        showModal={showModal}
        setShowModal={setShowModal}
        snapPoints={[50, 75, 90]}
      >
        <View style={{ padding: 20 }}>
          <Text>Bottom Sheet Content</Text>
        </View>
      </BottomSheetModal>
    </View>
  );
}
```

### Inline Bottom Sheet

```tsx
import { BottomSheet } from '@shaquillehinds/react-native-bottom-sheet';

<BottomSheet
  showModal={showModal}
  setShowModal={setShowModal}
  snapPoints={[30, 60, 90]}
  keepMounted={true}
  bottomOffset={50}
>
  <YourContent />
</BottomSheet>;
```

## Core Components

### `BottomSheetModal`

Full-screen modal with backdrop. Ideal for most use cases.

### `BottomSheet`

Inline bottom sheet without backdrop. Useful for persistent UI elements.

### `BottomSheetFlatlist`

Optimized FlatList with proper gesture handling inside bottom sheets.

### `BottomSheetScrollView`

Optimized ScrollView with proper gesture handling inside bottom sheets.

## API Reference

### Props

#### `BottomSheetProps` (Common to both components)

| Prop                            | Type                                | Default        | Description                                                                                                     |
| ------------------------------- | ----------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| `showModal`                     | `boolean`                           | -              | Controls visibility of the bottom sheet                                                                         |
| `setShowModal`                  | `(bool: boolean) => void`           | -              | Callback to update visibility state                                                                             |
| `snapPoints`                    | `(number \| string)[]`              | `[25, 50, 75]` | Array of snap positions as percentages of screen height. Accepts numbers or strings (e.g., `[25, "50", "75%"]`) |
| `dragArea`                      | `'full' \| 'bumper' \| 'none'`      | `'bumper'`     | Defines draggable area of the modal                                                                             |
| `keepMounted`                   | `boolean`                           | `false`        | Prevents full unmounting when closed. Use with `bottomOffset` to keep visible                                   |
| `hideBumper`                    | `boolean`                           | `false`        | Hides the draggable bumper at top                                                                               |
| `avoidKeyboard`                 | `boolean`                           | `false`        | Adds padding when keyboard is visible                                                                           |
| `allowDragWhileKeyboardVisible` | `boolean`                           | `false`        | Allows dragging when keyboard is open (disabled by default to prevent conflicts)                                |
| `inputsForKeyboardToAvoid`      | `React.RefObject<TextInput>[]`      | -              | Specific inputs that trigger keyboard avoidance                                                                 |
| `bottomOffset`                  | `number`                            | `0`            | Pushes modal up from bottom. Useful with `keepMounted`                                                          |
| `style`                         | `StyleProp<ViewStyle>`              | -              | Style for the modal sheet container                                                                             |
| `backgroundColor`               | `string`                            | -              | Background color for modal and bumper                                                                           |
| `contentContainerStyle`         | `StyleProp<ViewStyle>`              | -              | Style for the content container                                                                                 |
| `bumperStyle`                   | `StyleProp<ViewStyle>`              | -              | Style for the bumper element                                                                                    |
| `bumperContainerStyle`          | `StyleProp<ViewStyle>`              | -              | Style for the bumper container                                                                                  |
| `BumperComponent`               | `() => React.ReactNode`             | -              | Custom bumper component                                                                                         |
| `disablePortal`                 | `boolean`                           | `false`        | Disables portal rendering                                                                                       |
| `CustomPortalContext`           | `React.Context<PortalContextValue>` | -              | Custom portal context for scoped portals                                                                        |

#### `BottomSheetModalProps` (Extends BottomSheetProps)

| Prop                          | Type              | Default | Description                               |
| ----------------------------- | ----------------- | ------- | ----------------------------------------- |
| `BackdropComponent`           | `React.ReactNode` | -       | Custom backdrop component                 |
| `onBackDropPress`             | `() => void`      | -       | Callback when backdrop is pressed         |
| `disableCloseOnBackdropPress` | `boolean`         | `false` | Prevents closing on backdrop press        |
| `useNativeModal`              | `boolean`         | `false` | Use React Native's native Modal component |

#### Callbacks

| Prop               | Type                                                | Description                            |
| ------------------ | --------------------------------------------------- | -------------------------------------- |
| `onModalShow`      | `() => void \| Promise<void>`                       | Called when modal finishes mounting    |
| `onModalClose`     | `() => void \| Promise<void>`                       | Called when modal finishes unmounting  |
| `onSnapPointReach` | `(snapPointIndex: number) => void \| Promise<void>` | Called when modal reaches a snap point |

#### Performance Optimization

| Prop               | Type                                                       | Description                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `showContentDelay` | `{ type?: 'mount' \| 'opacity', timeInMilliSecs: number }` | Delays content rendering for heavy components. Use `'mount'` for better performance with sluggish animations. Provide appropriate `minHeight` when using `'mount'` |

### Ref Methods

#### `BottomModalRef` (for BottomSheetModal and BottomSheet)

```typescript
const bottomSheetRef = useRef<BottomModalRefObject>(null);

// Open modal programmatically
bottomSheetRef.current?.openModal({
  onOpen: () => console.log('Modal opened'),
});

// Close modal with options
bottomSheetRef.current?.closeModal({
  skipAnimation: false, // Skip close animation
  isNavigating: false, // Fast close for navigation
  duration: 300, // Custom duration
  easing: Easing.linear, // Custom easing
  onClose: () => console.log('Modal closed'),
});

// Close instantly without animation
bottomSheetRef.current?.closeWithoutAnimation();

// Snap to specific index
bottomSheetRef.current?.snapToIndex(1);

// Snap to percentage
bottomSheetRef.current?.snapToPercentage(75);
bottomSheetRef.current?.snapToPercentage('80%');

// Get current state
const state = bottomSheetRef.current?.getModalState();
// Returns: ModalState.CLOSED | OPENING | OPEN | CLOSING
```

#### `BottomSheetRef` (for inline BottomSheet with BottomSheetControl)

```typescript
const sheetRef = useRef<BottomSheetRefObject>(null);

// Animate close
sheetRef.current?.animateCloseModal({
  duration: 300,
  easing: Easing.bezier(0.2, 0.32, 0, 1),
});

// Snap to index
sheetRef.current?.snapToIndex(2);

// Snap to percentage
sheetRef.current?.snapToPercentage(50);

// Get state
const state = sheetRef.current?.getModalState();
```

### Hook: `useBottomSheetRef`

Access the modal ref from within the bottom sheet component tree.

```tsx
import { useBottomSheetRef } from '@shaquillehinds/react-native-bottom-sheet';

function ContentComponent() {
  const { modalRef } = useBottomSheetRef();

  const handleClose = () => {
    modalRef?.current?.closeModal();
  };

  return <Button title="Close" onPress={handleClose} />;
}
```

## Advanced Usage

### Scrollable Content

#### Using BottomSheetFlatlist

```tsx
import {
  BottomSheetModal,
  BottomSheetFlatlist,
} from '@shaquillehinds/react-native-bottom-sheet';

<BottomSheetModal
  showModal={showModal}
  setShowModal={setShowModal}
  snapPoints={[50, 90]}
>
  <BottomSheetFlatlist
    data={items}
    renderItem={({ item }) => <ItemComponent item={item} />}
    keyExtractor={(item) => item.id}
  />
</BottomSheetModal>;
```

#### Using BottomSheetScrollView

```tsx
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from '@shaquillehinds/react-native-bottom-sheet';

<BottomSheetModal showModal={showModal} setShowModal={setShowModal}>
  <BottomSheetScrollView>{/* Your scrollable content */}</BottomSheetScrollView>
</BottomSheetModal>;
```

### Keyboard Handling

#### Global Keyboard Avoidance

```tsx
<BottomSheetModal
  avoidKeyboard={true}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <TextInput placeholder="Email" />
  <TextInput placeholder="Password" />
</BottomSheetModal>
```

#### Per-Input Keyboard Avoidance

```tsx
function FormComponent() {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  return (
    <BottomSheetModal
      inputsForKeyboardToAvoid={[emailRef, passwordRef]}
      showModal={showModal}
      setShowModal={setShowModal}
    >
      <TextInput ref={emailRef} placeholder="Email" />
      <TextInput ref={passwordRef} placeholder="Password" />
      <TextInput placeholder="Not tracked" />
    </BottomSheetModal>
  );
}
```

### Custom Bumper

```tsx
function CustomBumper() {
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <View
        style={{
          width: 100,
          height: 5,
          backgroundColor: 'blue',
          borderRadius: 3,
        }}
      />
      <Text style={{ marginTop: 10 }}>Drag me</Text>
    </View>
  );
}

<BottomSheetModal
  BumperComponent={CustomBumper}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>;
```

### Custom Backdrop

```tsx
function CustomBackdrop() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
      }}
    />
  );
}

<BottomSheetModal
  BackdropComponent={<CustomBackdrop />}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>;
```

### Persistent Bottom Sheet

Keep the sheet partially visible when "closed":

```tsx
<BottomSheet
  keepMounted={true}
  bottomOffset={50} // Shows 50px when closed
  snapPoints={[10, 50, 90]}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheet>
```

### Performance Optimization for Heavy Content

Use `showContentDelay` to improve modal animation performance:

```tsx
<BottomSheetModal
  showModal={showModal}
  setShowModal={setShowModal}
  contentContainerStyle={{ minHeight: 400 }}
  showContentDelay={{
    type: 'mount', // Delays mounting entirely
    timeInMilliSecs: 100,
  }}
>
  <HeavyComponent />
</BottomSheetModal>
```

Or use opacity animation:

```tsx
<BottomSheetModal
  showContentDelay={{
    type: 'opacity', // Fades in content
    timeInMilliSecs: 200,
  }}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>
```

### Snap Point Callbacks

```tsx
<BottomSheetModal
  snapPoints={[25, 50, 75]}
  onSnapPointReach={(index) => {
    console.log(`Reached snap point: ${index}`);
    if (index === 2) {
      // Reached highest snap point
    }
  }}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>
```

### Drag Configuration

#### Full Sheet Dragging

```tsx
<BottomSheetModal
  dragArea="full"
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>
```

#### Disable Dragging

```tsx
<BottomSheetModal
  dragArea="none"
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>
```

#### Allow Dragging with Keyboard

```tsx
<BottomSheetModal
  avoidKeyboard={true}
  allowDragWhileKeyboardVisible={true}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <TextInput />
</BottomSheetModal>
```

### Portal Management

By default, the bottom sheet uses a portal to render at the root level. You can customize this:

#### Disable Portal

```tsx
<BottomSheetModal
  disablePortal={true}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>
```

#### Custom Portal Context

```tsx
import { createPortalContext } from '@shaquillehinds/react-native-essentials';

const MyPortalContext = createPortalContext();

// In your app root
<MyPortalContext.Provider>
  <YourApp />
</MyPortalContext.Provider>

// In your component
<BottomSheetModal
  CustomPortalContext={MyPortalContext}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>
```

### Navigation Integration

For smooth navigation transitions on Android:

```tsx
const handleNavigateAndClose = () => {
  bottomSheetRef.current?.closeModal({
    isNavigating: true, // Reduces animation to 100ms
    onClose: () => {
      navigation.navigate('NextScreen');
    },
  });
};
```

Or skip animation entirely:

```tsx
bottomSheetRef.current?.closeModal({
  skipAnimation: true,
  onClose: () => navigation.navigate('NextScreen'),
});
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  BottomSheetProps,
  BottomSheetModalProps,
  BottomModalRefObject,
  BottomSheetRefObject,
  BottomModalRef,
  BottomSheetRef,
  ModalState,
  AnimateCloseModalProps,
  CloseModalProps,
  OpenModalProps,
} from '@shaquillehinds/react-native-bottom-sheet';
```

## Examples

### Complete Modal Example

```tsx
import React, { useRef, useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetRef,
} from '@shaquillehinds/react-native-bottom-sheet';
import type { BottomModalRefObject } from '@shaquillehinds/react-native-bottom-sheet';

export default function CompleteExample() {
  const [showModal, setShowModal] = useState(false);
  const bottomSheetRef = useRef<BottomModalRefObject>(null);

  const handleOpen = () => {
    bottomSheetRef.current?.openModal({
      onOpen: () => console.log('Modal opened!'),
    });
  };

  const handleSnapToTop = () => {
    bottomSheetRef.current?.snapToIndex(2);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open Modal" onPress={() => setShowModal(true)} />

      <BottomSheetModal
        ref={bottomSheetRef}
        showModal={showModal}
        setShowModal={setShowModal}
        snapPoints={[30, 60, 90]}
        backgroundColor="#ffffff"
        avoidKeyboard={true}
        onModalShow={() => console.log('Modal shown')}
        onModalClose={() => console.log('Modal closed')}
        onSnapPointReach={(index) => console.log('Snap point:', index)}
      >
        <BottomSheetScrollView>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>My Modal</Text>

            <TextInput
              placeholder="Enter text..."
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                marginBottom: 20,
              }}
            />

            <Button title="Snap to Top" onPress={handleSnapToTop} />

            <InnerComponent />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

function InnerComponent() {
  const { modalRef } = useBottomSheetRef();

  return (
    <Button
      title="Close from Inside"
      onPress={() => modalRef?.current?.closeModal()}
    />
  );
}
```

### Form with Validation Example

```tsx
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { BottomSheetModal } from '@shaquillehinds/react-native-bottom-sheet';
import type { BottomModalRefObject } from '@shaquillehinds/react-native-bottom-sheet';

export default function FormExample() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const bottomSheetRef = useRef<BottomModalRefObject>(null);

  const handleSubmit = () => {
    if (email && password) {
      console.log('Submitting:', { email, password });
      bottomSheetRef.current?.closeModal({
        onClose: () => {
          // Clear form after animation
          setEmail('');
          setPassword('');
        },
      });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Login" onPress={() => setShowModal(true)} />

      <BottomSheetModal
        ref={bottomSheetRef}
        showModal={showModal}
        setShowModal={setShowModal}
        snapPoints={[60]}
        inputsForKeyboardToAvoid={[emailRef, passwordRef]}
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

        <TextInput
          ref={emailRef}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            marginBottom: 15,
          }}
        />

        <TextInput
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            marginBottom: 20,
          }}
        />

        <Button title="Submit" onPress={handleSubmit} />
      </BottomSheetModal>
    </View>
  );
}
```

## Performance Best Practices

1. **Use `useImperativeHandle` pattern**: This package follows the render isolation pattern to prevent parent re-renders when animating

2. **Optimize heavy content**: Use `showContentDelay` with `type: 'mount'` for complex UIs:

   ```tsx
   <BottomSheetModal
     showContentDelay={{ type: 'mount', timeInMilliSecs: 100 }}
     contentContainerStyle={{ minHeight: 400 }}
   >
     <ComplexComponent />
   </BottomSheetModal>
   ```

3. **Memoize callbacks**: Use `useCallback` for callbacks to prevent unnecessary re-renders:

   ```tsx
   const handleSnapPoint = useCallback((index: number) => {
     console.log('Snap point:', index);
   }, []);
   ```

4. **Keep snap points stable**: Define snap points outside the component or use `useMemo`:
   ```tsx
   const snapPoints = useMemo(() => [30, 60, 90], []);
   ```

## Common Patterns

### Confirmation Dialog

```tsx
function ConfirmDialog() {
  const [show, setShow] = useState(false);

  return (
    <BottomSheetModal
      showModal={show}
      setShowModal={setShow}
      snapPoints={[30]}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Are you sure?</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Cancel" onPress={() => setShow(false)} />
        <Button title="Confirm" onPress={handleConfirm} />
      </View>
    </BottomSheetModal>
  );
}
```

### Selection List

```tsx
function SelectionList() {
  const [show, setShow] = useState(false);

  return (
    <BottomSheetModal
      showModal={show}
      setShowModal={setShow}
      snapPoints={[50, 80]}
    >
      <BottomSheetFlatlist
        data={options}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <Text style={{ padding: 15 }}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </BottomSheetModal>
  );
}
```

### Filter Panel

```tsx
function FilterPanel() {
  const [show, setShow] = useState(false);

  return (
    <BottomSheet
      keepMounted={true}
      bottomOffset={100}
      snapPoints={[10, 70]}
      showModal={show}
      setShowModal={setShow}
    >
      <BottomSheetScrollView>
        <FilterOptions />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
```

## Troubleshooting

### Modal doesn't appear

Ensure you've set up React Native Reanimated and Gesture Handler properly:

```tsx
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

### Scrolling issues

Always use `BottomSheetFlatlist` or `BottomSheetScrollView` for scrollable content inside the bottom sheet.

### Keyboard issues

Use `avoidKeyboard` or `inputsForKeyboardToAvoid` props and ensure inputs have proper refs.

### Android navigation glitches

Use `isNavigating` or `skipAnimation` when closing before navigation:

```tsx
bottomSheetRef.current?.closeModal({
  isNavigating: true,
  onClose: () => navigation.navigate('NextScreen'),
});
```

## Dependencies

- `react-native-reanimated` ^3.0.0
- `react-native-gesture-handler` ^2.0.0
- `@shaquillehinds/react-native-essentials` ^1.8.0

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

MIT © [Shaquille Hinds](https://github.com/shaquillehinds)

## Author

**Shaquille Hinds**

- GitHub: [@shaquillehinds](https://github.com/shaquillehinds)
- Email: shaqdulove@gmail.com

## Related Packages

- [@shaquillehinds/react-native-essentials](https://www.npmjs.com/package/@shaquillehinds/react-native-essentials) - Essential utilities and components for React Native

## Changelog

See [Releases](https://github.com/shaquillehinds/react-native-bottom-sheet/releases) for version history.

## Support

If you encounter any issues or have questions:

- Open an issue on [GitHub](https://github.com/shaquillehinds/react-native-bottom-sheet/issues)
- Check existing issues for solutions
- Review the examples in this README

## Acknowledgments

Built with React Native Reanimated and Gesture Handler for optimal performance and smooth interactions.
