// app/profile.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'landlord' | 'contractor' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.replace('/');
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (data) {
        setDisplayName(data.display_name || '');
        setRole(data.role);
      }
    } catch (err: any) {
      console.error('Profile load error:', err);
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!userId) return;

    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }
    if (!role) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: displayName.trim(),
          role,
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="How others see you"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Your Role</Text>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'landlord' && styles.roleButtonActive,
          ]}
          onPress={() => setRole('landlord')}
        >
          <Text style={[
            styles.roleButtonText,
            role === 'landlord' && styles.roleButtonTextActive,
          ]}>
            Landlord / Property Owner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'contractor' && styles.roleButtonActive,
          ]}
          onPress={() => setRole('contractor')}
        >
          <Text style={[
            styles.roleButtonText,
            role === 'contractor' && styles.roleButtonTextActive,
          ]}>
            Contractor / Handyman
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={saveProfile}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
            Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                    Alert.alert('Error', error.message);
                    } else {
                    router.replace('/');
                    }
                },
                },
            ]
            );
        }}
        >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
        
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 40,
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 24,
  },
  roleButtons: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  roleButtonActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7f0',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#0f172a',
  },
  roleButtonTextActive: {
    color: '#ea580c',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#371fea',
    padding: 18,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backText: {
    color: '#64748b',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ea580c', 
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
},
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
},
});