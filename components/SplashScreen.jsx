import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';

const SplashScreen = ({ onFinish }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#fff" />}
      <Video
        source={require('../assets/FocusAI.mp4')} // Add your video in assets folder
        style={styles.video}
        resizeMode="cover"
        onLoad={() => setIsLoading(false)}
        onEnd={onFinish} // Trigger the transition when the video finishes
        muted={false}
        repeat={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});

export default SplashScreen;
