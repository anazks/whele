import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function Loader({ 
  size = "large", 
  color = "#1a365d", 
  text = "Loading...", 
  bgColor = "rgba(255, 255, 255, 0.8)",
  textStyle = {},
  containerStyle = {}
}) {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }, containerStyle]}>
      <ActivityIndicator 
        size={size} 
        color={color} 
      />
      {text && <Text style={[styles.text, { color }, textStyle]}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
  },
});