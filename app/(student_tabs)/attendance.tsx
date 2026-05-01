import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { getTodayDate, useStudentAttendance, useUpsertAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { useStudentSubscriptions } from '../../hooks/useSubscriptions';
import { colors } from '../../lib/theme';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const today = getTodayDate();
  const subscriptions = useStudentSubscriptions(user?.id);
  const activeSubscription = subscriptions.data?.find((subscription) => subscription.status === 'active');
  const attendance = useStudentAttendance(user?.id, today);
  const upsertAttendance = useUpsertAttendance();

  const markAbsent = async () => {
    if (!user?.id || !activeSubscription) {
      Alert.alert('لا يوجد اشتراك فعّال', 'لا يمكن تسجيل الغياب قبل تفعيل الاشتراك');
      return;
    }

    try {
      await upsertAttendance.mutateAsync({
        date: today,
        driver_id: activeSubscription.driver_id,
        institution_id: activeSubscription.institution_id,
        status: 'absent',
        student_id: user.id,
      });
      Alert.alert('تم تسجيل الغياب', 'لن تظهر ضمن مسار السائق لهذا اليوم');
    } catch (error) {
      Alert.alert('تعذر تسجيل الغياب', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  return (
    <Screen>
      <Section title="حضور اليوم" subtitle={`تاريخ اليوم: ${today}`}>
        {attendance.data ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>{translateAttendance(attendance.data.status)}</Text>
            <Text style={styles.statusText}>آخر تحديث محفوظ لهذا اليوم.</Text>
          </View>
        ) : (
          <EmptyState title="لم تسجل حالة اليوم بعد" message="إذا لن تذهب اليوم، سجّل الغياب مبكراً حتى لا ينتظرك السائق." />
        )}

        <AppButton
          title="أنا غائب اليوم"
          onPress={markAbsent}
          loading={upsertAttendance.isPending}
          disabled={!activeSubscription}
          variant="danger"
        />
      </Section>
    </Screen>
  );
}

function translateAttendance(status: string): string {
  if (status === 'absent') return 'غائب اليوم';
  if (status === 'driver_waiting') return 'السائق بانتظارك';
  if (status === 'in_transit') return 'تم الصعود';
  if (status === 'completed') return 'اكتملت الرحلة';
  if (status === 'present') return 'حاضر';
  return 'بانتظار التحديث';
}

const styles = StyleSheet.create({
  statusBox: {
    backgroundColor: '#FFF7E6',
    borderRadius: 8,
    gap: 4,
    padding: 14,
  },
  statusTitle: {
    color: colors.warning,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
