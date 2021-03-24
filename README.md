# React Native Anchors 🦅

Anchor links and scroll-to utilities for React Native (+ Web)

## Installation

> Coming soon 😇

```sh
yarn add @nandorojo/anchor
```

## Usage

```jsx
import { Anchor, Target, ScrollView } from '@nandorojo/anchor';

// ...

return (
  <ScrollView>
    <Anchor target="bottom-content">Scroll to bottom content</Anchor>
    <SomeContent />
    <Target name="bottom-content">Bottom content!</Target>
  </ScrollView>
);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
