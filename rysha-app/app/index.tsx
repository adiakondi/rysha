// app/index.tsx (this is now the login screen)
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home');
      }
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message);
    } else {
      router.replace('/home');
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => setIsSignUp(false) }
      ]);
    }
  };

  // If already logged in → redirect to home
  // But since we have no global session check yet, we'll add it later
  return (
    <View style={styles.container}>
      <Text style={styles.title}>rysha</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={isSignUp ? handleSignUp : handleLogin} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 42, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 14, marginBottom: 16 },
  button: { backgroundColor: '#ea580c', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  toggleButton: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#ea580c', fontSize: 14, fontWeight: '500' },
});