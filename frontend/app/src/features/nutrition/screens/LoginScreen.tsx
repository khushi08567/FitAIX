import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';

interface LoginScreenProps {
  onLogin: () => void;
}

type GoalOption = 'Build muscle' | 'Lose fat' | 'Gain strength' | 'Improve overall health' | 'Improve performance' | 'Something else';
type GenderOption = 'Male' | 'Female' | 'Prefer not to say';
type ExperienceOption = "I'm just getting started" | 'Less than 1 year' | '1-2 years' | '2-5 years' | 'More than 5 years';
type MotivationOption = 'Accountability' | 'Competition' | 'Fun' | 'Self-Motivated';
type ObstacleOption = 'Lack of motivation' | 'Not sure what to do to get results' | 'Not enough time to work out' | 'Dealing with an injury' | 'Something else' | 'None right now';
type SourceOption = 'Friends or family' | 'Reddit' | 'Google search' | 'Online article' | 'App Store search' | 'ChatGPT / AI' | 'Facebook / Instagram';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Navigation State
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState(0);

  // Sign In Credentials
  const [signInEmail, setSignInEmail] = useState('user_001@fitaix.com');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [signInError, setSignInError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register credentials state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Step 1-2 details
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(null);

  // Step 3 Height State
  const [heightUnit, setHeightUnit] = useState<'in' | 'cm'>('in');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [heightCm, setHeightCm] = useState('');

  // Step 4 Weight State
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('kg');
  const [weightVal, setWeightVal] = useState('');

  // Step 5 Birthday State
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // New Onboarding Steps State
  const [selectedExperience, setSelectedExperience] = useState<ExperienceOption | null>(null);
  const [selectedMotivation, setSelectedMotivation] = useState<MotivationOption | null>(null);
  const [selectedObstacle, setSelectedObstacle] = useState<ObstacleOption | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceOption | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Handlers
  const handleSignIn = () => {
    setSignInError('');
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError('Please enter both email and password.');
      return;
    }
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      onLogin();
    }, 1000);
  };

  const handleNextStep = () => {
    setRegisterError('');
    if (step === 0) {
      if (!regEmail.trim() || !regPassword.trim()) {
        setRegisterError('Please fill out all credentials.');
        return;
      }
      if (regPassword.length < 6) {
        setRegisterError('Password must be at least 6 characters.');
        return;
      }
    }
    if (step === 1 && !selectedGoal) {
      setRegisterError('Please select a fitness goal.');
      return;
    }
    if (step === 2 && !selectedGender) {
      setRegisterError('Please select a gender option.');
      return;
    }
    if (step === 3) {
      if (heightUnit === 'in' && (!heightFt || !heightIn)) {
        setRegisterError('Please enter your height in feet/inches.');
        return;
      }
      if (heightUnit === 'cm' && !heightCm) {
        setRegisterError('Please enter your height in cm.');
        return;
      }
    }
    if (step === 4 && !weightVal) {
      setRegisterError('Please enter your weight.');
      return;
    }
    if (step === 5 && (!birthDay || !birthMonth || !birthYear)) {
      setRegisterError('Please enter your complete birthday.');
      return;
    }
    if (step === 6 && !selectedExperience) {
      setRegisterError('Please select your training experience.');
      return;
    }
    if (step === 7 && !selectedMotivation) {
      setRegisterError('Please select what motivates you.');
      return;
    }
    if (step === 8 && !selectedObstacle) {
      setRegisterError('Please select your biggest obstacle.');
      return;
    }
    if (step === 9) {
      if (!selectedSource) {
        setRegisterError('Please select how you heard about us.');
        return;
      }
      // Finish Registration
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert('Account successfully created! Welcome to FitAIX.');
        onLogin();
      }, 1200);
      return;
    }

    setStep(step + 1);
  };

  const handleBackStep = () => {
    setRegisterError('');
    if (step === 0) {
      setIsRegistering(false);
    } else {
      setStep(step - 1);
    }
  };

  // Render Helpers
  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
          <View
            key={idx}
            style={[
              styles.progressDash,
              idx <= step ? styles.progressDashActive : styles.progressDashInactive
            ]}
          />
        ))}
      </View>
    );
  };

  if (!isRegistering) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.cardContainer}>
          <View style={styles.brandContainer}>
            <Text style={styles.logoMark}>⌁</Text>
            <Text style={styles.brandName}>FitAIX</Text>
            <Text style={styles.brandTagline}>AI Health & Performance Coach</Text>
          </View>

          <Text style={styles.sectionHeader}>Sign In</Text>

          {signInError ? <Text style={styles.errorText}>{signInError}</Text> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={signInEmail}
              onChangeText={setSignInEmail}
              placeholder="you@example.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={signInPassword}
              onChangeText={setSignInPassword}
              placeholder="••••••••"
              placeholderTextColor="#555"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleSignIn}
            disabled={isLoggingIn}
            activeOpacity={0.85}
          >
            {isLoggingIn ? (
              <ActivityIndicator size="small" color="#12110D" />
            ) : (
              <Text style={styles.actionBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.helperRow}>
            <TouchableOpacity onPress={() => alert('OTP Code has been sent to your email to verify reset.')}>
              <Text style={styles.helperLink}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsRegistering(true); setStep(0); }}>
              <Text style={styles.helperLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Multi-step Registration Wizard (10 Steps)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.onboardWrapper}>
          {/* Header row: back arrow, center hexagonal mark */}
          <View style={styles.onboardHeader}>
            <TouchableOpacity onPress={handleBackStep} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.hexagonBorder}>
              <Text style={styles.hexagonIcon}>⌁</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {renderProgressBar()}

          {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}

          {/* Wizard step views */}
          {step === 0 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>Enter a username (email) and password to get started.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username / Email</Text>
                <TextInput
                  style={styles.input}
                  value={regEmail}
                  onChangeText={setRegEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#555"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={regPassword}
                  onChangeText={setRegPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor="#555"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>What is your primary fitness goal?</Text>
              <View style={styles.optionList}>
                {(['Build muscle', 'Lose fat', 'Gain strength', 'Improve overall health', 'Improve performance', 'Something else'] as GoalOption[]).map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[styles.optionCard, selectedGoal === goal && styles.optionCardSelected]}
                    onPress={() => setSelectedGoal(goal)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, selectedGoal === goal && styles.optionTextSelected]}>{goal}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>What is your gender?</Text>
              <View style={styles.optionList}>
                {(['Male', 'Female', 'Prefer not to say'] as GenderOption[]).map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[styles.optionCard, selectedGender === gender && styles.optionCardSelected]}
                    onPress={() => setSelectedGender(gender)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, selectedGender === gender && styles.optionTextSelected]}>{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>How tall are you?</Text>
              <Text style={styles.subtitle}>We use your height to help calculate your strength metrics.</Text>

              {/* Unit Toggle */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, heightUnit === 'in' && styles.toggleBtnActive]}
                  onPress={() => setHeightUnit('in')}
                >
                  <Text style={[styles.toggleText, heightUnit === 'in' && styles.toggleTextActive]}>in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, heightUnit === 'cm' && styles.toggleBtnActive]}
                  onPress={() => setHeightUnit('cm')}
                >
                  <Text style={[styles.toggleText, heightUnit === 'cm' && styles.toggleTextActive]}>cm</Text>
                </TouchableOpacity>
              </View>

              {/* Height Inputs */}
              {heightUnit === 'in' ? (
                <View style={styles.multiInputRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.numberInput}
                      value={heightFt}
                      onChangeText={setHeightFt}
                      keyboardType="numeric"
                      maxLength={1}
                      placeholder="0"
                      placeholderTextColor="#444"
                    />
                    <Text style={styles.inputSuffix}>ft</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.numberInput}
                      value={heightIn}
                      onChangeText={setHeightIn}
                      keyboardType="numeric"
                      maxLength={2}
                      placeholder="0"
                      placeholderTextColor="#444"
                    />
                    <Text style={styles.inputSuffix}>in</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.singleInputRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.numberInput}
                      value={heightCm}
                      onChangeText={setHeightCm}
                      keyboardType="numeric"
                      maxLength={3}
                      placeholder="0"
                      placeholderTextColor="#444"
                    />
                    <Text style={styles.inputSuffix}>cm</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>What is your current weight?</Text>
              <Text style={styles.subtitle}>We use your weight to help calculate your strength metrics.</Text>

              {/* Unit Toggle */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, weightUnit === 'lbs' && styles.toggleBtnActive]}
                  onPress={() => setWeightUnit('lbs')}
                >
                  <Text style={[styles.toggleText, weightUnit === 'lbs' && styles.toggleTextActive]}>lbs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, weightUnit === 'kg' && styles.toggleBtnActive]}
                  onPress={() => setWeightUnit('kg')}
                >
                  <Text style={[styles.toggleText, weightUnit === 'kg' && styles.toggleTextActive]}>kg</Text>
                </TouchableOpacity>
              </View>

              {/* Weight Input */}
              <View style={styles.singleInputRow}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.numberInput}
                    value={weightVal}
                    onChangeText={setWeightVal}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholder="0"
                    placeholderTextColor="#444"
                  />
                  <Text style={styles.inputSuffix}>{weightUnit}</Text>
                </View>
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>When is your birthday?</Text>
              <Text style={styles.subtitle}>We use your age to help calculate your strength metrics.</Text>

              <View style={styles.birthdateRow}>
                <TextInput
                  style={[styles.birthInput, { flex: 1.2 }]}
                  value={birthDay}
                  onChangeText={setBirthDay}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="DD"
                  placeholderTextColor="#444"
                  textAlign="center"
                />
                <Text style={styles.divider}>/</Text>
                <TextInput
                  style={[styles.birthInput, { flex: 1.2 }]}
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#444"
                  textAlign="center"
                />
                <Text style={styles.divider}>/</Text>
                <TextInput
                  style={[styles.birthInput, { flex: 2 }]}
                  value={birthYear}
                  onChangeText={setBirthYear}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="YYYY"
                  placeholderTextColor="#444"
                  textAlign="center"
                />
              </View>
            </View>
          )}

          {step === 6 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>How long have you been strength training consistently?</Text>
              <View style={styles.optionList}>
                {(["I'm just getting started", 'Less than 1 year', '1-2 years', '2-5 years', 'More than 5 years'] as ExperienceOption[]).map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[styles.optionCardRow, selectedExperience === exp && styles.optionCardSelected]}
                    onPress={() => setSelectedExperience(exp)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, selectedExperience === exp && styles.optionTextSelected]}>{exp}</Text>
                    {selectedExperience === exp && (
                      <Text style={styles.checkmarkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 7 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>What helps you stay motivated to work out?</Text>
              <View style={styles.optionList}>
                {[
                  { title: 'Accountability', desc: 'Having others keep me accountable' },
                  { title: 'Competition', desc: 'Turning it into a challenge or friendly competition' },
                  { title: 'Fun', desc: 'Making it fun and part of my lifestyle' },
                  { title: 'Self-Motivated', desc: 'I stay motivated on my own but enjoy helping others' }
                ].map((mot) => (
                  <TouchableOpacity
                    key={mot.title}
                    style={[styles.optionColumnCard, selectedMotivation === mot.title && styles.optionCardSelected]}
                    onPress={() => setSelectedMotivation(mot.title as MotivationOption)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.motTitleText, selectedMotivation === mot.title && styles.optionTextSelected]}>{mot.title}</Text>
                    <Text style={styles.motDescText}>{mot.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 8 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>What do you feel is the biggest obstacle getting in the way of your progress?</Text>
              <View style={styles.optionList}>
                {(['Lack of motivation', 'Not sure what to do to get results', 'Not enough time to work out', 'Dealing with an injury', 'Something else', 'None right now'] as ObstacleOption[]).map((obs) => (
                  <TouchableOpacity
                    key={obs}
                    style={[styles.optionCard, selectedObstacle === obs && styles.optionCardSelected]}
                    onPress={() => setSelectedObstacle(obs)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, selectedObstacle === obs && styles.optionTextSelected]}>{obs}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 9 && (
            <View style={styles.stepBlock}>
              <Text style={styles.title}>How did you hear about us?</Text>
              <View style={styles.optionList}>
                {(['Friends or family', 'Reddit', 'Google search', 'Online article', 'App Store search', 'ChatGPT / AI', 'Facebook / Instagram'] as SourceOption[]).map((src) => (
                  <TouchableOpacity
                    key={src}
                    style={[styles.optionCard, selectedSource === src && styles.optionCardSelected]}
                    onPress={() => setSelectedSource(src)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, selectedSource === src && styles.optionTextSelected]}>{src}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Next Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleNextStep}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#12110D" />
            ) : (
              <Text style={styles.actionBtnText}>{step === 9 ? 'Create Account' : 'Next'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A09',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#161512',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  onboardWrapper: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#161512',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 10,
  },
  onboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hexagonBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F0E0D',
    borderWidth: 1.5,
    borderColor: '#FFD60A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonIcon: {
    color: '#FFD60A',
    fontSize: 22,
    fontWeight: '300',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 6,
    marginBottom: 32,
  },
  progressDash: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  progressDashActive: {
    backgroundColor: '#FFD60A',
  },
  progressDashInactive: {
    backgroundColor: 'rgba(255, 214, 10, 0.15)',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMark: {
    fontSize: 48,
    color: '#FFD60A',
    fontWeight: '300',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 11,
    color: '#A6A090',
    marginTop: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#A6A090',
    lineHeight: 18,
    marginBottom: 24,
  },
  stepBlock: {
    width: '100%',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
    gap: 8,
  },
  inputLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#0F0E0D',
    borderColor: '#2D2C28',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#FFF',
    fontSize: 13,
  },
  optionList: {
    gap: 10,
  },
  optionCard: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#0F0E0D',
    borderColor: '#2D2C28',
    borderWidth: 1,
    borderRadius: 14,
  },
  optionCardRow: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#0F0E0D',
    borderColor: '#2D2C28',
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionColumnCard: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#0F0E0D',
    borderColor: '#2D2C28',
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'column',
    gap: 4,
  },
  optionCardSelected: {
    borderColor: '#FFD60A',
    backgroundColor: 'rgba(255, 214, 10, 0.04)',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A6A090',
  },
  optionTextSelected: {
    color: '#FFF',
  },
  checkmarkIcon: {
    color: '#FFD60A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  motTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#A6A090',
  },
  motDescText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0F0E0D',
    borderRadius: 10,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 28,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 0.5,
  },
  toggleText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFD60A',
  },
  multiInputRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  singleInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0E0D',
    borderColor: '#2D2C28',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    width: 120,
    height: 48,
  },
  numberInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 0,
  },
  inputSuffix: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  birthdateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  birthInput: {
    height: 48,
    backgroundColor: '#0F0E0D',
    borderColor: '#2D2C28',
    borderWidth: 1,
    borderRadius: 14,
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    color: '#333',
    fontSize: 20,
  },
  actionBtn: {
    backgroundColor: '#FFD60A',
    width: '100%',
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD60A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  actionBtnText: {
    color: '#12110D',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 11,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  helperLink: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '600',
  },
});
