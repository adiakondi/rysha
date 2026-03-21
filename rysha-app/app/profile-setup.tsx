// app/profile-setup.tsx
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

export default function ProfileSetup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'landlord' | 'contractor' | null>(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
      } else {
        // Shouldn't happen, but safety redirect
        router.replace('/');
      }
    });
  }, []);

  const handleSave = async () => {
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

      Alert.alert('Welcome!', 'Profile setup complete.', [
        { text: 'Continue', onPress: () => router.replace('/home') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Just a few quick details to get started</Text>

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="How others will see you"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Your Role</Text>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'landlord' && styles.roleActive,
          ]}
          onPress={() => setRole('landlord')}
        >
          <Text style={[
            styles.roleText,
            role === 'landlord' && styles.roleTextActive,
          ]}>
            Landlord / Property Owner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'contractor' && styles.roleActive,
          ]}
          onPress={() => setRole('contractor')}
        >
          <Text style={[
            styles.roleText,
            role === 'contractor' && styles.roleTextActive,
          ]}>
            Contractor / Handyman
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Saving...' : 'Finish Setup'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 32,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 48,
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
    marginBottom: 32,
  },
  roleButtons: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 48,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  roleActive: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7f0',
  },
  roleText: {
    fontSize: 18,
    color: '#0f172a',
  },
  roleTextActive: {
    color: '#ea580c',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#ea580c',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});