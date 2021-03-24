import * as React from 'react';

import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { Target, ScrollView, Anchor } from '@nandorojo/anchor';

export default function App() {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView style={styles.container}>
        <Target name="top" />
        <View style={styles.box} />
        <Anchor target="1">
          <Text>Scroll to 1</Text>
        </Anchor>
        <Anchor target="2">
          <Text>Scroll to 2</Text>
        </Anchor>
        <View style={styles.box} />
        <Target name="1">
          <Text>Here is 1</Text>
        </Target>
        <View style={styles.box} />
        <Target name="2">
          <Text>Here is 2</Text>
        </Target>
        <View style={styles.box} />
        <View style={styles.box} />
        <View style={styles.box} />
        <View style={styles.box} />
        <View style={styles.box} />
        <View style={styles.box} />
        <Anchor target="top">
          <Text>Scroll to top</Text>
        </Anchor>
      </ScrollView>
    </View>
  );
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
