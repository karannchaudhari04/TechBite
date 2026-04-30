import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, Pressable, Dimensions, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../utils/firebase';
import BiteCard from '../components/BiteCard';
import { Bite } from '../types';
import { useBites } from '../hooks/useBites';
import { useBookmarks } from '../hooks/useBookmarks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'foryou' | 'saved'>('foryou');
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [headerHeight, setHeaderHeight] = useState(130);
  const [streak, setStreak] = useState(12);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);
  
  const { 
    data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching 
  } = useBites(activeTab === 'saved' ? 'all' : activeTab);
  
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();

  const bitesData = useMemo(() => {
    if (activeTab === 'saved') return bookmarks;
    return data ? data.pages.flatMap(page => page.content) : [];
  }, [data, activeTab, bookmarks]);

  const itemHeight = SCREEN_HEIGHT - headerHeight;

  const renderItem = useCallback(({ item }: { item: Bite }) => (
    <View style={{ height: itemHeight, width: SCREEN_WIDTH }}>
      <BiteCard 
        item={item} 
        isBookmarked={isBookmarked(item.id)} 
        onToggleBookmark={toggleBookmark} 
        cardHeight={itemHeight}
      />
    </View>
  ), [isBookmarked, toggleBookmark, itemHeight]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Sticky Header */}
        <View 
          onLayout={(e) => setHeaderHeight(Math.round(e.nativeEvent.layout.height))}
          style={styles.header}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
                <Pressable onPress={() => navigation.navigate('Profile')} style={styles.iconCircle}>
                   <Ionicons name="person-outline" size={20} color="#94A3B8" />
                </Pressable>
                <View style={styles.streakContainer}>
                   <Ionicons name="flash" size={16} color="#F59E0B" />
                   <Text style={styles.streakText}>{streak}</Text>
                </View>
            </View>

            <View style={styles.topBarCenter}>
                <Image 
                    source={require('../../assets/logo_horizontal.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.topBarRight}>
                <Pressable onPress={() => {}} style={styles.iconCircle}>
                   <Ionicons name="search-outline" size={20} color="#94A3B8" />
                </Pressable>
            </View>
          </View>

          {/* Centered Tabs */}
          <View style={styles.tabWrapper}>
              <View style={styles.tabList}>
                <TabButton label="Digest" active={activeTab === 'foryou'} onPress={() => setActiveTab('foryou')} />
                <TabButton label="Explore" active={activeTab === 'all'} onPress={() => setActiveTab('all')} />
                <TabButton label="Saved" active={activeTab === 'saved'} onPress={() => setActiveTab('saved')} />
              </View>
          </View>
        </View>
        
        {/* Feed Area */}
        <View style={styles.feed}>
          {isLoading && bitesData.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color="#6366F1" size="large" />
            </View>
          ) : activeTab === 'saved' && bitesData.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>Nothing saved yet.</Text>
              <Text style={styles.emptyText}>Bites you bookmark will appear here.</Text>
            </View>
          ) : (
            <FlashList
              data={bitesData}
              renderItem={renderItem}
              estimatedItemSize={itemHeight}
              pagingEnabled
              snapToInterval={itemHeight}
              snapToAlignment="start"
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              onEndReached={() => activeTab !== 'saved' && hasNextPage && !isFetchingNextPage && fetchNextPage()}
              refreshControl={
                <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} tintColor="#6366F1" />
              }
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const TabButton = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.tabBtn}>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    {active && <View style={styles.tabIndicator} />}
  </Pressable>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  safeArea: { flex: 1 },
  header: { paddingBottom: 4, backgroundColor: '#0F172A' },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 10 
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  topBarCenter: { flex: 2, alignItems: 'center' },
  topBarRight: { flex: 1, alignItems: 'flex-end' },
  headerLogo: { width: 110, height: 28 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  streakContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(245, 158, 11, 0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 10,
    alignItems: 'center'
  },
  streakText: { color: '#F59E0B', fontSize: 13, fontWeight: '800', marginLeft: 4 },
  tabWrapper: { alignItems: 'center', marginTop: 8 },
  tabList: { flexDirection: 'row', gap: 32 },
  tabBtn: { paddingBottom: 8, alignItems: 'center' },
  tabLabel: { color: '#64748B', fontSize: 15, fontWeight: '700' },
  tabLabelActive: { color: '#F8FAFC' },
  tabIndicator: { width: 16, height: 3, backgroundColor: '#6366F1', borderRadius: 2, marginTop: 4 },
  feed: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 60 },
  emptyTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  emptyText: { color: '#94A3B8', fontSize: 16, textAlign: 'center', lineHeight: 24, fontWeight: '500' }
});
