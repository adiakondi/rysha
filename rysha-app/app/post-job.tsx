// app/post-job.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import ModalSelector from 'react-native-modal-selector';

export default function PostJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<'landlord' | 'contractor' | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [timeNeeded, setTimeNeeded] = useState('');

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.replace('/');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setRole(data?.role || null);
    } catch (err) {
      console.error('Role check failed:', err);
      Alert.alert('Error', 'Could not verify your role');
      router.back();
    } finally {
      setLoading(false);
    }
  };

const handlePostJob = async () => {
  if (role !== 'landlord') {
    Alert.alert('Access Denied', 'Only landlords can post jobs');
    return;
  }

  if (!title.trim()) {
    Alert.alert('Error', 'Job title is required');
    return;
  }

  setSaving(true);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('No user session');

    const landlordId = session.user.id;

    // Step 1: Create the job
    const { data: newJob, error: insertError } = await supabase
      .from('jobs')
      .insert({
        user_id: landlordId,
        title: title.trim(),
        category: category || null,
        description: description.trim() || null,
        location: location.trim() || null,
        date_needed: dateNeeded || null,
        time_needed: timeNeeded || null,
        status: 'open',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Step 2: Find first available contractor
    const { data: availableContractor, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'contractor')
      .eq('is_available', true)
      .limit(1)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.warn('No available contractor found or error:', findError);
      // Job stays open if no contractor available
    } else if (availableContractor) {
      // Assign to contractor
      const { error: assignError } = await supabase
        .from('jobs')
        .update({
          assigned_to: availableContractor.id,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
        })
        .eq('id', newJob.id);

      if (assignError) throw assignError;

      Alert.alert(
        'Success',
        `Job posted and auto-assigned to a contractor!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert(
        'Success',
        'Job posted! No available contractors right now — it will be visible to all contractors.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  } catch (err: any) {
    console.error('Post job error:', err);
    Alert.alert('Error', err.message || 'Could not post job');
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

  if (role !== 'landlord') {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          This section is for landlords only.
        </Text>
        <Text style={styles.subMessage}>
          Contractors can view available jobs soon.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Post a Job</Text>

      <Text style={styles.label}>Job Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Fix leaking faucet"
      />

      <Text style={styles.label}>Job Category</Text>
      <ModalSelector
        data={[
          { key: '', label: 'Select category' },
          { key: 'plumbing', label: 'Plumbing' },
          { key: 'electrical', label: 'Electrical' },
          { key: 'painting', label: 'Painting' },
          { key: 'carpentry', label: 'Carpentry' },
          { key: 'general', label: 'General Handyman' },
          { key: 'hvac', label: 'HVAC' },
          { key: 'other', label: 'Other' },
        ]}
        initValue="Select category"
        onChange={(option) => setCategory(option.key)}
        style={styles.modalSelector}
        selectTextStyle={styles.selectText}
        optionContainerStyle={styles.optionContainer}
        optionTextStyle={styles.optionText}
        cancelText="Cancel"
        cancelContainerStyle={styles.cancelButton}
      >
        <View style={styles.inputWrapper}>
          <Text style={[
            styles.selectedText,
            !category && styles.placeholderText
          ]}>
            {category 
              ? category.charAt(0).toUpperCase() + category.slice(1) 
              : 'Select category'}
          </Text>
        </View>
      </ModalSelector>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Details about the job..."
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. 123 Main St, Miami, FL"
      />

      <Text style={styles.label}>Date Needed</Text>
      <TextInput
        style={styles.input}
        value={dateNeeded}
        onChangeText={setDateNeeded}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Time Needed (optional)</Text>
      <TextInput
        style={styles.input}
        value={timeNeeded}
        onChangeText={setTimeNeeded}
        placeholder="e.g. 2:00 PM"
      />

      <TouchableOpacity
        style={[styles.postButton, saving && styles.buttonDisabled]}
        onPress={handlePostJob}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Posting...' : 'Post Job'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
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
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 40,
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#64748b',
    marginBottom: 48,
  },
  message: {
    fontSize: 24,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#ea580c',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
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
    marginBottom: 40,
  },
  backText: {
    color: '#64748b',
    fontSize: 16,
  },

  // ModalSelector styles
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: '#0f172a',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  modalSelector: {
    width: '100%',
  },
  selectText: {
    color: '#94a3b8', // placeholder color
  },
  optionContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionText: {
    color: '#0f172a',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
});