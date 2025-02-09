import React, { useState } from 'react';
import { View } from 'react-native';
import RoutineBuilder from './RoutineBuilder';
import { auth } from '../firebase';
import { useRoute } from "@react-navigation/native";

const Routines = () => {
  const route = useRoute();
  const aiInput = route.params?.aiInput;
  const fromLifeCoach = route.params?.fromLifeCoach;
  const routineGenerated = route.params?.routineGenerated;

  return (
    <View style={styles.container}>
      {/* Routine Builder - Only passing aiInput if fromLifeCoach is true */}
      <View style={styles.contentContainer}>
        <RoutineBuilder
          aiInput={fromLifeCoach ? aiInput : null}
          fromLifeCoach={fromLifeCoach}
          routineGenerated={routineGenerated}
        />
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flex: 1,
  },
};

export default Routines;
