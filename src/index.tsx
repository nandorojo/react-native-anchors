import * as React from 'react';
import {
  View,
  Text,
  ScrollView as NativeScrollView,
  FlatList as NativeFlatList,
  FlatListProps,
  findNodeHandle,
  Pressable,
} from 'react-native';
import type {
  ComponentProps,
  MutableRefObject,
  LegacyRef,
  ReactNode,
  RefObject,
  RefCallback,
} from 'react';

const {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  useImperativeHandle,
} = React;

// from react-merge-refs (avoid dependency)
function mergeRefs<T = any>(
  refs: Array<MutableRefObject<T> | LegacyRef<T>>
): RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}

// type Props<Anchors extends readonly string[]> = {
//   anchors: Anchors;
// };

type Unpromisify<T> = T extends Promise<infer R> ? R : T;

/**
 * The following is taken/edited from `useScrollToTop` from `@react-navigation/native`
 */
type ScrollOptions = { y?: number; animated?: boolean };

type ScrollableView =
  | { scrollToTop(): void }
  | { scrollTo(options: ScrollOptions): void }
  | { scrollToOffset(options: { offset?: number; animated?: boolean }): void }
  | { scrollResponderScrollTo(options: ScrollOptions): void };

type ScrollableWrapper =
  | { getScrollResponder(): ReactNode }
  | { getNode(): ScrollableView }
  | ScrollableView;

function getScrollableNode(ref: RefObject<ScrollableWrapper>) {
  if (ref.current == null) {
    return null;
  }

  if (
    'scrollTo' in ref.current ||
    'scrollToOffset' in ref.current ||
    'scrollResponderScrollTo' in ref.current
  ) {
    // This is already a scrollable node.
    return ref.current;
  } else if ('getScrollResponder' in ref.current) {
    // If the view is a wrapper like FlatList, SectionList etc.
    // We need to use `getScrollResponder` to get access to the scroll responder
    return ref.current.getScrollResponder();
  } else if ('getNode' in ref.current) {
    // When a `ScrollView` is wraped in `Animated.createAnimatedComponent`
    // we need to use `getNode` to get the ref to the actual scrollview.
    // Note that `getNode` is deprecated in newer versions of react-native
    // this is why we check if we already have a scrollable node above.
    return ref.current.getNode();
  } else {
    return ref.current;
  }
}
/**
 * End of react-navigation code.
 */

type ScrollToOptions = {
  animated?: boolean;
  /**
   * A number that determines how far from the content you want to scroll.
   *
   * Default: `-10`, which means it scrolls to 10 pixels before the content.
   */
  offset?: number;
  /**
   * If you're using a `ScrollView` or `FlatList` imported from this library, you can ignore this field.
   */
  // horizontal?: boolean;
};

export interface Anchors {}

export type AnchorsRef = {
  scrollTo: (
    name: Anchor,
    options?: ScrollToOptions
  ) => Promise<{ success: true } | { success: false; message: string }>;
};

/**
 * If you need to control a `ScrollView` or `FlatList` from outside of their scope:
 *
 * ```jsx
 * import React from 'react'
 * import { useAnchors, ScrollView } from '@nandorojo/anchor'
 *
 * export default function App() {
 *  const anchors = useAnchors()
 *
 *  const onPress = () => {
 *    anchors.current?.scrollTo('list')
 *  }
 *
 *  return (
 *    <ScrollView anchors={anchors}>
 *      <Target name="list" />
 *    </ScrollView>
 *  )
 * }
 * ```
 */
const useAnchors = () => {
  const ref = useRef<AnchorsRef>(null);

  return ref;
};

// @ts-expect-error
type Anchor = Anchors['anchor'] extends string ? Anchors['anchor'] : string;

// export default function createAnchors() {
type AnchorsContext = {
  targetRefs: RefObject<Record<Anchor, View | Text>>;
  scrollRef: RefObject<ScrollableWrapper>;
  registerTargetRef: (name: Anchor, ref: View | Text) => void;
  registerScrollRef: (ref: ScrollableWrapper | null) => void;
  horizontal: ComponentProps<typeof NativeScrollView>['horizontal'];
  scrollTo: AnchorsRef['scrollTo'];
};

const AnchorsContext = createContext<AnchorsContext>({
  targetRefs: {
    current: {} as any,
  },
  scrollRef: {
    current: null as any,
  },
  registerTargetRef: () => {
    // no-op
  },
  registerScrollRef: () => {
    // no-op
  },
  horizontal: false,
  scrollTo: () => {
    return new Promise((resolve) =>
      resolve({
        success: false,
        message: 'Missing @nandorojo/anchor provider.',
      })
    );
  },
});

const useAnchorsContext = () => useContext(AnchorsContext);

const useCreateAnchorsContext = ({
  horizontal,
}: Pick<AnchorsContext, 'horizontal'>): AnchorsContext => {
  const targetRefs = useRef<Record<string, View>>({});
  const scrollRef = useRef<ScrollableWrapper>();

  return useMemo(() => {
    return {
      targetRefs,
      scrollRef: scrollRef as RefObject<ScrollableWrapper>,
      registerTargetRef: (target, ref) => {
        targetRefs.current = {
          ...targetRefs.current,
          [target]: ref,
        };
      },
      registerScrollRef: (ref) => {
        if (ref) {
          scrollRef.current = ref;
        }
      },
      horizontal,
      scrollTo: (
        name: Anchor,
        { animated = true, offset = -10 }: ScrollToOptions = {}
      ) => {
        return new Promise<
          { success: true } | { success: false; message: string }
        >((resolve) => {
          const node =
            scrollRef.current && findNodeHandle(scrollRef.current as any);
          if (!node) {
            return resolve({
              success: false,
              message: 'Scroll ref does not exist. Will not scroll to view.',
            });
          }
          if (!targetRefs.current?.[name]) {
            resolve({
              success: false,
              message:
                'Anchor ref ' +
                name +
                ' does not exist. It will not scroll. Please make sure to use the ScrollView provided by @nandorojo/anchors, or use the registerScrollRef function for your own ScrollView.',
            });
          }
          targetRefs.current?.[name].measureLayout(
            node,
            (left, top) => {
              requestAnimationFrame(() => {
                const scrollY = top;
                const scrollX = left;
                const scrollable = getScrollableNode(
                  scrollRef as RefObject<ScrollableWrapper>
                ) as ScrollableWrapper;

                let scrollTo = horizontal ? scrollX : scrollY;
                scrollTo += offset;
                scrollTo = Math.max(scrollTo, 0);
                const key = horizontal ? 'x' : 'y';

                if ('scrollTo' in scrollable) {
                  scrollable.scrollTo({
                    [key]: scrollTo,
                    animated,
                  });
                } else if ('scrollToOffset' in scrollable) {
                  scrollable.scrollToOffset({
                    offset: scrollTo,
                    animated,
                  });
                } else if ('scrollResponderScrollTo' in scrollable) {
                  scrollable.scrollResponderScrollTo({
                    [key]: scrollTo,
                    animated,
                  });
                }
                resolve({ success: true });
              });
            },
            () => {
              resolve({
                success: false,
                message: 'Failed to measure target node.',
              });
            }
          );
        });
      },
    };
  }, [horizontal]);
};

function useRegisterTarget() {
  const { registerTargetRef } = useAnchorsContext();

  return useMemo(
    () => ({
      register: (name: Anchor) => {
        return (ref: View) => registerTargetRef(name, ref);
      },
    }),
    [registerTargetRef]
  );
}

function useScrollTo() {
  const { scrollTo } = useAnchorsContext();

  return useMemo(
    () => ({
      scrollTo,
      // scrollTo: (
      //   name: Anchor,
      //   { animated = true, offset = -10 }: ScrollToOptions = {}
      // ) => {
      //   return new Promise<
      //     { success: true } | { success: false; message: string }
      //   >((resolve) => {
      //     const node =
      //       scrollRef.current && findNodeHandle(scrollRef.current as any);
      //     if (!node) {
      //       return resolve({
      //         success: false,
      //         message: 'Scroll ref does not exist. Will not scroll to view.',
      //       });
      //     }
      //     if (!targetRefs.current?.[name]) {
      //       resolve({
      //         success: false,
      //         message:
      //           'Anchor ref ' +
      //           name +
      //           ' does not exist. It will not scroll. Please make sure to use the ScrollView provided by @nandorojo/anchors, or use the registerScrollRef function for your own ScrollView.',
      //       });
      //     }
      //     targetRefs.current?.[name].measureLayout(
      //       node,
      //       (left, top) => {
      //         requestAnimationFrame(() => {
      //           const scrollY = top;
      //           const scrollX = left;
      //           const scrollable = getScrollableNode(
      //             scrollRef
      //           ) as ScrollableWrapper;

      //           let scrollTo = horizontal ? scrollX : scrollY;
      //           scrollTo += offset;
      //           scrollTo = Math.max(scrollTo, 0);
      //           const key = horizontal ? 'x' : 'y';

      //           if ('scrollTo' in scrollable) {
      //             scrollable.scrollTo({
      //               [key]: scrollTo,
      //               animated,
      //             });
      //           } else if ('scrollToOffset' in scrollable) {
      //             scrollable.scrollToOffset({
      //               offset: scrollTo,
      //               animated,
      //             });
      //           } else if ('scrollResponderScrollTo' in scrollable) {
      //             scrollable.scrollResponderScrollTo({
      //               [key]: scrollTo,
      //               animated,
      //             });
      //           }
      //           resolve({ success: true });
      //         });
      //       },
      //       () => {
      //         resolve({
      //           success: false,
      //           message: 'Failed to measure target node.',
      //         });
      //       }
      //     );
      //   });
      // },
    }),
    [scrollTo]
  );
}

function useRegisterScroller() {
  const { registerScrollRef } = useAnchorsContext();

  return { registerScrollRef };
}

function AnchorProvider({
  children,
  horizontal,
  anchors,
}: { children: ReactNode; anchors?: RefObject<AnchorsRef> } & Pick<
  AnchorsContext,
  'horizontal'
>) {
  const value = useCreateAnchorsContext({ horizontal });

  useImperativeHandle(anchors, () => ({
    scrollTo: (...props) => {
      return value.scrollTo(...props);
    },
  }));

  return (
    <AnchorsContext.Provider value={value}>{children}</AnchorsContext.Provider>
  );
}

/**
 * Identical to the normal React Native `ScrollView`, except that it allows scrolling to anchor links.
 *
 * If you use this component, you don't need to use the `AnchorProvider`. It implements it for you.
 */
const ScrollView = forwardRef<
  NativeScrollView,
  ComponentProps<typeof NativeScrollView> & {
    children?: ReactNode;
  } & Pick<ComponentProps<typeof AnchorProvider>, 'anchors'>
>(function ScrollView({ horizontal = false, anchors, ...props }, ref) {
  return (
    <AnchorProvider anchors={anchors} horizontal={horizontal}>
      <AnchorsContext.Consumer>
        {({ registerScrollRef }) => (
          <NativeScrollView
            horizontal={horizontal}
            {...props}
            ref={mergeRefs([registerScrollRef, ref])}
          />
        )}
      </AnchorsContext.Consumer>
    </AnchorProvider>
  );
});

/**
 * Identical to the normal React Native flatlist, except that it allows scrolling to anchor links.
 *
 * If you use this component, you don't need to use the `AnchorProvider`.
 *
 * One important difference: if you want to use the `ref`, pass it to `flatListRef` instead of `ref`.
 */
function FlatList<T = any>({
  flatListRef,
  horizontal = false,
  anchors,
  ...props
}: FlatListProps<T> & { flatListRef?: RefObject<NativeFlatList> } & Pick<
    ComponentProps<typeof AnchorProvider>,
    'anchors'
  >) {
  return (
    <AnchorProvider anchors={anchors} horizontal={horizontal}>
      <AnchorsContext.Consumer>
        {({ registerScrollRef }) => (
          <NativeFlatList
            {...props}
            ref={mergeRefs([registerScrollRef, flatListRef || null])}
          />
        )}
      </AnchorsContext.Consumer>
    </AnchorProvider>
  );
}

function ScrollTo({
  target,
  onPress,
  options,
  onRequestScrollTo,
  ...props
}: {
  children?: ReactNode;
  target: Anchor;
  options?: ScrollToOptions;
  onRequestScrollTo?: (
    props: Unpromisify<ReturnType<ReturnType<typeof useScrollTo>['scrollTo']>>
  ) => void;
} & ComponentProps<typeof Pressable>) {
  const { scrollTo } = useScrollTo();

  return (
    <Pressable
      {...props}
      onPress={async (e) => {
        onPress?.(e);
        const result = await scrollTo(target, options);
        onRequestScrollTo?.(result);
      }}
    />
  );
}

const Target = forwardRef<
  View,
  { name: Anchor; children?: ReactNode } & ComponentProps<typeof View>
>(function Target({ name, ...props }, ref) {
  const { register } = useRegisterTarget();

  return <View {...props} ref={mergeRefs([register(name), ref])} />;
});

export {
  AnchorProvider,
  ScrollView,
  FlatList,
  useRegisterTarget,
  useScrollTo,
  ScrollTo,
  Target,
  ScrollTo as Anchor,
  useRegisterScroller,
  useAnchors,
};
// }
