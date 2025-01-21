// ResourcesPage.js
import React, { useState, useRef, useEffect } from 'react';
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
import FeedbackModal from '../components/FeedbackModal';
import { auth, db } from '../firebase';
import { collection, addDoc} from 'firebase/firestore';

// Import Tracking Functions
import {
  trackResourcesTabOpened,
  trackResourceLinkClicked,
  trackUniqueResourceLinkOpened,
  trackFeedbackSubmitted,
  trackResourceTabClicked
} from "../backend/apis/segment"; // Adjust the path accordingly

const resourceCategories = [
  {
    id: 'about-adhd',
    title: 'Learn About ADHD',
    icon: 'information-circle-outline',
    resources: [
      { title: 'What is ADHD?', url: 'https://my.clevelandclinic.org/health/diseases/4784-attention-deficithyperactivity-disorder-adhd' },
      { title: 'ADHD Symptoms', url: 'https://www.healthline.com/health/adhd/adult-adhd#disorganization' },
      { title: 'ADHD in Adults', url: 'https://my.clevelandclinic.org/health/diseases/5197-attention-deficit-hyperactivity-disorder-adhd-in-adults' },
    ]
  },
  {
    id: 'coping-strategies',
    title: 'Coping Strategies',
    icon: 'bulb-outline',
    resources: [
      { title: 'Time Management Techniques', url: 'https://health.clevelandclinic.org/time-management-tips-with-adhd' },
      { title: 'Improving Focus and Concentration', url: 'https://add.org/tips-for-focusing-with-adhd/' },
      { title: 'ADHD in the Workspace', url: 'https://chadd.org/for-adults/workplace-issues/' },
      { title: 'Emotional Regulation Strategies', url: 'https://www.beyondbooksmart.com/executive-functioning-strategies-blog/adhd-emotional-dysregulation' },
    ]
  },
  {
    id: 'useful-reads',
    title: 'Useful Reads',
    icon: 'book-outline',
    resources: [
      { title: 'ADHD and Friendships', url: 'https://www.healthline.com/health/adhd/adhd-and-friendships#growing-friendships' },
      { title: 'ADHD and Relationships', url: 'https://www.psychologytoday.com/us/basics/adhd/adhd-and-relationships' },
      { title: 'ADHD Hypersensitivity', url: 'https://www.verywellmind.com/sensitivities-and-adhd-20473' },
    ]
  },
];

const ResourcesPage = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef(null);

  // Feedback logic / states
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    relevance: "1",
    clarity: "1",
    usefulness: "1",
    resourceExpectations: '',
  });

  const questions = [
    {
      key: 'relevance',
      text: 'How relevant are the resources to your needs?',
      labels: ['Not relevant', 'Very relevant'],
    },
    {
      key: 'clarity',
      text: 'How clear and understandable is the information provided?',
      labels: ['Confusing', 'Very clear'],
    },
    {
      key: 'usefulness',
      text: 'How useful have you found the resources?',
      labels: ['Not useful', 'Very useful'],
    },
    {
      key: 'resourceExpectations',
      text: 'What kind of resources or information would you like to see added here?',
    },
  ];
  

  const handleSubmitFeedback = async () => {
    // Handle feedback submission logic (e.g., saving to Firestore)

    const numericFeedback = {
      relevance: Number(feedback.relevance),
      clarity: Number(feedback.clarity),
      usefulness: Number(feedback.usefulness), // Open-ended question
    };

    const fullFeedback = {
      ...numericFeedback,
      resourceExpectations: feedback.resourceExpectations,
      timestamp: new Date().toISOString(),
    };

    const feedbackRef = collection(
      db,
      'users',
      auth.currentUser.uid,
      'feedback' // Name of the feedback collection
    );
  
      // Save to Firestore
      await addDoc(feedbackRef, fullFeedback);
  
      console.log('Feedback successfully submitted to Firestore:', fullFeedback);     
      
      setFeedbackVisible(false); // Close the feedback form after submission
  };

  useEffect(() => {
    // Track "Resources Tab Opened" when the component mounts
    trackResourcesTabOpened({
      userId: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handlePress = async (url, title) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);

      // Track "Resource Link Clicked" event
      trackResourceLinkClicked({
        userId: auth.currentUser.uid,
        linkTitle: title,
        linkURL: url,
        timestamp: new Date().toISOString(),
      });

    } else {
      Alert.alert(`The URL ${url} is not supported.`);
    }
  };

  const handleResourceSelect = (resource) => {
    navigation.navigate('Therapy Chat', { resource });

    // Optionally, track when a user navigates to Therapy Chat via a resource
    trackResourceLinkClicked({
      userId: auth.currentUser.uid,
      linkTitle: resource.title,
      linkURL: resource.url,
      timestamp: new Date().toISOString(),
    });
  };

  const handleTabPress = (index) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);

    // Optionally, track tab changes
    trackResourceTabClicked({
      userId: auth.currentUser.uid,
      newTabIndex: index,
      newTabTitle: resourceCategories[index].title,
      timestamp: new Date().toISOString(),
    });
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
                          onPress={() => handlePress(resource.url, resource.title)}
                        >
                          <View style={styles.resourceTextContainer}>
                            <Text style={styles.resourceButtonText}>{resource.title}</Text>
                          </View>
                          {/* <TouchableOpacity
                            style={styles.chatIcon}
                            onPress={() => handleResourceSelect(resource)}
                          >
                            <Ionicons name="chatbubble-outline" size={24} color="#3d5afe" />
                          </TouchableOpacity> */}
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          ))}
        </PagerView>
      </View>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={feedbackVisible}
        setVisible={setFeedbackVisible}
        questions={questions}
        feedback={feedback}
        setFeedback={setFeedback}
        handleSubmit={handleSubmitFeedback}
        showFeedbackIcon={true}
      />
    </View>
  );
};

export default ResourcesPage;