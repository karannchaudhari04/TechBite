import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '../utils/firebase';

import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingIntroScreen from '../screens/OnboardingIntroScreen';
import InterestsSelectionScreen from '../screens/InterestsSelectionScreen';
import SkillGapScreen from '../screens/SkillGapScreen';
import HomeScreen from '../screens/HomeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BiteDetailScreen from '../screens/BiteDetailScreen';

const linking = {
  prefixes: ['techbite://', 'https://techbite.app'],
  config: {
    screens: {
      Home: 'home',
      BiteDetail: 'bite/:id',
      Profile: 'profile',
      Bookmarks: 'bookmarks',
      Welcome: 'welcome',
      OnboardingIntro: 'intro',
      Interests: 'interests',
      SkillGap: 'skillgap',
    },
  },
};

export type RootStackParamList = {
  Welcome: undefined;
  OnboardingIntro: undefined;
  Interests: undefined;
  SkillGap: undefined;
  Home: undefined;
  Bookmarks: undefined;
  Profile: undefined;
  BiteDetail: { id: number };
};

type AppScreen = 'Welcome' | 'OnboardingIntro' | 'Interests' | 'SkillGap' | 'Home';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentFlow, setCurrentFlow] = useState<AppScreen>('Welcome');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // In a real app, you might check profile status here
        setCurrentFlow('Home');
      } else {
        queryClient.removeQueries({ queryKey: ['bookmarks'] });
        queryClient.invalidateQueries({ queryKey: ['bites', 'foryou'] });
        setCurrentFlow('Welcome');
      }

      setIsInitializing(false);
    });

    return unsubscribe;
  }, [queryClient]);

  const handleSignedIn = useCallback((hasPreferences: boolean) => {
    if (hasPreferences) {
      setCurrentFlow('Home');
    } else {
      setCurrentFlow('OnboardingIntro');
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setCurrentFlow('Interests');
  }, []);

  const handleSkip = useCallback(() => {
    setCurrentFlow('Home');
  }, []);

  const handleInterestsComplete = useCallback(() => {
    setCurrentFlow('SkillGap');
  }, []);

  const handleSkillGapComplete = useCallback(() => {
    setCurrentFlow('Home');
  }, []);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator 
        initialRouteName={currentFlow}
        screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
      >
        {currentFlow === 'Welcome' && (
          <Stack.Screen name="Welcome">
            {(props) => (
              <WelcomeScreen
                {...props}
                onSkip={handleSkip}
                onSignedIn={handleSignedIn}
              />
            )}
          </Stack.Screen>
        )}

        {currentFlow === 'OnboardingIntro' && (
          <Stack.Screen name="OnboardingIntro">
            {(props) => (
              <OnboardingIntroScreen
                {...props}
                onNext={handleIntroComplete}
              />
            )}
          </Stack.Screen>
        )}

        {currentFlow === 'Interests' && (
          <Stack.Screen name="Interests">
            {(props) => (
              <InterestsSelectionScreen
                {...props}
                onComplete={handleInterestsComplete}
              />
            )}
          </Stack.Screen>
        )}

        {currentFlow === 'SkillGap' && (
          <Stack.Screen name="SkillGap">
            {(props) => (
              <SkillGapScreen
                {...props}
                onFinish={handleSkillGapComplete}
              />
            )}
          </Stack.Screen>
        )}

        {currentFlow === 'Home' && (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}

        <Stack.Screen name="BiteDetail" component={BiteDetailScreen} />

        {currentFlow === 'Home' && !user && (
          <Stack.Screen name="Welcome">
            {(props) => (
              <WelcomeScreen
                {...props}
                onSkip={handleSkip}
                onSignedIn={handleSignedIn}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
