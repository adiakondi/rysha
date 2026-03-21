// app/home.tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              router.replace('/'); // back to login
            } catch (err: any) {
              Alert.alert('Logout failed', err.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to rysha</Text>
      <Text style={styles.subtitle}>You're logged in</Text>

      {/* Placeholder for future dashboard content */}
      <View style={styles.dashboardCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <Text style={styles.cardText}>
          • Post a new job (coming soon){'\n'}
          • Browse open jobs (coming soon){'\n'}
          • Your profile
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 60,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#64748b',
    marginBottom: 48,
  },
  dashboardCard: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  logoutButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 40,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});