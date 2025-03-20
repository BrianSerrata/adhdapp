import React, { useMemo } from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/RoutineCalendarStyles";

const ProgressBar = React.memo(({ totalTasks, completedTasks, streak }) => {
  const chunkWidth = 100 / totalTasks;

  // Memoize the FireIcon so it doesn't re-create on every render.
  const FireIcon = useMemo(
    () => (
      <Image
        source={require("../assets/fire-icon.png")}
        style={styles.fireIcon}
      />
    ),
    []
  );

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {Array.from({ length: totalTasks }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressChunk,
              {
                width: `${chunkWidth}%`,
                overflow: "hidden",
              },
            ]}
          >
            {index >= completedTasks ? (
              <View style={styles.incompleteChunk} />
            ) : (
              <LinearGradient
                colors={["#FFA500", "#FF8C00"]}
                style={styles.progressFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
          </View>
        ))}
      </View>
      <View style={styles.fireContainer}>
        {FireIcon}
        {/* <Text style={styles.streakText}>{streak}</Text> */}
      </View>
    </View>
  );
});

export default ProgressBar;