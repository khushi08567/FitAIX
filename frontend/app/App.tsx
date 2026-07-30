import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

import { NutritionScreen } from './src/features/nutrition/screens/NutritionScreen';
import { DashboardScreen } from './src/features/nutrition/screens/DashboardScreen';
import { WorkoutScreen } from './src/features/nutrition/screens/WorkoutScreen';
import { CommunityScreen } from './src/features/nutrition/screens/CommunityScreen';
import { ProfileScreen } from './src/features/nutrition/screens/ProfileScreen';
import { LoginScreen } from './src/features/nutrition/screens/LoginScreen';
import { BottomNav } from './src/features/nutrition/components/BottomNav';
import { RachelChatModal } from './src/features/nutrition/components/RachelChatModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type TabName = 'Dashboard' | 'Workout' | 'Nutrition' | 'Community' | 'Profile';

interface MainAppProps {
  onLogout: () => void;
}

function MainApp({ onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const [showChat, setShowChat] = useState(false);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={setActiveTab} />;
      case 'Workout':
        return <WorkoutScreen />;
      case 'Nutrition':
        return <NutritionScreen />;
      case 'Community':
        return <CommunityScreen />;
      case 'Profile':
        return <ProfileScreen onLogout={onLogout} />;
      default:
        return <NutritionScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Active Screen Area */}
      <View style={styles.screenContent}>
        {renderActiveScreen()}
      </View>

      {/* Global Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />

      {/* Global Floating Chatbot Button */}
      <TouchableOpacity
        style={styles.floatingChatBtn}
        onPress={() => setShowChat(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingChatBtnText}>🤖</Text>
      </TouchableOpacity>

      {/* Global Coach Chat Overlay */}
      <RachelChatModal visible={showChat} onClose={() => setShowChat(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12110D',
  },
  screenContent: {
    flex: 1,
  },
  floatingChatBtn: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#12110D',
    zIndex: 9998,
  },
  floatingChatBtnText: {
    fontSize: 24,
  },
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoggedIn ? (
        <MainApp onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      )}
    </QueryClientProvider>
  );
}
