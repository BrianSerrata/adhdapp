import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import * as Linking from "expo-linking";
import styles from '../styles/ResourcesStyles';

const resourceCategories = [
  {
    id: 'about-adhd',
    title: 'Learn About ADHD',
    icon: 'information-circle-outline',
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
    icon: 'bulb-outline',
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
    icon: 'book-outline',
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
    await Linking.openURL(url);
  } else {
    alert(`The URL ${url} is not supported.`);
  }
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
        <SafeAreaView style={styles.headerContent}>
          <Text style={styles.title}>Resources</Text>

          {/* Search Bar */}
          <View style={styles.searchCard}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#848484" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search resources..."
                placeholderTextColor="#848484"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
          </View>

          {/* Tab Bar */}
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
                  color={activeTab === index ? '#ffffff' : '#848484'}
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

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
        >
          {resourceCategories.map((category) => (
            <View key={category.id} style={styles.pageContainer}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
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
                            <Ionicons name="chatbubble-outline" size={24} color="#3d5afe" />
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

export default ResourcesPage;
