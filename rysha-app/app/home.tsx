// app/home.tsx
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          router.replace('/');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
          throw error;
        }

        setDisplayName(data?.display_name || null);
      } catch (err: any) {
        console.error('Failed to load display name:', err);
        Alert.alert('Error', 'Could not load your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const goToProfile = () => {
    router.push('/profile');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" />
      ) : (
        <>
          <Text style={styles.greeting}>
            Hi{ displayName ? `, ${displayName}` : '' }!
          </Text>
          <Text style={styles.subtitle}>
            {displayName ? 'Welcome to rysha' : 'Welcome to rysha'}
          </Text>

          {/* Dashboard card */}
          <View style={styles.dashboardCard}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Text style={styles.cardText}>
              • Post a new job (coming soon){'\n'}
              • Browse open jobs (coming soon){'\n'}
              • Update your profile
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/post-job')}
          >
            <Text style={styles.actionButtonText}>Post a Job</Text>
          </TouchableOpacity>

          {/* Button to profile (where logout lives) */}
          <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
            <Text style={styles.profileButtonText}>My Profile</Text>
          </TouchableOpacity>
        </>
      )}
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
  greeting: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 80,
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
  profileButton: {
    backgroundColor: '#371fea',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  profileButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
},
actionButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: '600',
},
});