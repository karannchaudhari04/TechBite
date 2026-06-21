import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  Dimensions, 
  ToastAndroid, 
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  GoogleAuthProvider, 
  signInWithCredential, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withSpring,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;

interface WelcomeScreenProps {
  onSkip: () => void;
  onSignedIn: (hasPreferences: boolean) => void;
  navigation: any;
}

export default function WelcomeScreen({ onSkip, onSignedIn, navigation }: WelcomeScreenProps) {
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const { colors } = useTheme();

  // Tab State
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);

  // Reanimated Shared Values
  const translateY = useSharedValue(0);
  const tabTranslateX = useSharedValue(0);
  const formOpacity = useSharedValue(1);

  // Typewriter tagline
  const [tagline, setTagline] = useState('');

  // Floating hover animation for TechBot Mascot
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Segmented control toggle slide transition
  const tabWidth = (SCREEN_WIDTH - scale(102)) / 2; // precisely accounts for container, card, and indicator paddings
  useEffect(() => {
    tabTranslateX.value = withSpring(isSignUp ? tabWidth : 0, { damping: 18, stiffness: 120 });
    
    // Cross-fade the forms on tab toggle
    formOpacity.value = 0.3;
    formOpacity.value = withTiming(1, { duration: 250 });
    
    setErrorMsg('');
  }, [isSignUp]);

  // Tagline typewriter execution
  useEffect(() => {
    const fullText = "Tech News, Made Easy!";
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setTagline((prev) => prev + fullText.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Animated Styles
  const animatedBotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const activeIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabTranslateX.value }]
  }));

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value
  }));

  // Handlers
  const handleSkipPress = () => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      onSkip();
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleSigningIn || isAuthLoading) return;
    setIsGoogleSigningIn(true);
    setErrorMsg('');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || (response as any).idToken;

      if (!idToken) throw new Error("No ID token received from Google");

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);

      if (Platform.OS === 'android') {
        ToastAndroid.show("Sign in successful!", ToastAndroid.SHORT);
      }
    } catch (error: any) {
      if (error.code !== 'ASYNC_OP_IN_PROGRESS') {
        setErrorMsg(error.message || "Google Sign-In failed.");
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleEmailAuth = async () => {
    if (isAuthLoading || isGoogleSigningIn) return;
    setErrorMsg('');

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    // Basic Validations
    if (!trimmedEmail || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }
    if (isSignUp && !trimmedName) {
      setErrorMsg('Name is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsAuthLoading(true);
    try {
      if (isSignUp) {
        // Register User
        const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        // Apply Display Name
        await updateProfile(credential.user, { displayName: trimmedName });
        if (Platform.OS === 'android') {
          ToastAndroid.show("Account created successfully!", ToastAndroid.SHORT);
        }
      } else {
        // Sign In User
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        if (Platform.OS === 'android') {
          ToastAndroid.show("Welcome back!", ToastAndroid.SHORT);
        }
      }
    } catch (error: any) {
      console.warn('[Auth] Email login/signup failed:', error.code, error.message);
      let friendlyMessage = 'Authentication failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        friendlyMessage = 'Incorrect email or password.';
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network error. Please check your internet.';
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Absolute background gradient blob */}
      <LinearGradient 
        colors={['rgba(99, 102, 241, 0.12)', 'transparent']}
        style={styles.bgGlow}
      />

      <SafeAreaView style={styles.safeArea}>
        
        {/* Repositioned & Styled Top-Right Skip Capsule */}
        <View style={styles.topBar}>
          <Pressable onPress={handleSkipPress} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerContainer}>
                
                {/* Header Mascot + Logo Section */}
                <View style={styles.headerSection}>
                  <View style={styles.botRow}>
                    <Animated.View style={animatedBotStyle}>
                      <Image 
                        source={require('../../assets/techbot.jpg')}
                        style={styles.botIcon}
                        resizeMode="contain"
                      />
                    </Animated.View>
                    <View style={styles.brandContainer}>
                      <View style={styles.logoRow}>
                        <Image 
                          source={require('../../assets/welcome_logo.jpg')}
                          style={styles.logo}
                          resizeMode="contain"
                        />
                        <Text style={styles.brandName}>TechBite</Text>
                      </View>
                      <Text style={styles.tagline}>{tagline}</Text>
                    </View>
                  </View>
                </View>

                {/* Form Card */}
                <View style={styles.cardContainer}>
                  <View style={[styles.glassCard, { borderColor: colors.border }]}>
                    
                    {/* Segmented Toggle Control */}
                    <View style={styles.tabContainer}>
                      <Animated.View style={[styles.activeIndicator, { width: tabWidth }, activeIndicatorStyle]} />
                      
                      <Pressable 
                        style={styles.tab} 
                        onPress={() => setIsSignUp(false)}
                      >
                        <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
                      </Pressable>
                      
                      <Pressable 
                        style={styles.tab} 
                        onPress={() => setIsSignUp(true)}
                      >
                        <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Sign Up</Text>
                      </Pressable>
                    </View>

                    {/* Inputs Area */}
                    <Animated.View style={[styles.formContainer, animatedFormStyle]}>
                      {isSignUp && (
                        <View style={styles.inputWrapper}>
                          <Text style={styles.inputLabel}>Name</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { borderColor: focusedField === 'name' ? '#818CF8' : 'rgba(255,255,255,0.08)' }
                            ]}
                            placeholder="John Doe"
                            placeholderTextColor="#64748B"
                            value={name}
                            onChangeText={setName}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            autoCapitalize="words"
                          />
                        </View>
                      )}

                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                          style={[
                            styles.input,
                            { borderColor: focusedField === 'email' ? '#818CF8' : 'rgba(255,255,255,0.08)' }
                          ]}
                          placeholder="email@example.com"
                          placeholderTextColor="#64748B"
                          value={email}
                          onChangeText={setEmail}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                          style={[
                            styles.input,
                            { borderColor: focusedField === 'password' ? '#818CF8' : 'rgba(255,255,255,0.08)' }
                          ]}
                          placeholder="••••••••"
                          placeholderTextColor="#64748B"
                          value={password}
                          onChangeText={setPassword}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          secureTextEntry
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      {errorMsg.length > 0 && (
                        <View style={styles.errorContainer}>
                          <Ionicons name="alert-circle" size={16} color="#F87171" />
                          <Text style={styles.errorText}>{errorMsg}</Text>
                        </View>
                      )}

                      {/* Main Email CTA Button (wrapped in scale animated press feedback) */}
                      <Pressable
                        onPress={handleEmailAuth}
                        disabled={isAuthLoading || isGoogleSigningIn}
                        style={({ pressed }) => [
                          { width: '100%' },
                          pressed && styles.btnPressed
                        ]}
                      >
                        <LinearGradient
                          colors={['#6366F1', '#4F46E5']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.submitBtn, styles.submitGradient]}
                        >
                          {isAuthLoading ? (
                            <ActivityIndicator color="#FFF" />
                          ) : (
                            <Text style={styles.submitBtnText}>
                              {isSignUp ? 'Create Account' : 'Sign In'}
                            </Text>
                          )}
                        </LinearGradient>
                      </Pressable>
                    </Animated.View>

                    {/* Social Login Divider */}
                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or continue with</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* Secondary Google Button */}
                    <Pressable
                      onPress={handleGoogleSignIn}
                      disabled={isGoogleSigningIn || isAuthLoading}
                      style={({ pressed }) => [
                        { width: '100%' },
                        pressed && styles.btnPressed
                      ]}
                    >
                      <View style={[styles.googleBtn, styles.googleContent]}>
                        {isGoogleSigningIn ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <>
                            <Image 
                              source={require('../../assets/google.png')}
                              style={styles.googleIcon}
                              resizeMode="contain"
                            />
                            <Text style={styles.googleBtnText}>Google</Text>
                          </>
                        )}
                      </View>
                    </Pressable>

                  </View>
                </View>

                {/* Legal Policy Links */}
                <Text style={styles.legalText}>
                  By continuing, you agree to the <Text style={styles.link}>terms</Text> and <Text style={styles.link}>privacy policy</Text>.
                </Text>

              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: scale(220) },
  safeArea: { flex: 1 },
  
  topBar: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? scale(12) : scale(16), 
    right: scale(16), 
    zIndex: 10 
  },
  skipBtn: { 
    paddingHorizontal: scale(16), 
    paddingVertical: scale(8), 
    borderRadius: scale(20), 
    backgroundColor: 'rgba(255,255,255,0.06)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.09)' 
  },
  skipText: { color: '#94A3B8', fontSize: scale(14), fontWeight: '800', letterSpacing: 0.2 },

  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  innerContainer: { flex: 1, paddingHorizontal: scale(24), justifyContent: 'space-between', paddingBottom: scale(20) },

  headerSection: { marginTop: scale(50), marginBottom: scale(10) },
  botRow: { flexDirection: 'row', alignItems: 'center', gap: scale(16) },
  botIcon: { width: scale(60), height: scale(60) },
  brandContainer: { flex: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  logo: { width: scale(24), height: scale(24) },
  brandName: { color: '#F8FAFC', fontSize: scale(26), fontWeight: '900', letterSpacing: -0.5 },
  tagline: { color: '#94A3B8', fontSize: scale(14), marginTop: scale(4), fontWeight: '600' },

  cardContainer: { width: '100%', marginVertical: scale(10) },
  glassCard: {
    width: '100%',
    borderRadius: scale(28),
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1.5,
    padding: scale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },

  tabContainer: {
    flexDirection: 'row',
    height: scale(46),
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: scale(23),
    padding: scale(3),
    marginBottom: scale(20),
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeIndicator: {
    position: 'absolute',
    top: scale(3),
    bottom: scale(3),
    left: scale(3),
    backgroundColor: '#6366F1',
    borderRadius: scale(20),
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  tabText: { color: '#94A3B8', fontSize: scale(14), fontWeight: '800' },
  tabTextActive: { color: '#FFFFFF' },

  formContainer: { width: '100%' },
  inputWrapper: { marginBottom: scale(14) },
  inputLabel: { color: '#94A3B8', fontSize: scale(12), fontWeight: '700', marginBottom: scale(6), textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    width: '100%',
    height: scale(48),
    backgroundColor: 'rgba(30, 41, 59, 0.35)',
    borderRadius: scale(12),
    borderWidth: 1.5,
    paddingHorizontal: scale(16),
    color: '#FFFFFF',
    fontSize: scale(15),
    fontWeight: '600',
  },

  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginBottom: scale(14), backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: scale(8), borderRadius: scale(8), borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)' },
  errorText: { color: '#F87171', fontSize: scale(13), fontWeight: '600', flex: 1 },

  submitBtn: { width: '100%', height: scale(50), borderRadius: scale(25), overflow: 'hidden', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  submitGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFFFFF', fontSize: scale(16), fontWeight: '800', letterSpacing: 0.5 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: scale(20), gap: scale(10) },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: { color: '#475569', fontSize: scale(12), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  googleBtn: { width: '100%', height: scale(48), backgroundColor: '#0F172A', borderRadius: scale(24), borderWidth: 1.5, borderColor: '#1E293B' },
  googleContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: scale(10) },
  googleIcon: { width: scale(20), height: scale(20) },
  googleBtnText: { color: '#FFFFFF', fontSize: scale(15), fontWeight: '700' },

  btnPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },

  legalText: { color: '#475569', fontSize: scale(12), textAlign: 'center', marginTop: scale(20), fontWeight: '600' },
  link: { color: '#6366F1', fontWeight: '700' }
}) as any;