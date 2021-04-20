import * as React from 'react';
import { View, ScrollView as NativeScrollView, FlatList as NativeFlatList, findNodeHandle, Pressable, } from 'react-native';
const { createContext, forwardRef, useContext, useMemo, useRef, useImperativeHandle, } = React;
// from react-merge-refs (avoid dependency)
function mergeRefs(refs) {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            }
            else if (ref != null) {
                ref.current = value;
            }
        });
    };
}
function getScrollableNode(ref) {
    if (ref.current == null) {
        return null;
    }
    if ('scrollTo' in ref.current ||
        'scrollToOffset' in ref.current ||
        'scrollResponderScrollTo' in ref.current) {
        // This is already a scrollable node.
        return ref.current;
    }
    else if ('getScrollResponder' in ref.current) {
        // If the view is a wrapper like FlatList, SectionList etc.
        // We need to use `getScrollResponder` to get access to the scroll responder
        return ref.current.getScrollResponder();
    }
    else if ('getNode' in ref.current) {
        // When a `ScrollView` is wraped in `Animated.createAnimatedComponent`
        // we need to use `getNode` to get the ref to the actual scrollview.
        // Note that `getNode` is deprecated in newer versions of react-native
        // this is why we check if we already have a scrollable node above.
        return ref.current.getNode();
    }
    else {
        return ref.current;
    }
}
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
    const ref = useRef(null);
    return ref;
};
const AnchorsContext = createContext({
    targetRefs: {
        current: {},
    },
    scrollRef: {
        current: null,
    },
    registerTargetRef: () => {
        // no-op
    },
    registerScrollRef: () => {
        // no-op
    },
    horizontal: false,
    scrollTo: () => {
        return new Promise((resolve) => resolve({
            success: false,
            message: 'Missing @nandorojo/anchor provider.',
        }));
    },
});
const useAnchorsContext = () => useContext(AnchorsContext);
const useCreateAnchorsContext = ({ horizontal, }) => {
    const targetRefs = useRef({});
    const scrollRef = useRef();
    return useMemo(() => {
        return {
            targetRefs,
            scrollRef: scrollRef,
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
            scrollTo: (name, { animated = true, offset = -10 } = {}) => {
                return new Promise((resolve) => {
                    const node = scrollRef.current && findNodeHandle(scrollRef.current);
                    if (!node) {
                        return resolve({
                            success: false,
                            message: 'Scroll ref does not exist. Will not scroll to view.',
                        });
                    }
                    if (!targetRefs.current?.[name]) {
                        resolve({
                            success: false,
                            message: 'Anchor ref ' +
                                name +
                                ' does not exist. It will not scroll. Please make sure to use the ScrollView provided by @nandorojo/anchors, or use the registerScrollRef function for your own ScrollView.',
                        });
                    }
                    targetRefs.current?.[name].measureLayout(node, (left, top) => {
                        requestAnimationFrame(() => {
                            const scrollY = top;
                            const scrollX = left;
                            const scrollable = getScrollableNode(scrollRef);
                            let scrollTo = horizontal ? scrollX : scrollY;
                            scrollTo += offset;
                            scrollTo = Math.max(scrollTo, 0);
                            const key = horizontal ? 'x' : 'y';
                            if ('scrollTo' in scrollable) {
                                scrollable.scrollTo({
                                    [key]: scrollTo,
                                    animated,
                                });
                            }
                            else if ('scrollToOffset' in scrollable) {
                                scrollable.scrollToOffset({
                                    offset: scrollTo,
                                    animated,
                                });
                            }
                            else if ('scrollResponderScrollTo' in scrollable) {
                                scrollable.scrollResponderScrollTo({
                                    [key]: scrollTo,
                                    animated,
                                });
                            }
                            resolve({ success: true });
                        });
                    }, () => {
                        resolve({
                            success: false,
                            message: 'Failed to measure target node.',
                        });
                    });
                });
            },
        };
    }, [horizontal]);
};
function useRegisterTarget() {
    const { registerTargetRef } = useAnchorsContext();
    return useMemo(() => ({
        register: (name) => {
            return (ref) => registerTargetRef(name, ref);
        },
    }), [registerTargetRef]);
}
function useScrollTo() {
    const { scrollTo } = useAnchorsContext();
    return useMemo(() => ({
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
    }), [scrollTo]);
}
function useRegisterScroller() {
    const { registerScrollRef } = useAnchorsContext();
    return { registerScrollRef };
}
function AnchorProvider({ children, horizontal, anchors, }) {
    const value = useCreateAnchorsContext({ horizontal });
    useImperativeHandle(anchors, () => ({
        scrollTo: (...props) => {
            return value.scrollTo(...props);
        },
    }));
    return (React.createElement(AnchorsContext.Provider, { value: value }, children));
}
/**
 * Identical to the normal React Native `ScrollView`, except that it allows scrolling to anchor links.
 *
 * If you use this component, you don't need to use the `AnchorProvider`. It implements it for you.
 */
const ScrollView = forwardRef(function ScrollView({ horizontal = false, anchors, ...props }, ref) {
    return (React.createElement(AnchorProvider, { anchors: anchors, horizontal: horizontal },
        React.createElement(AnchorsContext.Consumer, null, ({ registerScrollRef }) => (React.createElement(NativeScrollView, Object.assign({ horizontal: horizontal }, props, { ref: mergeRefs([registerScrollRef, ref]) }))))));
});
/**
 * Identical to the normal React Native flatlist, except that it allows scrolling to anchor links.
 *
 * If you use this component, you don't need to use the `AnchorProvider`.
 *
 * One important difference: if you want to use the `ref`, pass it to `flatListRef` instead of `ref`.
 */
function FlatList({ flatListRef, horizontal = false, anchors, ...props }) {
    return (React.createElement(AnchorProvider, { anchors: anchors, horizontal: horizontal },
        React.createElement(AnchorsContext.Consumer, null, ({ registerScrollRef }) => (React.createElement(NativeFlatList, Object.assign({}, props, { ref: mergeRefs([registerScrollRef, flatListRef || null]) }))))));
}
function ScrollTo({ target, onPress, options, onRequestScrollTo, ...props }) {
    const { scrollTo } = useScrollTo();
    return (React.createElement(Pressable, Object.assign({}, props, { onPress: async (e) => {
            onPress?.(e);
            const result = await scrollTo(target, options);
            onRequestScrollTo?.(result);
        } })));
}
const Target = forwardRef(function Target({ name, ...props }, ref) {
    const { register } = useRegisterTarget();
    return React.createElement(View, Object.assign({}, props, { ref: mergeRefs([register(name), ref]) }));
});
export { AnchorProvider, ScrollView, FlatList, useRegisterTarget, useScrollTo, ScrollTo, Target, ScrollTo as Anchor, useRegisterScroller, useAnchors, };
// }
