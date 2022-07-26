# React Native Anchor 🦅

Anchor links and scroll-to utilities for React Native (+ Web). It has zero dependencies.

## Installation

```sh
yarn add @nandorojo/anchor
```

If you're using react-native-web, you'll need at least version 0.15.3.

This works great to scroll to errors in Formik forms. See the [`ScrollToField` component](#formik-error-usage).

## Usage

This is the simplest usage:

```jsx
import React from 'react'
import { ScrollTo, Target, ScrollView } from '@nandorojo/anchor'
import { View, Text } from 'react-native'

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <ScrollTo target="bottom-content">
          <Text>Scroll to bottom content</Text>
        </ScrollTo>
        <View style={{ height: 1000 }} />
        <Target name="bottom-content">
          <View style={{ height: 100, backgroundColor: 'blue' }} />
        </Target>
      </ScrollView>
    </View>
  )
}
```

- [Expo Snack example](https://snack.expo.io/@nandorojo/anxious-chip) (iOS and Android only, since Expo Snack uses an outdated react-native-web version)
- [CodeSandbox example](https://codesandbox.io/s/empty-sky-8nhnb?file=/src/App.js) (web)

The library exports a `ScrollView` and `FlatList` component you can use as drop-in replacements for the react-native ones.

Note that the scroll to will only work if you use this library's scrollable components, or if you use a custom scrollable with the `AnchorProvider`, as shown in the example below.

### Use custom scrollables

If you want to use your own scrollable, that's fine. You'll just have to do 2 things:

1. Wrap them with the `AnchorProvider`
2. Register the scrollable with `useRegisterScroller`

That's all the exported `ScrollView` does for you.

```tsx
import { AnchorProvider, useRegisterScrollable } from '@nandorojo/anchor'
import { ScrollView } from 'react-native'

export default function Provider() {
  return (
    <AnchorProvider>
      <MyComponent />
    </AnchorProvider>
  )
}

// make sure this is the child of AnchorProvider
function MyComponent() {
  const { register } = useRegisterScroller()

  return (
    <ScrollView ref={register}>
      <YourContentHere />
    </ScrollView>
  )
}
```

If you need `horizontal` scrolling, make sure you pass the `horizontal` prop to both the `AnchorProvider`, and the `ScrollView`.

```tsx
import { AnchorProvider, useRegisterScrollable } from '@nandorojo/anchor'
import { ScrollView } from 'react-native'

export default function Provider() {
  return (
    <AnchorProvider horizontal>
      <MyComponent />
    </AnchorProvider>
  )
}

// make sure this is the child of AnchorProvider
function MyComponent() {
  const { register } = useRegisterScroller()

  return (
    <ScrollView horizontal ref={register}>
      <YourContentHere />
    </ScrollView>
  )
}
```

## Trigger a scroll-to event

There are a few options for triggering a scroll-to event. The basic premise is the same as HTML anchor links. You need 1) a target to scroll to, and 2) something to trigger the scroll.

The simplest way to make a target is to use the `Target` component.

Each target needs a **unique** `name` prop. The name indicates where to scroll.

```jsx
import { ScrollView, Target } from '@nandorojo/anchor'

export default function App() {
  return (
    <ScrollView>
      <Target name="bottom">
        <YourComponent />
      </Target>
    </ScrollView>
  )
}
```

Next, we need a way to scroll to that target. The easiest way is to use the `ScrollTo` component:

```jsx
import { ScrollView, Target } from '@nandorojo/anchor'
import { Text, View } from 'react-native'

export default function App() {
  return (
    <ScrollView>
      <ScrollTo target="bottom">
        <Text>Click me to scroll down</Text>
      </ScrollTo>
      <View style={{ height: 500 }} />
      <Target name="bottom">
        <YourComponent />
      </Target>
    </ScrollView>
  )
}
```

### Create a custom `scrollTo` component

If you don't want to use the `ScrollTo` component, you can also rely on the `useScrollTo` with a custom pressable.

```jsx
import { ScrollView, Target } from '@nandorojo/anchor'
import { Text, View } from 'react-native'

function CustomScrollTo() {
  const { scrollTo } = useScrollTo()

  const onPress = () => {
    scrollTo('scrollhere') // required: target name

    // you can also pass these optional parameters:
    scrollTo('scrollhere', {
      animated: true, // default true
      offset: -10 // offset to scroll to, default -10 pts
    })
  }

  return <Text onPress={onPress}>Scroll down</Text>
}

export default function App() {
  return (
    <ScrollView>
      <CustomScrollTo />
      <View style={{ height: 500 }} />
      <Target name="scrollhere">
        <YourComponent />
      </Target>
    </ScrollView>
  )
}
```

### `useRegisterTarget()`

The basic usage for determing the target to scroll to is using the `Target` component.

However, if you want to use a custom component as your target, you'll use the `useRegisterTarget` hook.

```jsx
import { ScrollTo, useRegisterTarget, ScrollView } from '@nandorojo/anchor';
import { View } from 'react-native'

function BottomContent() {
  const { register } = useRegisterTarget()

  const ref = register('bottom-content') // use a unique name here

  return <View ref={ref} />
}

function App() {
return (
  <ScrollView>
    <ScrollTo target="bottom-content">Scroll to bottom content</Anchor>
    <View style={{ height: 500 }} />
    <BottomContent />
  </ScrollView>
);
}
```

## Web usage

### Smooth Scrolling

This works with web (react-native-web 0.15.3 or higher).

To support iOS browsers, you should polyfill the smooth scroll API.

```sh
yarn add smoothscroll-polyfill
```

Then at the root of your app (`App.js`, or `pages/_app.js` for Next.js) call this:

```jsx
import { Platform } from 'react-native'

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  require('smoothscroll-polyfill').polyfill()
}
```

### Patch

`react-native-web`'s resolution for scroll position is currently wrong.

Until this issue is closed (https://github.com/necolas/react-native-web/issues/2109), I'll be using this patch with `patch-package`:

<details>
<summary>
Click me to view patch
</summary>

```diff
diff --git a/node_modules/@nandorojo/anchor/lib/module/index.js b/node_modules/@nandorojo/anchor/lib/module/index.js
index 6decdc0..d27b884 100644
--- a/node_modules/@nandorojo/anchor/lib/module/index.js
+++ b/node_modules/@nandorojo/anchor/lib/module/index.js
@@ -1,7 +1,7 @@
 function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
 
 import * as React from 'react';
-import { View, ScrollView as NativeScrollView, FlatList as NativeFlatList, findNodeHandle, Pressable } from 'react-native';
+import { View, ScrollView as NativeScrollView, FlatList as NativeFlatList, findNodeHandle, Pressable, Platform } from 'react-native';
 const {
   createContext,
   forwardRef,
@@ -130,7 +130,10 @@ const useCreateAnchorsContext = ({
         return new Promise(resolve => {
           var _targetRefs$current, _targetRefs$current2;
 
-          const node = scrollRef.current && findNodeHandle(scrollRef.current);
+          const node = Platform.select({
+            default: scrollRef.current,
+            web: scrollRef.current && scrollRef.current.getInnerViewNode  && scrollRef.current.getInnerViewNode()
+          })
 
           if (!node) {
             return resolve({
diff --git a/node_modules/@nandorojo/anchor/src/index.js b/node_modules/@nandorojo/anchor/src/index.js
index 7259856..80fc63c 100644
--- a/node_modules/@nandorojo/anchor/src/index.js
+++ b/node_modules/@nandorojo/anchor/src/index.js
@@ -1,5 +1,5 @@
 import * as React from 'react';
-import { View, ScrollView as NativeScrollView, FlatList as NativeFlatList, findNodeHandle, Pressable, } from 'react-native';
+import { View, ScrollView as NativeScrollView, FlatList as NativeFlatList, findNodeHandle, Pressable, Platform } from 'react-native';
 const { createContext, forwardRef, useContext, useMemo, useRef, useImperativeHandle, } = React;
 // from react-merge-refs (avoid dependency)
 function mergeRefs(refs) {
@@ -109,7 +109,11 @@ const useCreateAnchorsContext = ({ horizontal, }) => {
             horizontal,
             scrollTo: (name, { animated = true, offset = -10 } = {}) => {
                 return new Promise((resolve) => {
-                    const node = scrollRef.current && findNodeHandle(scrollRef.current);
+                    const node = Platform.select({
+                      default: scrollRef.current,
+                      web: scrollRef.current && scrollRef.current.getInnerViewRef()
+                    })
+                    // const node = scrollRef.current && findNodeHandle(scrollRef.current);
                     if (!node) {
                         return resolve({
                             success: false,

```
</details>

### Gotchas

One thing to keep in mind: the parent view of a `ScrollView` on web **must** have a fixed height. Otherwise, the `ScrollView` will just use window scrolling. This is a common source of confusion on web, and it took me a while to learn.

Typically, it's solved by doing this:

```jsx
import { View, ScrollView } from 'react-native'

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView />
    </View>
  )
}
```

By wrapping `ScrollView` with a `flex: 1` View, we are confining its parent's size. If this doesn't solve it, try giving your parent `View` a fixed `height`:

```jsx
import { View, ScrollView, Platform } from 'react-native'

export default function App() {
  return (
    <View style={{ flex: 1, height: Platform.select({ web: '100vh', default: undefined }) }}>
      <ScrollView />
    </View>
  )
}
```

## Imports

```js
import {
  AnchorProvider,
  ScrollView,
  FlatList,
  useRegisterTarget,
  useScrollTo,
  ScrollTo,
  Target,
  useRegisterScroller,
  useAnchors
} from '@nandorojo/anchor'
```

### `ScrollTo`

```jsx
const Trigger = () => (
  <ScrollTo
    target="bottom"
    options={{
      animated: true,
      offset: -10
    }}
  />
)
```

#### Props

- `target` **required** unique string indicating the `name` of the `Target` to scroll to
- `options` optional dictionary
  - `animated = true` whether the scroll should animate or not
  - `offset = -10` a number in pixels to offset the scroll by. By default, it scrolls 10 pixels above the content.

### `Target`

```js
const ContentToScrollTo = () => <Target name="bottom-content" />
```

#### Props

- `name` required, unique string that identifies this View to scroll to
  - it only needs to be unique _within_ a given ScrollView. You can reuse names for different scrollables, but I'd avoid doing that.

### `useScrollTo`

A react hook that returns a `scrollTo(name, options?)` function. This serves as an alternative to the [`ScrollTo`](#ScrollTo) component.

The first argument is required. It's a string that corresponds to your target's unique `name` prop.

The second argument is an optional `options` object, which is identical to the [`ScrollTo`](#ScrollTo) component's `options` prop.

```jsx
import { ScrollView, Target } from '@nandorojo/anchor'
import { Text, View } from 'react-native'

function CustomScrollTo() {
  const { scrollTo } = useScrollTo()

  const onPress = () => {
    scrollTo('scrollhere') // required: target name

    // you can also pass these optional parameters:
    scrollTo('scrollhere', {
      animated: true, // default true
      offset: -10 // offset to scroll to, default -10 pts
    })
  }

  return <Text onPress={onPress}>Scroll down</Text>
}

export default function App() {
  return (
    <ScrollView>
      <CustomScrollTo />
      <View style={{ height: 500 }} />
      <Target name="scrollhere">
        <YourComponent />
      </Target>
    </ScrollView>
  )
}
```

### `useRegisterScroller`

A hook that returns a `register` function. This is an alternative option to using the `ScrollView` or `FlatList` components provided by this library.

Note that, to use this, you must first wrap the scrollable with `AnchorProvider`. It's probably easier to just use the exported `ScrollView`, but it's your call.

```tsx
import { AnchorProvider, useRegisterScrollable } from '@nandorojo/anchor'
import { ScrollView } from 'react-native'

// make sure this is the child of AnchorProvider
function MyComponent() {
  const { register } = useRegisterScroller()

  return (
    <ScrollView ref={register}>
      <YourContentHere />
    </ScrollView>
  )
}

export default function Provider() {
  return (
    <AnchorProvider>
      <MyComponent />
    </AnchorProvider>
  )
}
```
  
### `useAnchors`
  
If you need to control a `ScrollView` or `FlatList` from outside of their scope:

```jsx
import React from 'react'
import { useAnchors, ScrollView } from '@nandorojo/anchor'

export default function App() {
 const anchors = useAnchors()

 const onPress = () => {
   anchors.current?.scrollTo('list')
 }

 return (
   <ScrollView anchors={anchors}>
     <Target name="list" />
   </ScrollView>
 )
}
```

## Formik Error Usage

1. Create a `ScrollToField` component:

```tsx
import React, { useEffect, useRef } from 'react'
import { Target, useScrollTo } from '@nandorojo/anchor'
import { useFormikContext } from 'formik'

function isObject(value?: object) {
  return value && typeof value === 'object' && value.constructor === Object
}

function getRecursiveName(object?: object): string {
  if (!object || !isObject(object)) {
    return ''
  }
  const currentKey = Object.keys(object)[0]
  if (!currentKey) {
    return ''
  }
  if (!getRecursiveName(object[currentKey])) {
    return currentKey
  }
  return currentKey + '.' + getRecursiveName(object[currentKey])
}

export function ScrollToField({ name }: { name: string }) {
  const { submitCount, errors } = useFormikContext()

  const { scrollTo } = useScrollTo()
  const previousSubmitCount = useRef(submitCount)
  const errorPath = getRecursiveName(errors)

  useEffect(
    function scrollOnSubmissionError() {
      if (!errorPath) return

      if (submitCount > previousSubmitCount.current && name) {
        if (name === errorPath) {
          scrollTo(name).then((didScroll) => console.log('[scroll-to-field] did scroll', name, didScroll))
        }
      }
      previousSubmitCount.current = submitCount
    },
    [errorPath, errors, name, scrollTo, submitCount]
  )

  return <Target name={name} />
}
```

2. Add it alongside your field:

```tsx
const InputField = ({ name }) => {
  const [{ value }] = useField(name)

  return (
    <View>
      <ScrollToField name={name} />
      <TextInput value={value} />
    </View>
  )
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
