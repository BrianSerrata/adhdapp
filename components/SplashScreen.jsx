import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleVideoFinish = () => {
    setTimeout(() => {
      navigation.replace('Login Page');
    }, 300); // Small buffer time
    // Navigate to Home screen
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../assets/FocusAI.mp4')} // Place video inside `assets/`
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            console.log("Video finished, attempting navigation");
            handleVideoFinish();
          }
        }}
      />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    width: width,
    height: height,
    position: 'absolute',
  },
});

export default SplashScreen;