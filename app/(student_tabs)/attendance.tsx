import { Alert, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { StatusCard } from '../../components/common/StatusCards';
import { getTodayDate, useServerDate, useStudentAttendance, useUpsertAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { useDriverLocation } from '../../hooks/useLocationTracking';
import { useStudentProfile } from '../../hooks/useProfiles';
import { useStudentSubscriptions } from '../../hooks/useSubscriptions';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';
import { translateAttendanceStatus } from '../../utils/translations';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const serverDate = useServerDate();
  const today = serverDate.data ?? getTodayDate();
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
  const isLoading = subscriptions.isLoading || profile.isLoading || attendance.isLoading;
  const isError = subscriptions.isError || profile.isError || attendance.isError;

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centerContainer} accessible accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <EmptyState title="حدث خطأ" message="تعذر تحميل بيانات الحضور. يرجى المحاولة لاحقاً." icon="alert-circle-outline" />
      </Screen>
    );
  }

  const attendanceVariant = attendance.data?.status === 'absent' ? 'danger' : attendance.data?.status === 'present' || attendance.data?.status === 'in_transit' ? 'success' : 'warning';

  return (
    <Screen>
      <Section title="حضور اليوم" subtitle={`تاريخ اليوم: ${today}`}>
        {attendance.data ? (
          <StatusCard
            title={translateAttendanceStatus(attendance.data.status)}
            subtitle="آخر تحديث محفوظ لهذا اليوم."
            variant={attendanceVariant}
          />
        ) : (
          <EmptyState title="لم تسجل حالة اليوم بعد" message="إذا لن تذهب اليوم، سجّل الغياب مبكراً حتى لا ينتظرك السائق." icon="calendar-outline" />
        )}

        <View style={styles.actionRow}>
          <View style={styles.actionFlex}>
            <AppButton
              title="أنا حاضر"
              onPress={() => updateTodayStatus('present')}
              loading={upsertAttendance.isPending}
              disabled={!activeSubscription || upsertAttendance.isPending}
              variant="secondary"
              size="small"
              accessibilityHint="يسجل حالتك كحاضر لهذا اليوم"
            />
          </View>
          <View style={styles.actionFlex}>
            <AppButton
              title="أنا غائب"
              onPress={() => updateTodayStatus('absent')}
              loading={upsertAttendance.isPending}
              disabled={!activeSubscription || upsertAttendance.isPending}
              variant="danger"
              size="small"
              accessibilityHint="يسجل حالتك كغائب لهذا اليوم"
            />
          </View>
        </View>
      </Section>

      <Section title="موقع السائق">
        {hasMap && profile.data && driverLocation.data ? (
          <>
            <View style={styles.mapShell} accessible={true} accessibilityLabel="خريطة توضح موقع السائق وموقع صعودك">
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
            <View style={styles.mapCaption}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.mapCaptionText}>
                آخر تحديث: {driverLocation.data.last_updated ?? 'غير محدد'}
              </Text>
            </View>
          </>
        ) : (
          <EmptyState
            title="موقع السائق غير متاح"
            message="سيظهر موقع السائق هنا بعد تفعيل الاشتراك وبدء السائق في إرسال موقعه."
            icon="map-outline"
          />
        )}
      </Section>
    </Screen>
  );
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
  mapCaption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  mapCaptionText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    writingDirection: 'rtl',
  },
  actionRow: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
