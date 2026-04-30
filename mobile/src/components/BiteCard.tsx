import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet, Dimensions, Share } from 'react-native';
import { Image } from 'expo-image';
import { Bite } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BiteCardProps { 
  item: Bite; 
  isBookmarked: boolean;
  onToggleBookmark: (bite: Bite) => void;
  cardHeight: number;
}

const BiteCard = React.memo(({ item, isBookmarked, onToggleBookmark, cardHeight }: BiteCardProps) => {
  
  const handleOpenSource = () => {
    if (item.originalSourceUrl) {
      Linking.openURL(item.originalSourceUrl).catch(err => {});
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🚀 TechBite: ${item.title}\n\nRead more: techbite://bite/${item.id}`,
        url: item.originalSourceUrl,
      });
    } catch (error) {
      // Handle silently
    }
  };

  // Split summary into bullets if possible
  const summaryPoints = item.contentSummary.includes('•') 
    ? item.contentSummary.split('•').filter(p => p.trim().length > 0)
    : item.contentSummary.split('. ').filter(p => p.trim().length > 0);

  return (
    <View style={[styles.root, { height: cardHeight }]}>
      <View style={styles.card}>
        
        {/* Top Header Image Section */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800' }}
            style={styles.heroImg}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient 
            colors={['rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 1)']} 
            style={styles.imgOverlay} 
          />
          
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.categoryName || 'Tech'}</Text>
            </View>
            <View style={styles.tldrBadge}>
                <Text style={styles.tldrText}>SUMMARY</Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentSection}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.summaryList}>
              {summaryPoints.slice(0, 4).map((point, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                      <View style={styles.dot} />
                      <Text style={styles.bulletText} numberOfLines={3}>{point.trim()}</Text>
                  </View>
              ))}
          </View>

          <Pressable onPress={handleOpenSource} style={styles.sourceContainer}>
              <Ionicons name="link-outline" size={14} color="#6366F1" />
              <Text style={styles.sourceText}>Source: {new URL(item.originalSourceUrl || 'https://techbite.app').hostname}</Text>
          </Pressable>
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
            <View style={styles.statsGroup}>
               <View style={styles.statItem}>
                  <Ionicons name="flame" size={20} color="#F59E0B" />
                  <Text style={styles.statText}>12 Streak</Text>
               </View>
            </View>

            <View style={styles.btnGroup}>
                <Pressable 
                  onPress={() => onToggleBookmark(item)} 
                  style={({ pressed }) => [styles.iconCircle, pressed && styles.pressed]}
                >
                  <Ionicons 
                    name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                    size={22} 
                    color={isBookmarked ? "#6366F1" : "#94A3B8"} 
                  />
                </Pressable>
                
                <Pressable 
                  onPress={handleShare} 
                  style={({ pressed }) => [styles.iconCircle, pressed && styles.pressed]}
                >
                  <Ionicons name="share-social-outline" size={22} color="#94A3B8" />
                </Pressable>
            </View>
        </View>

      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { width: SCREEN_WIDTH, backgroundColor: '#0F172A', padding: 12 },
  card: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  imageSection: { height: '25%', width: '100%', position: 'relative' },
  heroImg: { ...StyleSheet.absoluteFillObject },
  imgOverlay: { ...StyleSheet.absoluteFillObject },
  badgeRow: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge: { backgroundColor: 'rgba(99, 102, 241, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  categoryText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  tldrBadge: { backgroundColor: 'rgba(15, 23, 42, 0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tldrText: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  contentSection: { flex: 1, paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 12, letterSpacing: -0.5 },
  summaryList: { gap: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#6366F1', marginTop: 8, marginRight: 10 },
  bulletText: { color: '#CBD5E1', fontSize: 15, lineHeight: 22, fontWeight: '400', flex: 1 },
  sourceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 4 },
  sourceText: { color: '#6366F1', fontSize: 12, fontWeight: '600' },
  actionBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)'
  },
  statsGroup: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  btnGroup: { flexDirection: 'row', gap: 16 },
  iconCircle: { padding: 4 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
});

export default BiteCard;


export default BiteCard;
