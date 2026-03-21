// home → dashboard after login
// app/home.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/'); // back to login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Rysha!</Text>
      <Text style={styles.subtitle}>You're logged in</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  subtitle: { fontSize: 20, color: '#64748b', marginBottom: 48 },
  button: { backgroundColor: '#ea580c', padding: 16, borderRadius: 12 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
});