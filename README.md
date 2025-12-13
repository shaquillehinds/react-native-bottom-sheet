# @shaquillehinds/react-native-bottom-sheet

A performant, highly customizable bottom sheet component for React Native that just works. Built with React Native Reanimated and Gesture Handler for smooth 60fps animations and natural gesture interactions.

[![npm version](https://badge.fury.io/js/@shaquillehinds%2Freact-native-bottom-sheet.svg)](https://badge.fury.io/js/@shaquillehinds%2Freact-native-bottom-sheet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <img src="https://raw.githubusercontent.com/shaquillehinds/react-native-bottom-sheet/master/assets/bottomsheet.gif" alt="example" height="500"/>
  <img src="https://raw.githubusercontent.com/shaquillehinds/react-native-bottom-sheet/master/assets/bottomsheet2.gif" alt="example2" height="500"/>
</p>

## Features

- 🎯 **Multiple Snap Points** - Define custom snap positions as percentages of screen height
- 📱 **Keyboard Aware** - Intelligent keyboard avoidance with per-input customization
- 🎨 **Fully Customizable** - Style every aspect from bumper to backdrop
- 🔄 **Portal System** - Renders at app root level above navigation with `BottomSheetPortalProvider`
- 🎪 **Advanced Portal APIs** - Manual portal control with `useBottomSheetPortal` and `useBottomSheetPortalComponent`
- 📜 **Scrollable Content** - Built-in FlatList and ScrollView components with proper gesture handlin
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

### Setup

Wrap your app with `BottomSheetPortalProvider` at the root level:

```tsx
import { BottomSheetPortalProvider } from '@shaquillehinds/react-native-bottom-sheet';

export default function App() {
  return (
    <BottomSheetPortalProvider>
      {/* Your app content */}
    </BottomSheetPortalProvider>
  );
}
```

This provider enables bottom sheets to render at the top level of your app, above all other content including navigation.

## Quick Start

First, wrap your app with the portal provider:

```tsx
// App.tsx
import { BottomSheetPortalProvider } from '@shaquillehinds/react-native-bottom-sheet';

export default function App() {
  return (
    <BottomSheetPortalProvider>
      <YourApp />
    </BottomSheetPortalProvider>
  );
}
```

### Basic Modal Bottom Sheet

```tsx
import React, { useRef, useState } from 'react';
import { View, Text, Button } from 'react-native';
import {
  BottomSheetModal,
  useBottomSheetRef,
} from '@shaquillehinds/react-native-bottom-sheet';
import type { BottomModalRefObject } from '@shaquillehinds/react-native-bottom-sheet';

export default function MyScreen() {
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

## Portal System

The portal system allows bottom sheets to render at the root level of your app, ensuring they appear above all content including navigation stacks.

### `BottomSheetPortalProvider`

**Required**: Wrap your app root with this provider to enable portal functionality.

```tsx
import { BottomSheetPortalProvider } from '@shaquillehinds/react-native-bottom-sheet';

export default function App() {
  return (
    <BottomSheetPortalProvider>
      <Navigation />
    </BottomSheetPortalProvider>
  );
}
```

**Props:**

| Prop                  | Type     | Default | Description                                                        |
| --------------------- | -------- | ------- | ------------------------------------------------------------------ |
| `unMountBufferTimeMS` | `number` | `100`   | Delay before removing portal items (prevents premature unmounting) |
| `updateBufferTimeMS`  | `number` | -       | Throttle time for portal updates (prevents infinite update loops)  |

### `useBottomSheetPortal`

Access portal context to manually mount/update/unmount portal items.

```tsx
import { useBottomSheetPortal } from '@shaquillehinds/react-native-bottom-sheet';

function MyComponent() {
  const portal = useBottomSheetPortal();

  useEffect(() => {
    if (portal) {
      const key = portal.mount('my-portal-key', <MyPortalContent />);
      return () => portal.unmount(key);
    }
  }, []);

  return <View />;
}
```

**Methods:**

```typescript
{
  mount: (key: string | number, element: ReactNode, onMount?: (key) => void) => PortalKey;
  update: (key: string | number, element: ReactNode) => void;
  unmount: (key: string | number, onUnMount?: (key) => void) => void;
}
```

### `useBottomSheetPortalComponent`

Simplified hook for mounting a component to the portal with automatic lifecycle management.

```tsx
import { useBottomSheetPortalComponent } from '@shaquillehinds/react-native-bottom-sheet';

function MyComponent() {
  const [showOverlay, setShowOverlay] = useState(true);

  useBottomSheetPortalComponent({
    name: 'my-overlay',
    Component: showOverlay ? <OverlayContent /> : null,
    disable: !showOverlay,
  });

  return <View />;
}
```

**Props:**

| Prop                  | Type            | Description                                      |
| --------------------- | --------------- | ------------------------------------------------ |
| `name`                | `string`        | Unique identifier for the portal component       |
| `Component`           | `ReactNode`     | The component to render in the portal            |
| `disable`             | `boolean`       | Disables portal rendering when true              |
| `CustomPortalContext` | `React.Context` | Use a custom portal context (for scoped portals) |

### Types

```typescript
import type {
  PortalItem,
  PortalKey,
  PortalContextValue,
} from '@shaquillehinds/react-native-bottom-sheet';

type PortalItem = {
  key: PortalKey;
  element: ReactNode;
};

type PortalKey = number | string;
```

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

By default, bottom sheets use the portal system to render at the root level, ensuring they appear above all content.

#### Using Default Portal (Recommended)

The bottom sheet automatically uses the portal when `BottomSheetPortalProvider` is set up:

```tsx
// App.tsx
import { BottomSheetPortalProvider } from '@shaquillehinds/react-native-bottom-sheet';

export default function App() {
  return (
    <BottomSheetPortalProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BottomSheetPortalProvider>
  );
}

// HomeScreen.tsx - bottom sheet will render above navigation
<BottomSheetModal showModal={showModal} setShowModal={setShowModal}>
  <YourContent />
</BottomSheetModal>;
```

#### Disable Portal Rendering

If you want the bottom sheet to render in its natural position in the component tree:

```tsx
<BottomSheetModal
  disablePortal={true}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>
```

#### Custom Portal Context (Advanced)

Create scoped portals for specific parts of your app:

```tsx
import {
  BottomSheetPortalProvider,
  useBottomSheetPortal,
} from '@shaquillehinds/react-native-bottom-sheet';
import { createContext } from 'react';
import type { PortalContextValue } from '@shaquillehinds/react-native-bottom-sheet';

// Create a custom portal context
const MyCustomPortalContext = createContext<PortalContextValue | undefined>(
  undefined
);

// Wrap specific section with custom portal provider
function MySection() {
  return (
    <BottomSheetPortalProvider CustomPortalContext={MyCustomPortalContext}>
      <MySectionContent />
    </BottomSheetPortalProvider>
  );
}

// Use the custom context in your bottom sheet
<BottomSheetModal
  CustomPortalContext={MyCustomPortalContext}
  showModal={showModal}
  setShowModal={setShowModal}
>
  <YourContent />
</BottomSheetModal>;
```

#### Manual Portal Control

For advanced use cases where you need direct portal control:

```tsx
import { useBottomSheetPortal } from '@shaquillehinds/react-native-bottom-sheet';

function CustomPortalComponent() {
  const portal = useBottomSheetPortal();
  const [portalKey, setPortalKey] = useState<string | number | null>(null);

  const mountContent = () => {
    if (portal) {
      const key = portal.mount(
        'custom-content',
        <View style={{ padding: 20, backgroundColor: 'white' }}>
          <Text>Portal Content</Text>
        </View>,
        (key) => console.log('Mounted:', key)
      );
      setPortalKey(key);
    }
  };

  const updateContent = () => {
    if (portal && portalKey) {
      portal.update(
        portalKey,
        <View style={{ padding: 20, backgroundColor: 'blue' }}>
          <Text>Updated Content</Text>
        </View>
      );
    }
  };

  const unmountContent = () => {
    if (portal && portalKey) {
      portal.unmount(portalKey, (key) => console.log('Unmounted:', key));
      setPortalKey(null);
    }
  };

  return (
    <View>
      <Button title="Mount" onPress={mountContent} />
      <Button title="Update" onPress={updateContent} />
      <Button title="Unmount" onPress={unmountContent} />
    </View>
  );
}
```

#### Using Portal Component Hook

Simplified component-based portal management with automatic cleanup:

```tsx
import { useBottomSheetPortalComponent } from '@shaquillehinds/react-native-bottom-sheet';

function ToastNotification() {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);

  // Automatically mounts/unmounts based on show state
  useBottomSheetPortalComponent({
    name: 'toast-notification',
    Component: show ? (
      <View style={{ position: 'absolute', top: 50, alignSelf: 'center' }}>
        <Text>{message}</Text>
      </View>
    ) : null,
    disable: !show,
  });

  const showToast = (msg: string) => {
    setMessage(msg);
    setShow(true);
    setTimeout(() => setShow(false), 3000);
  };

  return <Button title="Show Toast" onPress={() => showToast('Hello!')} />;
}
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
// Component Props
import type {
  BottomSheetProps,
  BottomSheetModalProps,
  BottomSheetFlatlistProps,
  BottomSheetScrollViewProps,
} from '@shaquillehinds/react-native-bottom-sheet';

// Ref Types
import type {
  BottomModalRefObject,
  BottomSheetRefObject,
  BottomModalRef,
  BottomSheetRef,
} from '@shaquillehinds/react-native-bottom-sheet';

// State and Config Types
import type {
  ModalState,
  AnimateCloseModalProps,
  CloseModalProps,
  OpenModalProps,
} from '@shaquillehinds/react-native-bottom-sheet';

// Portal Types
import type {
  PortalItem,
  PortalKey,
  PortalContextValue,
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

### Custom Portal Overlay Example

```tsx
import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import {
  BottomSheetPortalProvider,
  useBottomSheetPortalComponent,
} from '@shaquillehinds/react-native-bottom-sheet';

// App root with provider
export default function App() {
  return (
    <BottomSheetPortalProvider>
      <MyScreen />
    </BottomSheetPortalProvider>
  );
}

// Screen with custom portal overlay
function MyScreen() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [message, setMessage] = useState('');

  // Mount custom overlay to portal
  useBottomSheetPortalComponent({
    name: 'custom-overlay',
    Component: showOverlay ? (
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setShowOverlay(false)}
      >
        <View style={styles.overlayContent}>
          <Text style={styles.overlayText}>{message}</Text>
          <Button title="Close" onPress={() => setShowOverlay(false)} />
        </View>
      </TouchableOpacity>
    ) : null,
    disable: !showOverlay,
  });

  const showCustomOverlay = (msg: string) => {
    setMessage(msg);
    setShowOverlay(true);
  };

  return (
    <View style={styles.container}>
      <Button
        title="Show Portal Overlay"
        onPress={() => showCustomOverlay('This is rendered in the portal!')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
```

### Multi-Level Portal Example

```tsx
import React, { createContext, useState } from 'react';
import { View, Button } from 'react-native';
import {
  BottomSheetPortalProvider,
  BottomSheetModal,
} from '@shaquillehinds/react-native-bottom-sheet';
import type { PortalContextValue } from '@shaquillehinds/react-native-bottom-sheet';

// Create custom portal contexts for different levels
const ScreenPortalContext = createContext<PortalContextValue | undefined>(
  undefined
);
const DialogPortalContext = createContext<PortalContextValue | undefined>(
  undefined
);

export default function App() {
  return (
    // Global portal for app-wide modals
    <BottomSheetPortalProvider>
      <Navigation />
    </BottomSheetPortalProvider>
  );
}

function MyScreen() {
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [showDialogModal, setShowDialogModal] = useState(false);

  return (
    // Screen-specific portal
    <BottomSheetPortalProvider CustomPortalContext={ScreenPortalContext}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button
          title="Open Screen Modal"
          onPress={() => setShowScreenModal(true)}
        />

        {/* Modal using screen portal */}
        <BottomSheetModal
          CustomPortalContext={ScreenPortalContext}
          showModal={showScreenModal}
          setShowModal={setShowScreenModal}
          snapPoints={[50]}
        >
          <View style={{ padding: 20 }}>
            <Text>Screen-level modal</Text>
            <Button
              title="Open Dialog"
              onPress={() => setShowDialogModal(true)}
            />

            {/* Nested modal using dialog portal */}
            <BottomSheetPortalProvider
              CustomPortalContext={DialogPortalContext}
            >
              <BottomSheetModal
                CustomPortalContext={DialogPortalContext}
                showModal={showDialogModal}
                setShowModal={setShowDialogModal}
                snapPoints={[30]}
              >
                <View style={{ padding: 20 }}>
                  <Text>Dialog-level modal</Text>
                </View>
              </BottomSheetModal>
            </BottomSheetPortalProvider>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetPortalProvider>
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

### Toast Notification (Using Portal)

```tsx
import { useBottomSheetPortalComponent } from '@shaquillehinds/react-native-bottom-sheet';

function useToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useBottomSheetPortalComponent({
    name: 'toast',
    Component: visible ? (
      <Animated.View
        entering={SlideInDown}
        exiting={SlideOutUp}
        style={{
          position: 'absolute',
          top: 50,
          alignSelf: 'center',
          backgroundColor: '#333',
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white' }}>{message}</Text>
      </Animated.View>
    ) : null,
    disable: !visible,
  });

  const show = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  return { show };
}

// Usage
function MyComponent() {
  const toast = useToast();

  return <Button title="Show Toast" onPress={() => toast.show('Hello!')} />;
}
```

### Loading Overlay (Using Portal)

```tsx
import { useBottomSheetPortalComponent } from '@shaquillehinds/react-native-bottom-sheet';

function useLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  useBottomSheetPortalComponent({
    name: 'loading-overlay',
    Component: isLoading ? (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    ) : null,
    disable: !isLoading,
  });

  return { setIsLoading };
}

// Usage
function MyComponent() {
  const { setIsLoading } = useLoadingOverlay();

  const handleSubmit = async () => {
    setIsLoading(true);
    await api.submit();
    setIsLoading(false);
  };

  return <Button title="Submit" onPress={handleSubmit} />;
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

**Also verify `BottomSheetPortalProvider` is set up at your app root:**

```tsx
// App.tsx
import { BottomSheetPortalProvider } from '@shaquillehinds/react-native-bottom-sheet';

export default function App() {
  return (
    <BottomSheetPortalProvider>
      <YourNavigator />
    </BottomSheetPortalProvider>
  );
}
```

### Modal appears behind navigation or other elements

This typically means the portal provider is not at a high enough level in your component tree. The provider should wrap your navigation container:

```tsx
// ✅ Correct - Provider wraps navigation
<BottomSheetPortalProvider>
  <NavigationContainer>
    <Stack.Navigator>
      {/* screens */}
    </Stack.Navigator>
  </NavigationContainer>
</BottomSheetPortalProvider>

// ❌ Incorrect - Provider inside navigation
<NavigationContainer>
  <BottomSheetPortalProvider>
    <Stack.Navigator>
      {/* screens */}
    </Stack.Navigator>
  </BottomSheetPortalProvider>
</NavigationContainer>
```

### Portal content flickers or unmounts unexpectedly

Adjust the `unMountBufferTimeMS` prop on the provider:

```tsx
<BottomSheetPortalProvider unMountBufferTimeMS={200}>
  <YourApp />
</BottomSheetPortalProvider>
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
