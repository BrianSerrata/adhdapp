import React, { useRef, useEffect } from 'react';
import { Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { Ionicons } from '@expo/vector-icons'; // For Expo projects

// Import your screens
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import RoutineCalendar from '../components/RoutineCalendar';
import LifeCoach from '../screens/LifeCoach';
import Resources from '../screens/Resources';
import GoalDetail from '../screens/GoalDetail';
import GeneralManager from '../screens/GeneralManager';
import Routines from '../screens/RoutinesPage';
import RoutineBuilder from '../screens/RoutineBuilder';
import SplashScreen from '../components/SplashScreen';

enableScreens();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Animated Screen Wrapper Component
const AnimatedScreen = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [
          {
            translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Custom transition configuration
const forSlide = ({ current, next, inverted, layouts: { screen } }) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [screen.width, 0, -screen.width],
              extrapolate: 'clamp',
            }),
            inverted
          ),
        },
      ],
    },
  };
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 1,
          borderTopColor: '#242424',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          marginBottom: 7,
        },
        tabBarActiveTintColor: '#3d5afe',
        tabBarInactiveTintColor: '#848484',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        // Animation configuration
        animation: 'timing',
        animationEnabled: true,
        cardStyleInterpolator: forSlide,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 100,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 100,
            },
          },
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={(props) => (
          <AnimatedScreen>
            <RoutineCalendar {...props} />
          </AnimatedScreen>
        )}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Routines"
        component={(props) => (
          <AnimatedScreen>
            <Routines {...props} />
          </AnimatedScreen>
        )}
        options={{
          tabBarLabel: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ADHD Life Coach"
        component={(props) => (
          <AnimatedScreen>
            <LifeCoach {...props} />
          </AnimatedScreen>
        )}
        options={{
          tabBarLabel: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Resources"
        component={(props) => (
          <AnimatedScreen>
            <Resources {...props} />
          </AnimatedScreen>
        )}
        options={{
          tabBarLabel: 'Resources',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-books" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen" // Show Splash Screen first
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Login Page" component={LoginPage} />
      <Stack.Screen name="Register Page" component={RegisterPage} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
      <Stack.Screen name="GoalDetail" component={GoalDetail} />
      <Stack.Screen name="Planner" component={Routines} />
    </Stack.Navigator>
  );
};


export default AppNavigator;