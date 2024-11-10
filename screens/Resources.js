import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withDelay, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import * as Linking from "expo-linking"

const Tab = createMaterialTopTabNavigator();

const resourceCategories = [
  {
    id: 'about-adhd',
    title: 'Learn About ADHD',
    icon: 'brain',
    resources: [
      { title: 'What is ADHD?', url: 'https://my.clevelandclinic.org/health/diseases/4784-attention-deficithyperactivity-disorder-adhd' },
      { title: 'ADHD Symptoms', url: 'https://www.healthline.com/health/adhd/adult-adhd#disorganization' },
      { title: 'ADHD in Adults', url: '#' },
      { title: 'ADHD Myths and Facts', url: '#' },
    ]
  },
  {
    id: 'coping-strategies',
    title: 'Coping Strategies',
    icon: 'bulb',
    resources: [
      { title: 'Time Management Techniques', url: '#' },
      { title: 'Improving Focus and Concentration', url: '#' },
      { title: 'ADHD in the Workspace', url: 'https://chadd.org/for-adults/workplace-issues/' },
      { title: 'Organizing Your Space', url: '#' },
      { title: 'Emotional Regulation Strategies', url: '#' },
    ]
  },
  {
    id: 'useful-reads',
    title: 'Useful Reads',
    icon: 'book',
    resources: [
      { title: 'Best Books on ADHD', url: '#' },
      { title: 'ADHD Research Updates', url: '#' },
      { title: 'Personal Stories and Experiences', url: '#' },
      { title: 'ADHD in the Workplace', url: '#' },
    ]
  },
];

const handlePress = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
        await Linking.openURL(url)
    }
    else {
        alert('The URL ${url} is not supported.')
    }
}

const ResourceList = ({ resources, searchTerm }) => {
  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.resourceListContainer}>
      {filteredResources.map((resource, index) => (
        <Animated.View
          key={index}
          entering={withDelay(
            index * 100,
            FadeInDown.springify()
              .damping(12)
              .mass(0.9)
          )}
        >
          <TouchableOpacity
            style={styles.resourceButton}
            onPress={() => handlePress(resource.url)}
          >
            <Text style={styles.resourceButtonText}>{resource.title}</Text>
            <Feather name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const TabContent = ({ category, searchTerm }) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{category.title}</Text>
        <Text style={styles.cardDescription}>
          {category.title.toLowerCase()}
        </Text>
      </View>
      <ResourceList resources={category.resources} searchTerm={searchTerm} />
    </View>
  );
};

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <LinearGradient
      colors={['#4f46e5', '#7c3aed']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>ADHD Resources</Text>

        <View style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search resources..."
              placeholderTextColor="#6B7280"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                ...styles.tabBar,
                paddingTop: 10, // Add some padding
                },
                tabBarIndicatorStyle: styles.tabIndicator,
                tabBarLabelStyle: styles.tabLabel,
                tabBarActiveTintColor: '#FFFFFF', // Add this for active tab text
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)', // Add this for inactive tab text
                tabBarShowIcon: true, // Ensure icons are shown
                tabBarIconStyle: { marginBottom: 4 }, // Add space between icon and label
            }}
            >
            {resourceCategories.map((category) => (
                <Tab.Screen
                key={category.id}
                name={category.title}
                options={{
                    tabBarIcon: ({ color, focused }) => ( // Modified icon props
                    <Ionicons
                        name={category.icon}
                        size={20}
                        color={color} // Use the color provided by the tab navigator
                    />
                    ),
                }}
                >
                {() => <TabContent category={category} searchTerm={searchTerm} />}
                </Tab.Screen>
            ))}
        </Tab.Navigator>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 16,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#1F2937',
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  tabIndicator: {
    backgroundColor: '#FFFFFF',
    height: 3,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
    color: '#FFFFFF', // Ensure text color is visible
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  resourceListContainer: {
    padding: 16,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceButtonText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
};

export default ResourcesPage;