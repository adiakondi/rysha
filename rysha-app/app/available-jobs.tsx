// app/available-jobs.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function AvailableJobs() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, []);

const initialize = async () => {
  try {
    console.log('[DEBUG] Starting initialize...');

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[DEBUG] getSession result:', { sessionExists: !!session, error: sessionError });

    if (sessionError || !session?.user?.id) {
      console.warn('[DEBUG] No valid session or user ID — redirecting to login');
      router.replace('/');
      return;
    }

    const uid = session.user.id;
    console.log('[DEBUG] Valid user ID loaded:', uid);

    // Load profile using uid directly
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_available, rate_min, rate_max')
      .eq('id', uid)
      .single();

    console.log('[DEBUG] Profile fetch:', { profile, profileError });

    if (profile) {
      setIsAvailable(profile.is_available || false);
      setMinRate(profile.rate_min?.toString() || '');
      setMaxRate(profile.rate_max?.toString() || '');
    }

    // Pass uid to loadOpenJobs
    await loadOpenJobs(uid);
  } catch (err) {
    console.error('[DEBUG] Initialize crash:', err);
    Alert.alert('Error', 'Failed to load data');
  } finally {
    setLoading(false);
  }
};

const loadOpenJobs = async (uid: string) => {
  try {
    console.log('[DEBUG] Loading jobs with exclusion for userId:', uid);

    const query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (uid) {
      query.neq('user_id', uid);
    } else {
      console.warn('[DEBUG] uid is empty — loading all open jobs');
    }

    const { data, error, count } = await query;

    console.log('[DEBUG] Jobs query result:', { count, dataLength: data?.length, error });

    if (error) throw error;

    setJobs(data || []);
  } catch (err: any) {
    console.error('[DEBUG] Jobs query crash:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
    Alert.alert('Error', `Failed to load jobs: ${err.message || 'Unknown'}`);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOpenJobs(userId || '');
    setRefreshing(false);
  };

  const toggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    try {
      await supabase
        .from('profiles')
        .update({ is_available: value })
        .eq('id', userId);
    } catch (err) {
      Alert.alert('Error', 'Could not update availability');
      setIsAvailable(!value);
    }
  };

  const saveRates = async () => {
    const min = parseFloat(minRate);
    const max = parseFloat(maxRate);

    if (isNaN(min) || isNaN(max) || min > max) {
      Alert.alert('Invalid rates', 'Please enter valid min/max numbers');
      return;
    }

    try {
      await supabase
        .from('profiles')
        .update({ rate_min: min, rate_max: max })
        .eq('id', userId);
      Alert.alert('Success', 'Rates updated');
    } catch (err) {
      Alert.alert('Error', 'Could not save rates');
    }
  };

  const acceptJob = async (jobId: number) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          assigned_to: userId,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
        })
        .eq('id', jobId)
        .eq('status', 'open');

      if (error) throw error;

      Alert.alert('Success', 'You have accepted the job!');
      await loadOpenJobs(userId || ''); // refresh list
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not accept job');
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Back to Home */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Available Jobs</Text>

      {/* Availability & Rates */}
      <View style={styles.settingsCard}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>I'm available for new jobs</Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#767577', true: '#ea580c' }}
            thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.label}>Your Hourly Rate Range ($)</Text>
        <View style={styles.rateRow}>
          <TextInput
            style={styles.rateInput}
            placeholder="Min"
            value={minRate}
            onChangeText={setMinRate}
            keyboardType="numeric"
          />
          <Text style={styles.rateDash}>–</Text>
          <TextInput
            style={styles.rateInput}
            placeholder="Max"
            value={maxRate}
            onChangeText={setMaxRate}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveRates}>
          <Text style={styles.buttonText}>Save Rates</Text>
        </TouchableOpacity>
      </View>

      {/* Job List */}
      {jobs.length === 0 ? (
        <Text style={styles.noJobs}>No open jobs right now</Text>
      ) : (
        jobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {job.category && (
              <Text style={styles.jobCategory}>
                Category: {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
              </Text>
            )}
            <Text style={styles.jobDesc}>
              {job.description || 'No description provided'}
            </Text>
            <Text style={styles.jobMeta}>
              Location: {job.location || 'Not specified'} •{' '}
              Date: {job.date_needed || 'Flexible'}
            </Text>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => acceptJob(job.id)}
            >
              <Text style={styles.acceptText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#371fea',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
  },
  settingsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 18,
    color: '#0f172a',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  rateDash: {
    marginHorizontal: 12,
    fontSize: 20,
    color: '#64748b',
  },
  saveButton: {
    backgroundColor: '#ea580c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noJobs: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  jobCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  jobCategory: {
    fontSize: 14,
    color: '#ea580c',
    marginBottom: 4,
  },
  jobDesc: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 12,
  },
  jobMeta: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  acceptButton: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
});