import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('user_001@fitaix.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Mock authentication delay (1 second) to feel premium
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.cardContainer}>
        {/* Brand Identity */}
        <View style={styles.brandContainer}>
          <Text style={styles.logoMark}>⌁</Text>
          <Text style={styles.brandName}>FitAIX</Text>
          <Text style={styles.brandTagline}>AI Health & Performance Coach</Text>
        </View>

        <Text style={styles.sectionHeader}>Sign In</Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
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
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#555"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={handleSignIn}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#12110D" />
          ) : (
            <Text style={styles.signInBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Helpers */}
        <View style={styles.helperRow}>
          <TouchableOpacity onPress={() => alert('OTP Code has been sent to your email to verify reset.')}>
            <Text style={styles.helperLink}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => alert('Registration is pre-configured for user_001. Simply sign in!')}>
            <Text style={styles.helperLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A09',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#161512',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
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
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#FFF',
    fontSize: 13,
  },
  signInBtn: {
    backgroundColor: '#FFD60A',
    width: '100%',
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FFD60A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  signInBtnText: {
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
