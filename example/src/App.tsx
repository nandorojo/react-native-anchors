import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { Target, ScrollView, Anchor } from '@nandorojo/anchor';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.box} />
        <Target name="top">
          <Anchor target="bottom">
            <Text>Scroll down</Text>
          </Anchor>
        </Target>
        <View style={styles.box} />
        <Target name="bottom">
          <Anchor target="top">
            <Text>Scroll up</Text>
          </Anchor>
        </Target>
        <View style={styles.box} />
        <View style={styles.box} />
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
    marginVertical: 20,
    backgroundColor: 'blue',
  },
});
