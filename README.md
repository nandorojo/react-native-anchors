# React Native Anchors 🦅

Anchor links and scroll-to utilities for React Native (+ Web)

## Installation

> Coming soon 😇

```sh
yarn add @nandorojo/anchor
```

If you're using react-native-web, you'll need at least version 0.15.3.

## Usage

This is the simplest usage:

```jsx
import { ScrollTo, Target, ScrollView } from '@nandorojo/anchor';

return (
  <ScrollView>
    <ScrollTo target="bottom-content">Scroll to bottom content</Anchor>
    <SomeContent />
    <Target name="bottom-content">Bottom content!</Target>
  </ScrollView>
);
```

The library exports a `ScrollView` and `FlatList` component you can use.

### Use custom scrollables

If you want to use your own scrollable, that's fine. You'll just have to do 2 things:

1. Wrap them in the `AnchorProvider`
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

## Trigger a scroll-to event

There are a few options for triggering a scroll-to event. The basic premise is the same as HTML anchor links. You need 1) a target to scroll to, and 2) something to trigger the scroll.

The simplest way to make a target is to use the `Target` component:

```jsx
import { ScrollView, Target } from '@nandorojo/anchor'

export default function App() {
  return (
    <ScrollView>
      <Target name="scrollhere">
        <YourComponent />
      </Target>
    </ScrollView>
  )
}
```

Each target needs a **unique** `name` prop. The name indicates where to scroll.

Next, we need a way to scroll to that target. The easiest way is to use the `ScrollTo` component:

```jsx
import { ScrollView, Target } from '@nandorojo/anchor'
import { Text, View } from 'react-native'

export default function App() {
  return (
    <ScrollView>
      <ScrollTo target="scrollhere">
        <Text>Click me to scroll down</Text>
      </ScrollTo>
      <View style={{ height: 500 }} />
      <Target name="scrollhere">
        <YourComponent />
      </Target>
    </ScrollView>
  )
}
```

### `useScrollTo(target, options?)`

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
      animated: true,  // default true
      offset: -10      // offset to scroll to, default -10 pts
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

## Web usage

This works with web (react-native-web 0.15.3 or higher).

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
  useRegisterScroller
} from '@nandorojo/anchor'
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
