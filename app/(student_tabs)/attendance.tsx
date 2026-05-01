import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { getTodayDate, useStudentAttendance, useUpsertAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { useDriverLocation } from '../../hooks/useLocationTracking';
import { useStudentProfile } from '../../hooks/useProfiles';
import { useStudentSubscriptions } from '../../hooks/useSubscriptions';
import { colors } from '../../lib/theme';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const today = getTodayDate();
  const subscriptions = useStudentSubscriptions(user?.id);
  const activeSubscription = subscriptions.data?.find((subscription) => subscription.status === 'active');
  const profile = useStudentProfile(user?.id);
  const driverLocation = useDriverLocation(activeSubscription?.driver_id);
  const attendance = useStudentAttendance(user?.id, today);
  const upsertAttendance = useUpsertAttendance();

  const updateTodayStatus = async (status: 'absent' | 'present') => {
    if (!user?.id || !activeSubscription) {
      Alert.alert('لا يوجد اشتراك فعّال', 'لا يمكن تسجيل الغياب قبل تفعيل الاشتراك');
      return;
    }

    try {
      await upsertAttendance.mutateAsync({
        date: today,
        driver_id: activeSubscription.driver_id,
        institution_id: activeSubscription.institution_id,
        status,
        student_id: user.id,
      });
      Alert.alert(
        status === 'absent' ? 'تم تسجيل الغياب' : 'تم تسجيل الحضور',
        status === 'absent' ? 'لن تظهر ضمن مسار السائق لهذا اليوم' : 'ستظهر ضمن مسار السائق لهذا اليوم',
      );
    } catch (error) {
      Alert.alert('تعذر تحديث الحضور', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const hasMap = Boolean(profile.data && driverLocation.data);

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
          onPress={() => updateTodayStatus('absent')}
          loading={upsertAttendance.isPending}
          disabled={!activeSubscription}
          variant="danger"
        />
        <AppButton
          title="أنا حاضر اليوم"
          onPress={() => updateTodayStatus('present')}
          loading={upsertAttendance.isPending}
          disabled={!activeSubscription}
          variant="secondary"
        />
      </Section>

      <Section title="موقع السائق">
        {hasMap && profile.data && driverLocation.data ? (
          <>
            <View style={styles.mapShell}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: profile.data.pickup_lat,
                  longitude: profile.data.pickup_lng,
                  latitudeDelta: 0.04,
                  longitudeDelta: 0.04,
                }}
              >
                <Marker
                  coordinate={{ latitude: profile.data.pickup_lat, longitude: profile.data.pickup_lng }}
                  title="نقطة صعودك"
                  description={profile.data.pickup_address ?? 'موقعك المسجل'}
                />
                <Marker
                  coordinate={{ latitude: driverLocation.data.lat, longitude: driverLocation.data.lng }}
                  title="موقع السائق"
                  description={driverLocation.data.last_updated ?? 'آخر موقع محفوظ'}
                  pinColor={colors.primary}
                />
              </MapView>
            </View>
            <Text style={styles.mapCaption}>
              آخر تحديث للسائق: {driverLocation.data.last_updated ?? 'غير محدد'}
            </Text>
          </>
        ) : (
          <EmptyState
            title="موقع السائق غير متاح"
            message="سيظهر موقع السائق هنا بعد تفعيل الاشتراك وبدء السائق في إرسال موقعه."
          />
        )}
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
  mapShell: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 260,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapCaption: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
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
