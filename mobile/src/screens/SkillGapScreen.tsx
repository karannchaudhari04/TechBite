import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Dimensions, 
  Image, 
  Platform, 
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MISSIONS = [
  { id: 'intern', label: 'Land Internship', icon: '🎓', skills: ['DSA Basics', 'Personal Projects', 'Resume', 'Git', 'Soft Skills'] },
  { id: 'faang', label: 'Crack FAANG', icon: '🎯', skills: ['Advanced DSA', 'System Design', 'LLD', 'OS & Networking', 'Company Insights'] },
  { id: 'startup', label: 'Build Startup', icon: '🚀', skills: ['Full Stack', 'MVP Logic', 'Growth', 'Product Design', 'Scaling'] },
  { id: 'pro', label: 'Full-Stack Pro', icon: '💻', skills: ['React/Next', 'Node/Go', 'Cloud/DevOps', 'Databases', 'Security'] },
];

interface SkillGapScreenProps {
  onFinish: (mission: string, mastered: string[]) => void;
}

export default function SkillGapScreen({ onFinish }: SkillGapScreenProps) {
  const [selectedMission, setSelectedMission] = useState(MISSIONS[0]);
  const [masteredSkills, setMasteredSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setMasteredSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const remainingGaps = selectedMission.skills.length - masteredSkills.length;
  const progress = (masteredSkills.length / selectedMission.skills.length) * 100;

  return (
    <View style={styles.root}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerLeft}>Final Step</Text>
        <View style={styles.headerRight}>
           <View style={styles.dotContainer}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
           </View>
           <Text style={styles.progressText}>2 of 2</Text>
        </View>
      </View>

      {/* 2. Roadmap Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.cardContent}>
            
            {/* Mission Selection Area */}
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Define your mission</Text>
                <Text style={styles.subtitle}>Where are you heading next?</Text>
              </View>
              <View style={styles.botBox}>
                <Image source={require('../../assets/techbot.png')} style={styles.bot} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.missionWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.missionScroll}>
                {MISSIONS.map((m) => (
                  <Pressable 
                    key={m.id} 
                    onPress={() => {
                      setSelectedMission(m);
                      setMasteredSkills([]);
                    }}
                    style={[styles.missionBtn, selectedMission.id === m.id && styles.missionBtnActive]}
                  >
                    <Text style={styles.missionIcon}>{m.icon}</Text>
                    <Text style={[styles.missionLabel, selectedMission.id === m.id && styles.missionLabelActive]}>
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Mastery Grid */}
            <View style={styles.skillArea}>
               <View style={styles.skillTitleRow}>
                 <Text style={styles.skillTitle}>Identify your mastered skills</Text>
                 <Text style={styles.progressTag}>{Math.round(progress)}% Ready</Text>
               </View>
               
               <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.skillsGrid}>
                 {selectedMission.skills.map((skill) => {
                   const isMastered = masteredSkills.includes(skill);
                   return (
                     <Pressable 
                       key={skill} 
                       onPress={() => toggleSkill(skill)}
                       style={[styles.skillPill, isMastered && styles.skillPillMastered]}
                     >
                        <Ionicons 
                          name={isMastered ? "checkmark-circle" : "add-circle-outline"} 
                          size={18} 
                          color={isMastered ? "#4ADE80" : "#64748B"} 
                        />
                        <Text style={[styles.skillLabel, isMastered && styles.skillLabelMastered]}>{skill}</Text>
                     </Pressable>
                   );
                 })}
               </ScrollView>
            </View>

            {/* Gap Summary */}
            <View style={styles.summaryCard}>
               <Text style={styles.summaryText}>
                 We found <Text style={styles.accentText}>{remainingGaps} key gaps</Text> to bridge for your <Text style={styles.accentText}>{selectedMission.label}</Text> mission.
               </Text>
            </View>

            {/* Final Action Button */}
            <View style={styles.footer}>
               <Pressable 
                 onPress={() => onFinish(selectedMission.id, masteredSkills)}
                 style={({ pressed }) => [
                   styles.launchBtn,
                   pressed && styles.btnPressed
                 ]}
               >
                 <Text style={styles.launchBtnText}>Launch My Feed</Text>
                 <Ionicons name="rocket-outline" size={24} color="#FFF" />
               </Pressable>
            </View>

          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? 40 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
  headerLeft: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotContainer: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1E293B' },
  dotActive: { width: 22, backgroundColor: '#818CF8' },
  progressText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  cardContainer: { paddingHorizontal: 16, height: SCREEN_HEIGHT * 0.92 },
  card: { flex: 1, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  cardContent: { flex: 1, padding: 24 },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: '#94A3B8', fontSize: 15, marginTop: 4 },
  botBox: { width: 64, height: 64, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bot: { width: 48, height: 48 },

  missionWrapper: { marginBottom: 25 },
  missionScroll: { gap: 12 },
  missionBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18, backgroundColor: '#0F172A', alignItems: 'center', minWidth: 120, borderWidth: 1.2, borderColor: '#1E293B' },
  missionBtnActive: { borderColor: '#818CF8', backgroundColor: 'rgba(129, 140, 248, 0.1)' },
  missionIcon: { fontSize: 26, marginBottom: 4 },
  missionLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  missionLabelActive: { color: '#FFF' },

  skillArea: { flex: 1 },
  skillTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  skillTitle: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  progressTag: { color: '#4ADE80', fontSize: 12, fontWeight: '800', backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  skillsGrid: { gap: 10, paddingBottom: 20 },
  skillPill: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B', gap: 12 },
  skillPillMastered: { borderColor: '#4ADE80', backgroundColor: 'rgba(74, 222, 128, 0.05)' },
  skillLabel: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  skillLabelMastered: { color: '#FFF' },

  summaryCard: { padding: 16, backgroundColor: 'rgba(129, 140, 248, 0.05)', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.1)' },
  summaryText: { color: '#E2E8F0', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  accentText: { color: '#818CF8', fontWeight: '900' },

  footer: { height: 75, justifyContent: 'center' },
  launchBtn: { flex: 1, height: 64, borderRadius: 18, backgroundColor: '#818CF8', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, shadowColor: '#818CF8', shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  launchBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  btnPressed: { transform: [{ scale: 0.96 }] },

  bottomSpacer: { height: SCREEN_HEIGHT * 0.03 }
});
