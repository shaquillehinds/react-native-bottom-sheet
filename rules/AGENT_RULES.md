# Agent Rules — `@shaquillehinds/react-native-bottom-sheet`

Rules for AI coding agents writing or modifying code that uses this package.
Read this before writing any bottom sheet. Follow it over general knowledge of
other bottom sheet libraries — the API here is not `@gorhom/bottom-sheet` and
patterns from that library will not work.

---

## 0. Non-negotiables

1. **Always split the sheet into a wrapper component and a `*Content` component.**
   State, hooks, queries and derived data live in `*Content`, never in the wrapper.
   See Rule 1 — this is the single most important rule in this file.
2. `BottomSheetPortalProvider` must wrap the app root, above the navigation container.
3. Scrollable content inside a sheet uses `BottomSheetFlatlist` or
   `BottomSheetScrollView`. Never a bare `FlatList`, `ScrollView` or `FlashList`.
4. Do not add a `<Modal>`, `KeyboardAvoidingView`, `SafeAreaView` or
   `TouchableWithoutFeedback` backdrop around the sheet. All of that is handled.
5. Never guess prop names. If a prop is not in this file, it does not exist.

---

## 1. Render isolation: keep state in the content component

The sheet's children are only mounted while the sheet is open. Anything written
_inside the child component_ therefore costs nothing until the user opens it.
Anything written _in the wrapper's function body_ runs on every parent render,
open or closed.

So the wrapper is a thin shell that takes props and renders `<XContent />`.
All hooks — `useState`, `useEffect`, data fetching, store subscriptions,
context reads, expensive `useMemo`, list construction — go in `XContent`.

### Correct

```tsx
export default function ChooseFlashcardsModal(props: ChooseFlashcardsProps) {
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

// Nothing in here runs until the sheet is open.
function ChooseFlashcardsContent(props: ChooseFlashcardsProps) {
  const { relativeY, orientation } = useDeviceOrientation();
  const t = useTranslation();
  const { data } = useFlashcardSets(props.studySetId);
  return <>{/* ... */}</>;
}
```

### Wrong

```tsx
export default function ChooseFlashcardsModal(props: ChooseFlashcardsProps) {
  // ❌ These run on every render of the parent screen, even with the sheet closed.
  const { data } = useFlashcardSets(props.studySetId);
  const [selected, setSelected] = useState<FlashcardSet[]>([]);
  const rows = useMemo(() => buildRows(data), [data]);

  return (
    <SmoothBottomModal
      showModal={props.toggled}
      setShowModal={props.setToggled}
    >
      {/* ❌ Inline JSX with logic — same problem, plus it re-renders with the screen. */}
      {rows.map((r) => (
        <Row key={r.id} {...r} />
      ))}
    </SmoothBottomModal>
  );
}
```

### Why this works

`BottomSheetModal` passes its subtree through a `ComponentMounter` keyed on
`showModal`. While closed, the subtree is unmounted, so no hook inside a child
component has run yet. Creating the element `<XContent />` is nearly free; it is
_calling_ the component that is expensive, and that only happens on mount.

Hooks in the wrapper body are in the parent's render, outside the mounter, so
they always run. That is the whole distinction.

### Corollaries

- Do **not** hoist state out of `*Content` into the wrapper "so it survives close".
  If state must survive, lift it to the screen that owns the sheet and pass it
  down as props (as `ChooseFlashcards` does with `selectedFlashcards`).
- Do not read a store or context in the wrapper unless the _sheet's own props_
  need it. Theme colours for `backgroundColor` are the normal exception, since
  the sheet chrome needs them.
- The pattern applies to `BottomSheet` (inline) exactly as it does to `BottomSheetModal`.

### Pair it with `showContentDelay`

For anything non-trivial, add `showContentDelay={{ type: 'mount', timeInMilliSecs: 250 }}`.
Content then mounts _after_ the open animation, so a heavy first render never
competes with the animation.

`type: 'mount'` means the sheet has no content to measure when it opens, so it
needs to be told how tall to be. Either set `snapPoints` (preferred) or give
`contentContainerStyle` a `minHeight`. Without one of those, the sheet opens
collapsed.

Use `type: 'opacity'` (the default when `type` is omitted) only when content is
cheap and you just want a fade — it still renders immediately.

---

## 2. Choosing a component

| Need                                                                 | Use                     |
| -------------------------------------------------------------------- | ----------------------- |
| Standard sheet with backdrop                                         | `BottomSheetModal`      |
| Persistent / inline sheet, no backdrop, background stays interactive | `BottomSheet`           |
| Scrollable list inside a sheet                                       | `BottomSheetFlatlist`   |
| Scrollable view inside a sheet                                       | `BottomSheetScrollView` |

`BottomSheet` renders with `enableBackgroundContentPress`, so there is no backdrop
and taps pass through to whatever is behind it. Use it for filter panels, mini
players, persistent drawers. Use `BottomSheetModal` for everything else.

---

## 3. Controlling the sheet

There are two mutually exclusive control modes. Pick one; do not mix them.

### 3a. State-controlled (default — use this)

```tsx
const [showModal, setShowModal] = useState(false);

<BottomSheetModal
  showModal={showModal}
  setShowModal={setShowModal}
  snapPoints={[85]}
>
  <MyContent onDone={() => setShowModal(false)} />
</BottomSheetModal>;
```

Close from inside the sheet with `setShowModal(false)` passed down, or with
`useBottomSheetRef()`.

### 3b. Ref-controlled (no `showModal` / `setShowModal` at all)

For a sheet mounted once, high in the tree, opened from anywhere:

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

// elsewhere
uploadModalRef.current?.openModal();
```

Omit `showModal` and `setShowModal` entirely. The ref drives the mounter directly.
Use `disablePortal` when the sheet is already mounted at root level — there is
nothing for the portal to lift it above.

### Ref typing

```tsx
const ref = useRef<BottomModalRef>(null); // ✅
const ref = useRef<BottomModalRefObject>(null); // ❌ that alias is the ref *prop* type
```

`BottomModalRefObject` is `React.Ref<BottomModalRef>` — it types the `ref` prop on
the component, not the object `useRef` returns.

### Ref API

```tsx
ref.current?.openModal({ onOpen });
ref.current?.closeModal({
  skipAnimation,
  isNavigating,
  duration,
  easing,
  onClose,
});
ref.current?.closeWithoutAnimation();
ref.current?.snapToIndex(1);
ref.current?.snapToPercentage(75); // or '75%'
ref.current?.getModalState(); // ModalState.CLOSED | OPENING | OPEN | CLOSING
```

Behaviour worth knowing before you call these:

- On a state-controlled sheet, `openModal()` with no `onOpen` is just
  `setShowModal(true)`. Passing `onOpen` routes through the mounter instead.
- On a state-controlled sheet, `closeModal()` with no `duration` and no `onClose`
  is just `setShowModal(false)`.
- `closeModal({ isNavigating: true })` shortens the animation to 100ms. Use it
  before `navigation.navigate` / `router.push` on Android.
- `closeModal({ skipAnimation: true })` unmounts immediately.

### Closing from inside the subtree

```tsx
import { useBottomSheetRef } from '@shaquillehinds/react-native-bottom-sheet';

function Footer() {
  const { modalRef } = useBottomSheetRef();
  return (
    <Button title="Close" onPress={() => modalRef?.current?.closeModal()} />
  );
}
```

Only works inside the sheet's own subtree. `modalRef` is optional — always
optional-chain it.

---

## 4. Snap points

- `snapPoints` are percentages of screen height: `[25, 50, 75]`, `['50%']`, `[85]`.
- **Omitting `snapPoints` is a real mode, not an oversight.** The sheet measures
  its content and opens to that height, capped at ~110% screen height. Use it for
  short, content-sized sheets.
- With `snapPoints`, the sheet opens at index `0`, so order low → high the way you
  want it to appear. `snapToIndex` is indexed into the array as written.
- `onSnapPointReach(index)` only fires when `snapPoints` is set.
- Keep the array referentially stable — module constant or `useMemo`.
- On orientation change the sheet recomputes snap points and re-snaps to index 0.

---

## 5. `keepMounted` and `bottomOffset`

`keepMounted` changes what a downward drag does: instead of dismissing, the sheet
snaps to its lowest snap point.

**`keepMounted` requires `snapPoints`.** Without them it is ignored entirely.

Pair with `bottomOffset` to leave a peek visible:

```tsx
<BottomSheet keepMounted snapPoints={[10, 70]} bottomOffset={100} ... />
```

`keepMounted` does not stop `showModal={false}` from unmounting the sheet. It only
governs the drag gesture.

---

## 6. Scrolling

```tsx
<BottomSheetModal snapPoints={[50, 90]} showModal={show} setShowModal={setShow}>
  <BottomSheetFlatlist data={items} renderItem={renderItem} keyExtractor={k} />
</BottomSheetModal>
```

- These components hand off gesture state to the sheet so the sheet drags when
  the list is at its scroll boundary and scrolls otherwise. A bare `FlatList`
  breaks that and the sheet will fight the list.
- They accept the full underlying props (`FlatListPropsWithLayout` /
  `AnimatedScrollViewProps`), minus a reworked `onScroll` that also accepts a
  Reanimated scroll event.
- Custom ref: use `refFlatlist` / `refScrollView`, not `ref`.
- `inverted` lists are supported and reported to the sheet.
- Outside a sheet these degrade gracefully to plain animated list/scrollview.
- Do not set `bounces` — it is forced to `false` inside a sheet.
- Avoid `dragArea="full"` with a scrollable child; the two gestures compete.
  Leave `dragArea` at its default `"bumper"`.

---

## 7. Keyboard

- `avoidKeyboard` — pads content whenever the keyboard opens.
- `inputsForKeyboardToAvoid={[ref1, ref2]}` — only avoid for those specific inputs.
  Prefer this when a sheet has inputs that should not shift the layout.
- Dragging is disabled while the keyboard is visible. Override with
  `allowDragWhileKeyboardVisible` only if you have tested it.
- If opening the sheet from a focused input, dismiss the keyboard in the setter:

```tsx
setShowModal={(value: boolean) => {
  Keyboard.dismiss();
  props.setShowModal(value);
}}
```

Do not wrap sheet content in `KeyboardAvoidingView`.

---

## 8. Portal

- `BottomSheetPortalProvider` goes above `NavigationContainer`, not inside it.
- Sheets use the portal automatically. Do not add `useBottomSheetPortalComponent`
  around a sheet — it already does this internally.
- `disablePortal` — render in place. Correct when the sheet is already at root
  level, or when you deliberately want it scoped to a subtree.
- `CustomPortalContext` — scoped portals. Both the provider and the sheet must be
  given the same context object.
- `useBottomSheetPortal` / `useBottomSheetPortalComponent` are for non-sheet
  overlays (toasts, loaders). Do not reach for them to solve z-index problems with
  a sheet; fix the provider placement instead.

---

## 9. Prop reference

Common to `BottomSheet` and `BottomSheetModal`:

`showModal` · `setShowModal` · `snapPoints` · `dragArea` (`'full' | 'bumper' | 'none'`,
default `'bumper'`) · `keepMounted` · `hideBumper` · `avoidKeyboard` ·
`allowDragWhileKeyboardVisible` · `inputsForKeyboardToAvoid` · `bottomOffset` ·
`showContentDelay` · `style` · `contentContainerStyle` · `bumperStyle` ·
`bumperContainerStyle` · `backgroundColor` · `BumperComponent` · `onModalShow` ·
`onModalClose` · `onSnapPointReach` · `disablePortal` · `CustomPortalContext`

`BottomSheetModal` adds:

`BackdropComponent` · `onBackDropPress` · `disableCloseOnBackdropPress` ·
`useNativeModal` · `enableBackgroundContentPress` · `disableAndroidBackButton`

Style targets, since they are easy to confuse:

- `style` → the sheet surface itself
- `contentContainerStyle` → the container around your children
- `backgroundColor` → sheet **and** bumper container; prefer this over setting
  `backgroundColor` in `style`, which leaves the bumper mismatched
- `bumperStyle` → the grab handle; `bumperContainerStyle` → the area around it

---

## 10. Review checklist

Before finishing any change involving this package:

- [ ] Wrapper holds no state; all hooks are in a `*Content` component
- [ ] `showContentDelay` set for non-trivial content, with `snapPoints` or `minHeight`
- [ ] `snapPoints` is stable (module constant or `useMemo`), ordered low → high
- [ ] Scrollables are `BottomSheetFlatlist` / `BottomSheetScrollView`
- [ ] `keepMounted` only used together with `snapPoints`
- [ ] Ref typed `useRef<BottomModalRef>(null)`
- [ ] Only one control mode — state or ref, not both
- [ ] No `Modal`, `KeyboardAvoidingView` or hand-rolled backdrop wrapping the sheet
- [ ] `closeModal({ isNavigating: true })` before navigating away
- [ ] Portal provider above the navigation container
