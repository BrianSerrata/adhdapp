import React, { useState, useRef } from 'react';
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
import PagerView from 'react-native-pager-view';
import * as Linking from "expo-linking";
import RegisterPage from './RegisterPage';
import styles from '../styles/ResourcesStyles';

const resourceCategories = [
    {
      id: 'about-adhd',
      title: 'Learn About ADHD',
      icon: 'information-circle-outline', // Updated
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
      icon: 'bulb-outline', // Updated
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
      icon: 'book-outline', // Updated
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
        alert(`The URL ${url} is not supported.`)
    }
}

const ResourceList = ({ resources, searchTerm, onResourceSelect }) => {
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
          <View style={styles.resourceButton}>
            <TouchableOpacity
              style={styles.resourceTextContainer}
              onPress={() => handlePress(resource.url)}
            >
              <Text style={styles.resourceButtonText}>{resource.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatIcon}
              onPress={() => onResourceSelect(resource)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const TabContent = ({ category, searchTerm, onResourceSelect }) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{category.title}</Text>
        <Text style={styles.cardDescription}>
          {category.title.toLowerCase()}
        </Text>
      </View>
      <ResourceList 
        resources={category.resources} 
        searchTerm={searchTerm} 
        onResourceSelect={onResourceSelect}
      />
    </View>
  );
};

const ResourcesPage = ({ navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const pagerRef = useRef(null);
  
    const handleResourceSelect = (resource) => {
      navigation.navigate('Therapy Chat', { resource });
    };
  
    const handleTabPress = (index) => {
      setActiveTab(index);
      pagerRef.current?.setPage(index);
    };
  
    return (
      <View style={styles.container}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#4f46e5', '#7c3aed']}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.headerContent}>
  
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
  
            {/* Custom Tab Bar */}
            <View style={styles.tabBar}>
              {resourceCategories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.tab,
                    activeTab === index && styles.activeTab
                  ]}
                  onPress={() => handleTabPress(index)}
                >
                  <Ionicons
                    name={category.icon}
                    size={20}
                    color={activeTab === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText
                  ]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </LinearGradient>
  
        {/* Content Section */}
        <View style={styles.contentContainer}>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
          >
            {resourceCategories.map((category, index) => (
              <View key={category.id} style={styles.pageContainer}>
                <ScrollView style={styles.scrollView}>
                  <View style={styles.tabContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{category.title}</Text>
                      <Text style={styles.cardDescription}>
                        Browse {category.title.toLowerCase()} resources
                      </Text>
                    </View>
                    <View style={styles.resourceListContainer}>
                      {category.resources
                        .filter(resource => 
                          resource.title.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((resource, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.resourceButton}
                            onPress={() => handlePress(resource.url)}
                          >
                            <View style={styles.resourceTextContainer}>
                              <Text style={styles.resourceButtonText}>{resource.title}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.chatIcon}
                              onPress={() => handleResourceSelect(resource)}
                            >
                              <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>
                </ScrollView>
              </View>
            ))}
          </PagerView>
        </View>
      </View>
    );
  };
  
  export default ResourcesPage