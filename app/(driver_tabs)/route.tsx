import { useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { StatusCard } from '../../components/common/StatusCards';
import { getTodayDate, useDriverAttendance, useServerDate, useUpsertAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import {
  useDriverLocation,
  useSmartDriverLocationPolling,
  useUpdateDriverLocation,
} from '../../hooks/useLocationTracking';
import { useStudentProfiles } from '../../hooks/useProfiles';
import { useDriverSubscriptions } from '../../hooks/useSubscriptions';
import { useUsersByIds } from '../../hooks/useUsers';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';
import { translateDriverAttendanceStatus } from '../../utils/translations';
import type { Subscription } from '../../types/models';

export default function RouteScreen() {
  const { user } = useAuth();
  const serverDate = useServerDate();
  const today = serverDate.data ?? getTodayDate();
  const subscriptions = useDriverSubscriptions(user?.id);
  const activeSubscriptions = subscriptions.data?.filter((subscription) => subscription.status === 'active') ?? [];
  const studentIds = activeSubscriptions.map((subscription) => subscription.student_id);
  const students = useUsersByIds(studentIds);
  const profiles = useStudentProfiles(studentIds);
  const attendance = useDriverAttendance(user?.id, today);
  const upsertAttendance = useUpsertAttendance();
  const updateDriverLocation = useUpdateDriverLocation();
  const driverLocation = useDriverLocation(user?.id);

  const visibleSubscriptions = activeSubscriptions.filter((subscription) => {
    const status = attendance.data?.find((item) => item.student_id === subscription.student_id)?.status;
    return status !== 'absent';
  });

  const firstProfile = profiles.data?.[0];
  const pickupPoints = useMemo(
    () =>
      visibleSubscriptions
        .map((subscription) => profiles.data?.find((profile) => profile.user_id === subscription.student_id))
        .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile))
        .map((profile) => ({ lat: profile.pickup_lat, lng: profile.pickup_lng })),
    [profiles.data, visibleSubscriptions],
  );
  const smartPolling = useSmartDriverLocationPolling(user?.id, pickupPoints, pickupPoints.length > 0);

  const updateLocation = async () => {
    if (!user?.id) return;

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
        <View style={styles.trackingInfo}>
          <View style={styles.trackingRow}>
            <View style={styles.trackingDot}>
              <Ionicons
                name={smartPolling.isPolling ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={smartPolling.isPolling ? colors.success : colors.textMuted}
              />
            </View>
            <Text style={styles.trackingText}>
              التتبع الذكي: {smartPolling.isPolling ? 'يعمل' : 'ينتظر وجود طلاب فعّالين'}
            </Text>
          </View>
          <View style={styles.trackingRow}>
            <View style={styles.trackingDot}>
              <Ionicons name="navigate-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.trackingText}>
              أقرب طالب: {formatDistance(smartPolling.nearestDistanceMeters)}
            </Text>
          </View>
          <View style={styles.trackingRow}>
            <View style={styles.trackingDot}>
              <Ionicons name="timer-outline" size={16} color={colors.warning} />
            </View>
            <Text style={styles.trackingText}>
              الوتيرة القادمة: {formatInterval(smartPolling.nextIntervalMs)}
            </Text>
          </View>
          {smartPolling.lastError ? (
            <Text style={styles.errorText}>{smartPolling.lastError}</Text>
          ) : null}
        </View>
        <AppButton
          title="تحديث موقعي الآن"
          onPress={updateLocation}
          loading={updateDriverLocation.isPending}
          accessibilityHint="اضغط لتحديث موقعك على الخريطة فوراً"
        />
      </Section>

      {profiles.isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} accessibilityLabel="جاري تحميل الخريطة" />
      ) : firstProfile ? (
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
              if (!profile) return null;

              return (
                <Marker
                  key={subscription.student_id}
                  coordinate={{ latitude: profile.pickup_lat, longitude: profile.pickup_lng }}
                  title={getStudentName(subscription.student_id)}
                  description={profile.pickup_address ?? 'نقطة صعود الطالب'}
                />
              );
            })}
            {driverLocation.data ? (
              <Marker
                coordinate={{ latitude: driverLocation.data.lat, longitude: driverLocation.data.lng }}
                title="موقعك الحالي"
                pinColor={colors.primary}
              />
            ) : null}
          </MapView>
        </View>
      ) : null}

      <Section title="مسار اليوم">
        {subscriptions.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ padding: 20 }} accessibilityLabel="جاري تحميل المسار" />
        ) : visibleSubscriptions.length > 0 ? (
          <View style={styles.studentList}>
            {visibleSubscriptions.map((subscription) => {
              const profile = getProfile(subscription.student_id);
              const status = attendance.data?.find((item) => item.student_id === subscription.student_id)?.status;

              return (
                <View key={subscription.id} style={styles.studentCard}>
                  <View style={styles.studentHeader}>
                    <View style={styles.studentAvatar}>
                      <Ionicons name="person-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.studentTexts}>
                      <Text style={styles.studentName}>{getStudentName(subscription.student_id)}</Text>
                      <Text style={styles.studentAddress}>{profile?.pickup_address ?? 'لا يوجد وصف لنقطة الصعود'}</Text>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <StatusCard
                      title={translateDriverAttendanceStatus(status ?? 'pending')}
                      variant={status === 'completed' ? 'success' : status === 'in_transit' ? 'info' : status === 'driver_waiting' ? 'warning' : 'muted'}
                    />
                  </View>

                  <View style={styles.studentActions}>
                    <View style={styles.actionFlex}>
                      <AppButton title="وصلت" onPress={() => updateStudentStatus(subscription, 'driver_waiting')} variant="secondary" size="small" accessibilityHint={`تحديد أنك وصلت لنقطة صعود ${getStudentName(subscription.student_id)}`} />
                    </View>
                    <View style={styles.actionFlex}>
                      <AppButton title="صعد" onPress={() => updateStudentStatus(subscription, 'in_transit')} size="small" accessibilityHint={`تحديد أن الطالب ${getStudentName(subscription.student_id)} صعد الحافلة`} />
                    </View>
                  </View>
                  <AppButton title="اكتملت الرحلة" onPress={() => updateStudentStatus(subscription, 'completed')} variant="ghost" size="small" accessibilityHint="إنهاء الرحلة لهذا الطالب" />
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState title="لا يوجد طلاب في مسار اليوم" message="الطلاب الغائبون أو غير المشتركين لا يظهرون ضمن المسار." icon="map-outline" />
        )}
      </Section>
    </Screen>
  );
}

function formatDistance(distanceMeters: number | null): string {
  if (distanceMeters === null) return 'غير محسوب';
  if (distanceMeters >= 1000) return `${(distanceMeters / 1000).toFixed(1)} كم`;
  return `${Math.round(distanceMeters)} متر`;
}

function formatInterval(intervalMs: number | null): string {
  if (intervalMs === null) return 'غير محددة';
  return `${Math.round(intervalMs / 60000)} دقيقة`;
}

const styles = StyleSheet.create({
  mapShell: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    height: 260,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  trackingInfo: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  trackingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trackingDot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingText: {
    color: colors.text,
    fontSize: fontSize.sm,
    writingDirection: 'rtl',
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.xs,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  studentList: {
    gap: spacing.md,
  },
  studentCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  studentHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentTexts: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  studentAddress: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    writingDirection: 'rtl',
  },
  statusRow: {
    marginVertical: spacing.xs,
  },
  studentActions: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  actionFlex: {
    flex: 1,
  },
});
