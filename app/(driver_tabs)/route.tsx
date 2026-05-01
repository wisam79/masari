import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { getTodayDate, useDriverAttendance, useUpsertAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateDriverLocation } from '../../hooks/useLocationTracking';
import { useStudentProfiles } from '../../hooks/useProfiles';
import { useDriverSubscriptions } from '../../hooks/useSubscriptions';
import { useUsersByIds } from '../../hooks/useUsers';
import { colors } from '../../lib/theme';
import type { Subscription } from '../../types/models';

export default function RouteScreen() {
  const { user } = useAuth();
  const today = getTodayDate();
  const subscriptions = useDriverSubscriptions(user?.id);
  const activeSubscriptions = subscriptions.data?.filter((subscription) => subscription.status === 'active') ?? [];
  const studentIds = activeSubscriptions.map((subscription) => subscription.student_id);
  const students = useUsersByIds(studentIds);
  const profiles = useStudentProfiles(studentIds);
  const attendance = useDriverAttendance(user?.id, today);
  const upsertAttendance = useUpsertAttendance();
  const updateDriverLocation = useUpdateDriverLocation();

  const visibleSubscriptions = activeSubscriptions.filter((subscription) => {
    const status = attendance.data?.find((item) => item.student_id === subscription.student_id)?.status;
    return status !== 'absent';
  });

  const firstProfile = profiles.data?.[0];

  const updateLocation = async () => {
    if (!user?.id) {
      return;
    }

    try {
      await updateDriverLocation.mutateAsync(user.id);
      Alert.alert('تم التحديث', 'تم حفظ موقعك الحالي للطلاب المرتبطين بك');
    } catch (error) {
      Alert.alert('تعذر تحديث الموقع', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const updateStudentStatus = async (subscription: Subscription, status: 'driver_waiting' | 'in_transit' | 'completed') => {
    try {
      await upsertAttendance.mutateAsync({
        date: today,
        driver_id: subscription.driver_id,
        institution_id: subscription.institution_id,
        status,
        student_id: subscription.student_id,
      });
    } catch (error) {
      Alert.alert('تعذر تحديث الحالة', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const getStudentName = (studentId: string): string => {
    const student = students.data?.find((item) => item.id === studentId);
    return student?.full_name || student?.phone || 'طالب مساري';
  };

  const getProfile = (studentId: string) => profiles.data?.find((profile) => profile.user_id === studentId);

  return (
    <Screen>
      <Section title="موقع السائق" subtitle="حدّث موقعك قبل الانطلاق أو أثناء الرحلة ليظهر للطلاب المرتبطين بك.">
        <AppButton
          title="تحديث موقعي الآن"
          onPress={updateLocation}
          loading={updateDriverLocation.isPending}
        />
      </Section>

      {firstProfile ? (
        <View style={styles.mapShell}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: firstProfile.pickup_lat,
              longitude: firstProfile.pickup_lng,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
            }}
          >
            {visibleSubscriptions.map((subscription) => {
              const profile = getProfile(subscription.student_id);
              if (!profile) {
                return null;
              }

              return (
                <Marker
                  key={subscription.student_id}
                  coordinate={{ latitude: profile.pickup_lat, longitude: profile.pickup_lng }}
                  title={getStudentName(subscription.student_id)}
                  description={profile.pickup_address ?? 'نقطة صعود الطالب'}
                />
              );
            })}
          </MapView>
        </View>
      ) : null}

      <Section title="مسار اليوم">
        {visibleSubscriptions.length > 0 ? (
          visibleSubscriptions.map((subscription) => {
            const profile = getProfile(subscription.student_id);
            const status = attendance.data?.find((item) => item.student_id === subscription.student_id)?.status;

            return (
              <View key={subscription.id} style={styles.item}>
                <Text style={styles.itemTitle}>{getStudentName(subscription.student_id)}</Text>
                <Text style={styles.itemText}>{profile?.pickup_address ?? 'لا يوجد وصف لنقطة الصعود'}</Text>
                <Text style={styles.itemText}>الحالة: {translateAttendance(status ?? 'pending')}</Text>
                <View style={styles.actions}>
                  <View style={styles.action}>
                    <AppButton title="وصلت" onPress={() => updateStudentStatus(subscription, 'driver_waiting')} variant="secondary" />
                  </View>
                  <View style={styles.action}>
                    <AppButton title="صعد" onPress={() => updateStudentStatus(subscription, 'in_transit')} />
                  </View>
                </View>
                <AppButton title="اكتملت الرحلة" onPress={() => updateStudentStatus(subscription, 'completed')} variant="ghost" />
              </View>
            );
          })
        ) : (
          <EmptyState title="لا يوجد طلاب في مسار اليوم" message="الطلاب الغائبون أو غير المشتركين لا يظهرون ضمن المسار." />
        )}
      </Section>
    </Screen>
  );
}

function translateAttendance(status: string): string {
  if (status === 'absent') return 'غائب';
  if (status === 'driver_waiting') return 'السائق وصل';
  if (status === 'in_transit') return 'داخل الباص';
  if (status === 'completed') return 'مكتمل';
  if (status === 'present') return 'حاضر';
  return 'بانتظار';
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
  item: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: 8,
    padding: 14,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  itemText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  action: {
    flex: 1,
  },
});
