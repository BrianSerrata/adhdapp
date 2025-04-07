import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CollapsibleRoutine = ({ 
  routine,
  children,
  selectedDate,
  formatTimeForDisplay,
  collapsedRoutines,
  onToggleCollapse 
}) => {
  const isCollapsed = collapsedRoutines.includes(routine.id);

  const toggleCollapse = useCallback(() => {
    onToggleCollapse(routine.id);
  }, [routine.id, onToggleCollapse]);

  return (
    <View style={styles.routineContainer}>
      <TouchableOpacity 
        style={styles.routineHeader}
        onPress={toggleCollapse}
        activeOpacity={0.7}
      >
        <Text style={styles.routineName}>{routine.name}</Text>
        <MaterialIcons
          name={isCollapsed ? 'expand-more' : 'expand-less'}
          size={24}
          color="#848484"
        />
      </TouchableOpacity>
      
      {!isCollapsed && (
        <View style={styles.routineContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  routineContainer: {
    backgroundColor: '#252525',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    marginTop: 16,
    elevation: 5,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4, // Add some padding for better touch area
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E5E7EB',
  },
  routineContent: {
    marginTop: 8,
  },
});

export default CollapsibleRoutine;