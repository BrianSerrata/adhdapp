import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import slateStyles from '../styles/RoutineCalendarStyles';

export default function GoalDetail({ route, navigation }) {
  // The full goal object is passed from GoalManager
  const { goal } = route.params;
  const { smartGoal, phases = [], dateRange } = goal;
  
  // For collapsible phases
  const [expandedPhaseIndex, setExpandedPhaseIndex] = useState(null);
  const togglePhase = (index) => {
    setExpandedPhaseIndex(index === expandedPhaseIndex ? null : index);
  };

  if (!phases.length) {
    return (
      <SafeAreaView style={slateStyles.safeContainer}>
        <ScrollView
          style={slateStyles.scrollView}
          contentContainerStyle={slateStyles.scrollContent}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 16 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <Text style={slateStyles.header}>
            {smartGoal?.specific ?? 'Untitled Goal'}
          </Text>

          <View style={slateStyles.emptyState}>
            <Text style={slateStyles.emptyStateText}>No Phases Found</Text>
            <Text style={slateStyles.emptyStateSubtext}>
              This goal may not have generated phases or is incomplete.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={slateStyles.safeContainer}>
      <ScrollView
        style={slateStyles.scrollView}
        contentContainerStyle={slateStyles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 16 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Goal Title */}
        <Text style={slateStyles.header}>
          {smartGoal?.specific ?? 'Untitled Goal'}
        </Text>

        {/* Phase List */}
        {phases.map((phase, index) => {
          const isExpanded = expandedPhaseIndex === index;

          // Convert dateRange to readable
          const phaseStart = phase.dateRange.start
            ? new Date(phase.dateRange.start)
            : null;
          const phaseEnd = phase.dateRange.end
            ? new Date(phase.dateRange.end)
            : null;

          return (
            <View key={index} style={slateStyles.routineContainer}>
              {/* Phase Header */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onPress={() => togglePhase(index)}
              >
                <Text style={slateStyles.routineName}>
                  {phase.name} ({phase.duration})
                </Text>
                <MaterialIcons
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {/* Collapsible Phase Content */}
              {isExpanded && (
                <View style={{ marginTop: 10 }}>
                  {/* Phase date range */}
                  <Text style={slateStyles.taskTime}>
                    {phaseStart?.toLocaleDateString()} - {phaseEnd?.toLocaleDateString()}
                  </Text>

                  {/* Phase metrics (optional) */}
                  {phase.metrics?.description && (
                    <Text style={[slateStyles.taskTime, { marginTop: 4 }]}>
                      Goal: {phase.metrics.description} 
                    </Text>
                  )}

                  {/* Task List */}
                  {phase.routine?.tasks?.length ? (
                    <View style={{ marginTop: 12 }}>
                      {phase.routine.tasks.map((task, idx) => (
                        <View key={task.id} style={slateStyles.taskItem}>
                          <View style={slateStyles.taskHeader}>
                            <View style={slateStyles.taskTitleContainer}>
                              <Text style={slateStyles.taskTitle}>
                                {task.title}
                              </Text>
                              <Text style={slateStyles.taskTime}>
                                {task.timeRange?.start} - {task.timeRange?.end}
                              </Text>
                            </View>
                          </View>
                          {/* Expanded content (read-only) */}
                          <View style={slateStyles.expandedContent}>
                            <Text style={[slateStyles.taskTime, { marginBottom: 8 }]}>
                              {task.description}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={slateStyles.emptyState}>
                      <Text style={slateStyles.emptyStateText}>
                        No Tasks in This Phase
                      </Text>
                      <Text style={slateStyles.emptyStateSubtext}>
                        This phase has no routine tasks.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
