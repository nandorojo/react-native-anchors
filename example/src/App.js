import * as React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { Target, ScrollView, Anchor } from '@nandorojo/anchor';
export default function App() {
    const { height } = useWindowDimensions();
    return (React.createElement(View, { style: [styles.container, { height }] },
        React.createElement(ScrollView, { style: styles.container },
            React.createElement(Target, { name: "top" }),
            React.createElement(View, { style: styles.box }),
            React.createElement(Anchor, { target: "1" },
                React.createElement(Text, null, "Scroll to 1")),
            React.createElement(Anchor, { target: "2" },
                React.createElement(Text, null, "Scroll to 2")),
            React.createElement(View, { style: styles.box }),
            React.createElement(Target, { name: "1" },
                React.createElement(Text, null, "Here is 1")),
            React.createElement(View, { style: styles.box }),
            React.createElement(Target, { name: "2" },
                React.createElement(Text, null, "Here is 2")),
            React.createElement(View, { style: styles.box }),
            React.createElement(View, { style: styles.box }),
            React.createElement(View, { style: styles.box }),
            React.createElement(View, { style: styles.box }),
            React.createElement(View, { style: styles.box }),
            React.createElement(View, { style: styles.box }),
            React.createElement(Anchor, { target: "top" },
                React.createElement(Text, null, "Scroll to top")))));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    box: {
        width: 150,
        height: 300,
        backgroundColor: 'blue',
    },
});
