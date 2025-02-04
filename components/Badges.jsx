// AnimatedBadge.js
import React, { useRef, useEffect } from "react";
import { Animated, View, Image, FlatList } from "react-native";
import { Audio } from "expo-av"; // For playing sounds in Expo apps
import styles from "../styles/BadgesStyles";

const AnimatedBadge = ({ unlocked, source }) => {
    // Initialize an Animated value for opacity.
    const opacityAnim = useRef(new Animated.Value(1)).current;
  
    useEffect(() => {
      if (unlocked) {
        // Animate opacity from 0 to 1 for a fade-in effect.
        opacityAnim.setValue(0);
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500, // Adjust duration as needed
          useNativeDriver: true,
        }).start();
      }
    }, [unlocked, opacityAnim]);
  
    return (
      <Animated.Image
        source={source}
        style={[
          styles.badgeIcon,
          {
            opacity: opacityAnim, // Apply opacity animation
          },
        ]}
      />
    );
  };
  


const BadgesView = ({ allTasksCompleted, tasksCompleted }) => {
    // Define badges with an explicit "unlocked" boolean.
    const badges = [
      {
        id: "early-bird",
        unlocked: tasksCompleted > 0,
        source: tasksCompleted > 0
          ? require("../assets/early-bird-lit.png")
          : require("../assets/early-bird-dull.png"),
      },
      {
        id: "task-master",
        unlocked: tasksCompleted > 2,
        source: tasksCompleted > 0
          ? require("../assets/task-master-lit.png")
          : require("../assets/task-master-dull.png"),
      },
      {
        id: "goal-crusher",
        unlocked: allTasksCompleted,
        source: allTasksCompleted
          ? require("../assets/goal-crusher-lit.png")
          : require("../assets/goal-crusher-dull.png"),
      },
      // Add more badges as needed.
    ];
  
    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={badges}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedBadge unlocked={item.unlocked} source={item.source} />
          )}
        />
      </View>
    );
  };

export default BadgesView;
