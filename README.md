# @shaquillehinds/react-native-bottom-sheet

A performant, highly customizable bottom sheet for React Native. Built on
Reanimated and Gesture Handler, with render isolation baked into the mounting
model so closed sheets cost nothing.

---

## Contents

- [Installation](#installation)
- [Setup](#setup)
- [Quick start](#quick-start)
- [The content component pattern](#the-content-component-pattern)
- [Components](#components)
- [Controlling the sheet](#controlling-the-sheet)
- [Snap points](#snap-points)
- [Scrollable content](#scrollable-content)
- [Keyboard handling](#keyboard-handling)
- [Persistent sheets](#persistent-sheets)
- [Appearance](#appearance)
- [Portal system](#portal-system)
- [API reference](#api-reference)
- [Recipes](#recipes)
- [Troubleshooting](#troubleshooting)
- [AI agent rules](#ai-agent-rules)

---

## Installation

```bash
npm install @shaquillehinds/react-native-bottom-sheet
```

Peer dependencies:

```bash
npm install react-native-reanimated react-native-gesture-handler @shaquillehinds/react-native-essentials
```

| Package                                   | Version |
| ----------------------------------------- | ------- |
| `react-native-reanimated`                 | ^3.0.0  |
| `react-native-gesture-handler`            | ^2.0.0  |
| `@shaquillehinds/react-native-essentials` | ^1.8.0  |

Reanimated's Babel plugin must be last in your plugin list:

```js
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

## Setup

Wrap your app root — **above** the navigation container:

```tsx
import { BottomSheetPortalProvider } from '@shaquillehinds/react-native-bottom-sheet';

export default function App() {
  return (
    <BottomSheetPortalProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </BottomSheetPortalProvider>
  );
}
```

Sheets render into this portal by default, which is what puts them above
navigation, tab bars and headers.

---

## Quick start

```tsx
import { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { BottomSheetModal } from '@shaquillehinds/react-native-bottom-sheet';

export default function Screen() {
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Button title="Open" onPress={() => setShowModal(true)} />

      <BottomSheetModal
        showModal={showModal}
        setShowModal={setShowModal}
        snapPoints={[50, 90]}
      >
        <SheetContent onDone={() => setShowModal(false)} />
      </BottomSheetModal>
    </View>
  );
}
```

Note the children are a component, not inline JSX. That is the pattern the whole
library is built around — the next section explains why.

---

## The content component pattern

### The idea

A closed sheet has its entire subtree unmounted. Anything you put in a **child
component** therefore does no work until the sheet opens: no state initialises, no
effects run, no queries fire, no lists build. Anything you put in the **wrapper's
function body** runs on every render of the screen that owns it, open or closed.

So: the wrapper is a shell. All state lives one level down.

```tsx
export default function ChooseFlashcards(props: ChooseFlashcardsProps) {
  const { colors, mode } = useTheme();

  return (
    <SmoothBottomModal
      showModal={props.toggled}
      setShowModal={props.setToggled}
      backgroundColor={colors.background[mode]}
      showContentDelay={{ timeInMilliSecs: 250, type: 'mount' }}
      snapPoints={[90]}
    >
      <ChooseFlashcardsContent {...props} />
    </SmoothBottomModal>
  );
}

function ChooseFlashcardsContent(props: ChooseFlashcardsProps) {
  const { relativeY, orientation } = useDeviceOrientation();
  const t = useTranslation();
  // ...everything else
}
```

Compare with the version that looks equivalent and is not:

```tsx
export default function ChooseFlashcards(props: ChooseFlashcardsProps) {
  // These run whenever the parent screen renders, with the sheet closed.
  const { data, isLoading } = useFlashcardSets(props.studySetId);
  const [selected, setSelected] = useState<FlashcardSet[]>([]);
  const rows = useMemo(() => buildRows(data), [data]);

  return (
    <SmoothBottomModal
      showModal={props.toggled}
      setShowModal={props.setToggled}
    >
      {rows.map((r) => (
        <Row key={r.id} {...r} />
      ))}
    </SmoothBottomModal>
  );
}
```

Every screen that renders a closed sheet pays for that hook stack. Across a dozen
sheets on a busy screen it is the difference between an instant navigation and a
visible stall.

### Why it works

`BottomSheetModal` passes its subtree through a `ComponentMounter` keyed on
`showModal`. While `showModal` is false, that subtree is not mounted. Constructing
the element `<ChooseFlashcardsContent {...props} />` is cheap — it is a plain
object. _Calling_ the component is the expensive part, and React only does that on
mount.

Hooks written directly in the wrapper are part of the parent's render, outside
the mounter, so they are unconditional.

### Pairing with `showContentDelay`

The pattern removes work while closed. `showContentDelay` moves the remaining work
out of the opening animation:

```tsx
showContentDelay={{ type: 'mount', timeInMilliSecs: 250 }}
```

The sheet animates open first, then mounts content behind a short fade. The user
sees a 60fps open instead of a stutter.

`type: 'mount'` means there is no content to measure when the sheet opens, so it
must be told its height. Either set `snapPoints` (preferred) or give
`contentContainerStyle` a `minHeight`. Without one, the sheet opens collapsed.

`type: 'opacity'` (the default when `type` is omitted) renders content immediately
and fades it in. Use it for light content where you only want the visual polish.

### State that must survive closing

State inside `*Content` is destroyed when the sheet closes — usually what you want.
When it needs to persist, own it in the screen and pass it down:

```tsx
// screen
const [selectedFlashcards, setSelectedFlashcards] = useState<FlashcardSet[]>(
  []
);

<ChooseFlashcards
  toggled={toggled}
  setToggled={setToggled}
  selectedFlashcards={selectedFlashcards}
  setSelectedFlashcards={setSelectedFlashcards}
  onFlashcardSelect={handleSelect}
  studySetId={studySetId}
/>;
```

Do not solve this by hoisting the state into the sheet wrapper. That reintroduces
exactly the cost the pattern removes.

---

## Components

### `BottomSheetModal`

The default. Renders with an animated backdrop, closes on backdrop press, handles
the Android back button.

### `BottomSheet`

Inline sheet with no backdrop. Renders with background content press enabled, so
taps pass through to what is behind it. Use for filter panels, mini players,
persistent drawers.

### `BottomSheetFlatlist` / `BottomSheetScrollView`

Scroll containers that coordinate with the sheet's drag gesture. See
[Scrollable content](#scrollable-content).

---

## Controlling the sheet

Two modes. Pick one.

### State-controlled

```tsx
const [showModal, setShowModal] = useState(false);

<BottomSheetModal showModal={showModal} setShowModal={setShowModal}>
  <Content />
</BottomSheetModal>;
```

You can wrap the setter to run side effects on open and close:

```tsx
setShowModal={(value: boolean) => {
  Keyboard.dismiss();
  props.setShowModal(value);
}}
```

### Ref-controlled

Omit `showModal` and `setShowModal` entirely. Useful for a sheet mounted once,
high in the tree, opened from anywhere in the app:

```tsx
export default function UploadMaterialModal() {
  const ref = useRef<BottomModalRef>(null);
  const setUploadModalRef = useApp((state) => state.setUploadModalRef);

  useEffect(() => {
    setUploadModalRef(ref);
  }, [ref.current]);

  return (
    <SmoothBottomModal
      ref={ref}
      disablePortal
      dragArea="full"
      snapPoints={[90]}
    >
      <UploadMaterialModalContent />
    </SmoothBottomModal>
  );
}

// anywhere
useApp.getState().uploadModalRef?.current?.openModal();
```

`disablePortal` is right here because the sheet is already mounted at root level —
there is nothing above it for the portal to lift it past.

### Ref methods

```tsx
const ref = useRef<BottomModalRef>(null);

ref.current?.openModal({ onOpen: () => {} });
ref.current?.closeModal({
  skipAnimation: false,
  isNavigating: false,
  duration: 300,
  easing: Easing.linear,
  onClose: () => {},
});
ref.current?.closeWithoutAnimation();
ref.current?.snapToIndex(1);
ref.current?.snapToPercentage(75); // or '75%'
ref.current?.getModalState(); // ModalState.CLOSED | OPENING | OPEN | CLOSING
```

Behaviour to be aware of on a **state-controlled** sheet:

| Call                                  | What actually happens                           |
| ------------------------------------- | ----------------------------------------------- |
| `openModal()`                         | `setShowModal(true)`                            |
| `openModal({ onOpen })`               | routes through the mounter so `onOpen` can fire |
| `closeModal()`                        | `setShowModal(false)`                           |
| `closeModal({ duration \| onClose })` | animates, then clears state after the animation |
| `closeModal({ isNavigating: true })`  | 100ms close — use before navigating             |
| `closeModal({ skipAnimation: true })` | immediate unmount                               |

### Ref typing

```tsx
const ref = useRef<BottomModalRef>(null); // ✅
```

`BottomModalRefObject` is `React.Ref<BottomModalRef>` — it types the `ref` _prop_
on the component, not the object `useRef` gives you. Using it in `useRef` produces
a doubly-wrapped type.

### Closing from inside the sheet

```tsx
import { useBottomSheetRef } from '@shaquillehinds/react-native-bottom-sheet';

function Footer() {
  const { modalRef } = useBottomSheetRef();
  return (
    <Button title="Close" onPress={() => modalRef?.current?.closeModal()} />
  );
}
```

Available anywhere inside the sheet's subtree. Returns `{ modalRef }` where
`modalRef` may be undefined outside a sheet, so optional-chain it.

---

## Snap points

Percentages of screen height. Numbers or strings both work:

```tsx
snapPoints={[25, 50, 75]}
snapPoints={['25', '50%', 90]}
```

- The sheet opens at index `0`. Order the array in the direction you want it read;
  `snapToIndex` uses the array's own indices.
- `onSnapPointReach(index)` fires when the sheet settles on one. Only active when
  `snapPoints` is set.
- Keep the array referentially stable — a module constant or `useMemo`.
- On orientation change, snap points are recomputed and the sheet re-snaps to
  index 0.

### Content-height mode

Omitting `snapPoints` is a supported mode, not an oversight. The sheet measures its
content on layout and opens to exactly that height, capped at roughly 110% of
screen height. Good for short, content-sized sheets — confirmation dialogs, small
action lists.

Dragging behaviour differs: with no snap points, a drag past half the content
height or a fast flick dismisses the sheet.

Content-height mode is incompatible with `showContentDelay: { type: 'mount' }`,
since there is nothing to measure at open time. Use `snapPoints`, or set a
`minHeight` on `contentContainerStyle`.

---

## Scrollable content

```tsx
import {
  BottomSheetModal,
  BottomSheetFlatlist,
} from '@shaquillehinds/react-native-bottom-sheet';

<BottomSheetModal snapPoints={[50, 90]} showModal={show} setShowModal={setShow}>
  <BottomSheetFlatlist
    data={items}
    renderItem={({ item }) => <Row item={item} />}
    keyExtractor={(item) => item.id}
  />
</BottomSheetModal>;
```

These wrap the underlying Reanimated list in a drag gesture that coordinates with
the sheet: the sheet drags when the list sits at a scroll boundary, the list
scrolls otherwise. A bare `FlatList` or `ScrollView` has no such coordination and
the two gestures will fight.

Notes:

- Props are the full underlying set — `FlatListPropsWithLayout` for the list,
  `AnimatedScrollViewProps` for the scroll view — with `onScroll` widened to also
  accept a Reanimated scroll event.
- Pass a custom ref via `refFlatlist` / `refScrollView`, not `ref`.
- `inverted` lists are supported; the sheet is told about the inversion.
- `bounces` is forced to `false` inside a sheet.
- Used outside a sheet, both fall back to a plain animated list/scroll view.
- Avoid `dragArea="full"` alongside a scrollable child. Keep the default `"bumper"`.

---

## Keyboard handling

### Whole-sheet avoidance

```tsx
<BottomSheetModal avoidKeyboard showModal={show} setShowModal={setShow}>
  <TextInput placeholder="Email" />
</BottomSheetModal>
```

### Per-input avoidance

Only shift for specific inputs — useful when a search field should move but a
comment box further down should not:

```tsx
const emailRef = useRef<TextInput>(null);
const passwordRef = useRef<TextInput>(null);

<BottomSheetModal
  inputsForKeyboardToAvoid={[emailRef, passwordRef]}
  showModal={show}
  setShowModal={setShow}
>
  <TextInput ref={emailRef} />
  <TextInput ref={passwordRef} />
  <TextInput placeholder="Not tracked" />
</BottomSheetModal>;
```

Dragging is disabled while the keyboard is open, since the two interactions
conflict. Override with `allowDragWhileKeyboardVisible` if you have a reason.

Do not add `KeyboardAvoidingView` — it will fight the built-in handling.

---

## Persistent sheets

`keepMounted` changes what a downward drag does: instead of dismissing, the sheet
snaps to its lowest snap point.

```tsx
<BottomSheet
  keepMounted
  snapPoints={[10, 70]}
  bottomOffset={100}
  showModal={show}
  setShowModal={setShow}
>
  <FilterPanel />
</BottomSheet>
```

Two things to know:

- **`keepMounted` requires `snapPoints`.** With no snap points it is ignored and
  a drag down will dismiss as usual.
- It governs the drag gesture only. `showModal={false}` still unmounts the sheet.

`bottomOffset` pushes the sheet up from the bottom of the screen, so its "closed"
position stays visible as a peek.

---

## Appearance

| Prop                    | Targets                                |
| ----------------------- | -------------------------------------- |
| `backgroundColor`       | Sheet surface **and** bumper container |
| `style`                 | The sheet surface                      |
| `contentContainerStyle` | The container wrapping your children   |
| `bumperStyle`           | The grab handle itself                 |
| `bumperContainerStyle`  | The area around the handle             |

Use `backgroundColor` rather than setting a background in `style` — the former
also colours the bumper container, so the handle area matches.

### Custom bumper

The custom component becomes the drag area when `dragArea` is `"bumper"`.

```tsx
function Bumper() {
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <View style={{ width: 100, height: 5, backgroundColor: '#888', borderRadius: 3 }} />
    </View>
  );
}

<BottomSheetModal BumperComponent={Bumper} ... />
```

### Custom backdrop

```tsx
<BottomSheetModal
  BackdropComponent={<BlurView intensity={40} style={StyleSheet.absoluteFill} />}
  onBackDropPress={() => track('dismiss')}
  ...
/>
```

`disableCloseOnBackdropPress` keeps `onBackDropPress` firing without closing.

### Drag area

| Value                | Behaviour                                             |
| -------------------- | ----------------------------------------------------- |
| `"bumper"` (default) | Only the handle drags                                 |
| `"full"`             | The whole sheet drags — avoid with scrollable content |
| `"none"`             | No dragging; close programmatically or via backdrop   |

`hideBumper` removes the handle. With `dragArea="bumper"` and `hideBumper`, there
is nothing left to drag — pair `hideBumper` with `"full"` or `"none"`.

---

## Portal system

Sheets render into a portal at app root so they sit above navigation. This is
automatic once `BottomSheetPortalProvider` is in place.

### `BottomSheetPortalProvider`

| Prop                  | Type            | Default | Description                             |
| --------------------- | --------------- | ------- | --------------------------------------- |
| `unMountBufferTimeMS` | `number`        | `100`   | Delay before removing portal items      |
| `updateBufferTimeMS`  | `number`        | –       | Throttle for portal updates             |
| `CustomPortalContext` | `React.Context` | –       | Scope this provider to a custom context |

### `disablePortal`

Renders the sheet where it sits in the tree. Correct when the sheet is already
mounted at root level, or when you want it scoped to a subtree.

### Scoped portals

Both provider and sheet must be handed the same context object:

```tsx
const ScreenPortalContext = createContext<PortalContextValue | undefined>(undefined);

<BottomSheetPortalProvider CustomPortalContext={ScreenPortalContext}>
  <BottomSheetModal CustomPortalContext={ScreenPortalContext} ...>
    <Content />
  </BottomSheetModal>
</BottomSheetPortalProvider>
```

### Non-sheet overlays

`useBottomSheetPortalComponent` mounts arbitrary content into the same portal with
automatic cleanup — toasts, loading overlays, anything that needs to sit above
everything:

```tsx
useBottomSheetPortalComponent({
  name: 'toast',
  Component: visible ? <Toast message={message} /> : null,
  disable: !visible,
});
```

`useBottomSheetPortal` gives the raw `{ mount, update, unmount }` API for manual
control.

You do not need either of these for a bottom sheet — the sheet portals itself.

---

## API reference

### `BottomSheetProps`

| Prop                            | Type                                                       | Default    | Description                                                                       |
| ------------------------------- | ---------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `showModal`                     | `boolean`                                                  | –          | Visibility. Omit for a ref-controlled sheet                                       |
| `setShowModal`                  | `(bool: boolean) => void`                                  | –          | Visibility setter                                                                 |
| `snapPoints`                    | `(number \| string)[]`                                     | –          | Percentages of screen height. Omit for content-height mode                        |
| `dragArea`                      | `'full' \| 'bumper' \| 'none'`                             | `'bumper'` | Draggable region                                                                  |
| `keepMounted`                   | `boolean`                                                  | `false`    | Drag down snaps to lowest snap point instead of dismissing. Requires `snapPoints` |
| `hideBumper`                    | `boolean`                                                  | `false`    | Remove the grab handle                                                            |
| `avoidKeyboard`                 | `boolean`                                                  | `false`    | Pad content when the keyboard is open                                             |
| `allowDragWhileKeyboardVisible` | `boolean`                                                  | `false`    | Permit dragging with the keyboard open                                            |
| `inputsForKeyboardToAvoid`      | `React.RefObject<TextInput>[]`                             | –          | Only avoid for these inputs                                                       |
| `bottomOffset`                  | `number`                                                   | `0`        | Push the sheet up from the bottom                                                 |
| `showContentDelay`              | `{ type?: 'mount' \| 'opacity'; timeInMilliSecs: number }` | –          | Defer content render past the open animation                                      |
| `style`                         | `StyleProp<ViewStyle>`                                     | –          | Sheet surface                                                                     |
| `contentContainerStyle`         | `StyleProp<ViewStyle>`                                     | –          | Content container                                                                 |
| `bumperStyle`                   | `StyleProp<ViewStyle>`                                     | –          | Grab handle                                                                       |
| `bumperContainerStyle`          | `StyleProp<ViewStyle>`                                     | –          | Handle container                                                                  |
| `backgroundColor`               | `string`                                                   | –          | Sheet and bumper container background                                             |
| `BumperComponent`               | `() => React.ReactNode`                                    | –          | Replace the default handle                                                        |
| `onModalShow`                   | `() => void \| Promise<void>`                              | –          | Fires when the sheet finishes mounting                                            |
| `onModalClose`                  | `() => void \| Promise<void>`                              | –          | Fires when the sheet finishes unmounting                                          |
| `onSnapPointReach`              | `(index: number) => void \| Promise<void>`                 | –          | Fires on settling at a snap point                                                 |
| `disablePortal`                 | `boolean`                                                  | `false`    | Render in place                                                                   |
| `CustomPortalContext`           | `React.Context<PortalContextValue>`                        | –          | Scoped portal                                                                     |

### `BottomSheetModalProps`

Extends `BottomSheetProps`.

| Prop                           | Type              | Default | Description                                  |
| ------------------------------ | ----------------- | ------- | -------------------------------------------- |
| `BackdropComponent`            | `React.ReactNode` | –       | Custom backdrop                              |
| `onBackDropPress`              | `() => void`      | –       | Backdrop press callback                      |
| `disableCloseOnBackdropPress`  | `boolean`         | `false` | Keep open on backdrop press                  |
| `useNativeModal`               | `boolean`         | `false` | Render inside RN's native `Modal`            |
| `enableBackgroundContentPress` | `boolean`         | `false` | Drop the backdrop; taps reach content behind |
| `disableAndroidBackButton`     | `boolean`         | `false` | Ignore the hardware back button              |

### `BottomSheetFlatlistProps<T>`

`Omit<FlatListPropsWithLayout<T>, 'onScroll'>` plus:

| Prop          | Type                                    |
| ------------- | --------------------------------------- |
| `onScroll`    | `ReanimatedOnScroll \| DefaultOnScroll` |
| `refFlatlist` | `React.RefObject<FlatList>`             |

### `BottomSheetScrollViewProps`

`Omit<AnimatedScrollViewProps, 'onScroll'>` plus:

| Prop            | Type                                    |
| --------------- | --------------------------------------- |
| `onScroll`      | `ReanimatedOnScroll \| DefaultOnScroll` |
| `refScrollView` | `React.RefObject<AnimatedScrollView>`   |

### Ref types

```ts
type BottomModalRef = {
  getModalState: () => ModalState | undefined;
  openModal: (props?: OpenModalProps) => void;
  closeModal: (props?: CloseModalProps) => void;
  closeWithoutAnimation: () => void;
  snapToIndex: (index: number) => void;
  snapToPercentage: (percentage: number | string) => void;
};

type OpenModalProps = { onOpen?: () => void };

type CloseModalProps = {
  skipAnimation?: boolean;
  isNavigating?: boolean;
  onClose?: () => void;
  duration?: number;
  easing?: EasingFunction | EasingFunctionFactory;
};

enum ModalState {
  CLOSED = 0,
  OPENING = 1,
  OPEN = 2,
  CLOSING = 3,
}
```

### Exports

```ts
// Components
(BottomSheet, BottomSheetModal, BottomSheetFlatlist, BottomSheetScrollView);

// Hooks
(useBottomSheetRef, useBottomSheetPortal, useBottomSheetPortalComponent);

// Provider
BottomSheetPortalProvider;

// Types
(BottomSheetProps,
  BottomSheetModalProps,
  BottomSheetFlatlistProps,
  BottomSheetScrollViewProps,
  BottomModalRef,
  BottomSheetRef,
  BottomModalRefObject,
  BottomSheetRefObject,
  ModalState,
  OpenModalProps,
  CloseModalProps,
  AnimateCloseModalProps,
  PortalItem,
  PortalKey,
  PortalContextValue);
```

---

## Recipes

### Action list

The wrapper stays thin; the option array — which closes over `router` and the
setter — is built inside the content component, so it is never constructed while
the sheet is closed.

```tsx
export default function ChatAppsModal(props: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { colors, mode } = useTheme();

  return (
    <SmoothBottomModal
      showModal={props.showModal}
      setShowModal={(value: boolean) => {
        Keyboard.dismiss();
        props.setShowModal(value);
      }}
      backgroundColor={colors.background[mode]}
      showContentDelay={{ timeInMilliSecs: 250, type: 'mount' }}
      snapPoints={[85]}
    >
      <ChatAppsModalContent {...props} mode={mode} colors={colors} />
    </SmoothBottomModal>
  );
}

function ChatAppsModalContent({ setShowModal, colors, mode }: ContentProps) {
  const apps = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      onPress: () => {
        setShowModal(false);
        router.push('/platform/practice/flashcards');
      },
    },
    // ...
  ];

  return <Layout padding={[2, 4]}>{/* render apps */}</Layout>;
}
```

### Global sheet driven from a store

```tsx
export default function UploadMaterialModal() {
  const ref = useRef<BottomModalRef>(null);
  const setUploadModalRef = useApp((state) => state.setUploadModalRef);
  useEffect(() => {
    setUploadModalRef(ref);
  }, [ref.current]);
  const { colors, mode } = useTheme();

  return (
    <SmoothBottomModal
      ref={ref}
      disablePortal
      dragArea="full"
      snapPoints={[90]}
      backgroundColor={colors.background[mode]}
    >
      <UploadMaterialModalContent />
    </SmoothBottomModal>
  );
}
```

Mount it once near the app root. Anything can open it via the stored ref.

### Selection sheet with state owned by the screen

```tsx
function ChooseFlashcardsContent(props: ChooseFlashcardsProps) {
  const t = useTranslation();

  return (
    <>
      <SelectFlashcardSetsList
        selectedFlashcardSets={props.selectedFlashcards}
        setSelectedFlashcardSets={props.setSelectedFlashcards}
        searchBar
      />
      <PrimaryButton
        disabled={props.selectedFlashcards.length === 0}
        onPress={() => {
          props.onFlashcardSelect(props.selectedFlashcards);
          props.setToggled(false);
        }}
      >
        {t('confirm')}
      </PrimaryButton>
    </>
  );
}
```

Selection survives close and reopen because the screen holds it.

### Closing before navigating

```tsx
ref.current?.closeModal({
  isNavigating: true,
  onClose: () => navigation.navigate('NextScreen'),
});
```

Or skip the animation entirely with `skipAnimation: true`.

---

## Troubleshooting

**Sheet does not appear.** Check the Reanimated Babel plugin is installed and last
in the list, and that `BottomSheetPortalProvider` is mounted at the app root.

**Sheet renders behind navigation.** The provider is too low in the tree. It must
wrap `NavigationContainer`, not sit inside it.

**Sheet opens collapsed or very short.** Using `showContentDelay: { type: 'mount' }`
without `snapPoints` or a `minHeight` on `contentContainerStyle`. There is nothing
to measure at open time.

**Scrolling and dragging fight each other.** Swap the bare `FlatList` / `ScrollView`
for `BottomSheetFlatlist` / `BottomSheetScrollView`, and drop `dragArea="full"`.

**Drag down still dismisses despite `keepMounted`.** `keepMounted` has no effect
without `snapPoints`.

**Sheet cannot be dragged.** Either `dragArea="none"`, or `hideBumper` combined
with the default `dragArea="bumper"`, or the keyboard is open — dragging is
disabled while it is, unless `allowDragWhileKeyboardVisible` is set.

**Content flickers or unmounts early.** Increase `unMountBufferTimeMS` on the
provider.

**Sheet is slow to open.** Move state into a `*Content` component and add
`showContentDelay={{ type: 'mount', timeInMilliSecs: 250 }}`.

**Screen feels sluggish even with sheets closed.** Hooks are sitting in a sheet
wrapper's function body. Move them into the content component.

---

## AI agent rules

The package ships a rules file written for AI coding agents (Claude Code, Cursor,
Codex, Copilot, etc.) at `rules/AGENT_RULES.md`. It tells an agent to keep sheet
state in a separate content component so nothing loads until the sheet is opened,
to reach for `BottomSheetFlatlist` / `BottomSheetScrollView` instead of raw
scrollables, and it lists every prop and ref method so it cannot invent APIs or
fall back to patterns from a different bottom sheet library. Point your agent at
it with any of the following.

**Copy it into your project (recommended)**

```sh
npx rnbs-rules            # writes ./AGENTS.md
npx rnbs-rules cursor     # writes ./.cursor/rules/react-native-bottom-sheet.mdc (alwaysApply)
npx rnbs-rules claude     # writes ./.claude/rules/react-native-bottom-sheet.md
npx rnbs-rules codex      # writes ./.codex/rules/react-native-bottom-sheet.md
npx rnbs-rules copilot    # writes ./.github/instructions/react-native-bottom-sheet.instructions.md
npx rnbs-rules windsurf   # writes ./.windsurf/rules/react-native-bottom-sheet.md
npx rnbs-rules docs/ai/bottom-sheet.md   # custom path
```

Add `--force` to overwrite an existing file. `--print` writes the rules to stdout
instead of to disk. Re-run after upgrading the package to pick up rule changes.

**Reference it without copying (Claude Code)**

`CLAUDE.md` supports `@path` imports, so a single line keeps the rules in sync with
the installed version:

```md
# CLAUDE.md

@node_modules/@shaquillehinds/react-native-bottom-sheet/rules/AGENT_RULES.md
```

**Reference it from a generic `AGENTS.md`**

```md
Before writing any bottom sheet, read and follow
node_modules/@shaquillehinds/react-native-bottom-sheet/rules/AGENT_RULES.md.
```

---

## License

MIT © [Shaquille Hinds](https://github.com/shaquillehinds)
