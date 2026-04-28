import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Bite } from '../types';

interface BiteCardProps { 
  item: Bite; 
  isBookmarked: boolean;
  onToggleBookmark: (bite: Bite) => void;
  fullScreen?: boolean;
  cardHeight?: number;
}

import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_COLORS: any = {
  'Data Structures': '#10B981',
  'Artificial Intelligence': '#7C3AED',
  'Web Development': '#0EA5E9',
  'Hardware & Chips': '#F59E0B',
  'Cybersecurity': '#EF4444',
  'System Design': '#EC4899',
  'Open Source': '#8B5CF6',
  'Career Tips': '#6366F1',
  'default': '#3B82F6',
};

const BiteCard = React.memo(({ item, isBookmarked, onToggleBookmark, fullScreen, cardHeight }: BiteCardProps) => {
  const categoryColor = CATEGORY_COLORS[item.categoryName] || CATEGORY_COLORS['default'];
  
  const handleOpenSource = () => {
    if (item.originalSourceUrl) {
      Linking.openURL(item.originalSourceUrl).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <View style={[styles.cardContainer, cardHeight ? { height: cardHeight } : null]}>
      <View style={styles.innerCard}>
        
        {/* Hero Image Section (1/3 of the card height) */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800' }}
            style={styles.image}
            contentFit="cover"
            transition={800}
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.95)']}
            style={styles.gradient}
          />
          
          <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{item.categoryName}</Text>
          </View>
        </View>

        {/* Content Section (2/3 of the card height) */}
        <View style={styles.contentSection}>
          <View style={styles.textBody}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.summary} numberOfLines={fullScreen ? 12 : 5}>
              {item.contentSummary}
            </Text>
          </View>
          
          <View style={styles.footerContainer}>
            <View style={styles.actionRow}>
              
              {/* SOURCE BUTTON */}
              <Pressable 
                onPress={handleOpenSource}
                style={({ pressed }) => [styles.sourceBtn, pressed && styles.pressed]}
              >
                <Text style={styles.sourceText}>READ FULL STORY</Text>
                <Text style={styles.sourceArrow}>↗</Text>
              </Pressable>

              {/* BOOKMARK BUTTON */}
              <Pressable 
                onPress={() => onToggleBookmark(item)}
                style={({ pressed }) => [
                  styles.bookmarkBtn, 
                  isBookmarked && styles.bookmarkActive,
                  pressed && styles.pressed
                ]}
              >
                <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkActiveText]}>
                  {isBookmarked ? '💙' : '🔖'}
                </Text>
              </Pressable>

            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
  },
  innerCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  imageSection: {
    height: '33%', // Strictly 1/3 of the card
    width: '100%',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  categoryPill: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28, // Space from inside bottom
    flex: 1,
    justifyContent: 'space-between',
  },
  textBody: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.8,
    marginBottom: 10,
    lineHeight: 32,
  },
  summary: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sourceText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  sourceArrow: {
    color: '#E9D5FF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold'
  },
  bookmarkBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  bookmarkActive: {
    backgroundColor: '#1E293B',
    borderColor: '#7C3AED',
  },
  bookmarkIcon: { fontSize: 20 },
  bookmarkActiveText: { color: '#7C3AED' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
});

export default BiteCard;
