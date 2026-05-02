import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { StatusCard } from '../../components/common/StatusCards';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentCoordinates } from '../../hooks/useLocationTracking';
import { useInstitutions } from '../../hooks/useInstitutions';
import { useStudentProfile, useUpsertStudentProfile } from '../../hooks/useProfiles';
import { useStudentSubscriptions } from '../../hooks/useSubscriptions';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';
import { userRepository } from '../../repositories/UserRepository';
import { useAuthStore } from '../../store/authStore';
import type { Institution } from '../../types/models';

export default function StudentHomeScreen() {
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const institutions = useInstitutions();
  const profile = useStudentProfile(user?.id);
  const subscriptions = useStudentSubscriptions(user?.id);
  const upsertProfile = useUpsertStudentProfile();
  const currentCoordinates = useCurrentCoordinates();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [institutionId, setInstitutionId] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLat, setPickupLat] = useState('');
  const [pickupLng, setPickupLng] = useState('');

  useEffect(() => {
    if (profile.data) {
      setInstitutionId(profile.data.institution_id);
      setPickupAddress(profile.data.pickup_address ?? '');
      setPickupLat(String(profile.data.pickup_lat));
      setPickupLng(String(profile.data.pickup_lng));
    }
  }, [profile.data]);

  const activeSubscription = useMemo(
    () => subscriptions.data?.find((subscription) => subscription.status === 'active'),
    [subscriptions.data],
  );

  const selectedInstitution = institutions.data?.find((institution) => institution.id === institutionId);

  const handleUseCurrentLocation = async () => {
    try {
      const coordinates = await currentCoordinates.mutateAsync();
      setPickupLat(String(coordinates.lat));
      setPickupLng(String(coordinates.lng));
    } catch (error) {
      Alert.alert('تعذر تحديد الموقع', error instanceof Error ? error.message : 'حاول مرة أخرى');
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    const lat = Number(pickupLat);
    const lng = Number(pickupLng);

    if (fullName.trim().length < 2) {
      Alert.alert('الاسم مطلوب', 'أدخل اسمك الكامل كما سيظهر للسائق');
      return;
    }

    if (!institutionId) {
      Alert.alert('اختر المؤسسة', 'يجب اختيار الجامعة أو المؤسسة التي تريد الوصول إليها');
      return;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      Alert.alert('موقع غير صحيح', 'حدد نقطة الصعود أو أدخل الإحداثيات بشكل صحيح');
      return;
    }

    try {
      const updatedUser = await userRepository.updateUser(user.id, { full_name: fullName.trim() });
      if (updatedUser) setUser(updatedUser);

      await upsertProfile.mutateAsync({
        user_id: user.id,
        institution_id: institutionId,
        pickup_address: pickupAddress.trim() || null,
        pickup_lat: lat,
        pickup_lng: lng,
      });

      Alert.alert('تم الحفظ', 'تم تحديث بيانات الطالب ونقطة الصعود');
    } catch (error) {
      Alert.alert('تعذر الحفظ', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const renderInstitutionOption = (institution: Institution) => {
    const isSelected = institutionId === institution.id;
    return (
      <Pressable
        key={institution.id}
        onPress={() => setInstitutionId(institution.id)}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${institution.name}, ${institution.city ?? 'بدون مدينة محددة'}`}
        style={[styles.option, isSelected && styles.optionSelected]}
      >
        <View style={styles.optionContent}>
          <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
            {isSelected && <View style={styles.optionRadioInner} />}
          </View>
          <View style={styles.optionTexts}>
            <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
              {institution.name}
            </Text>
            <Text style={styles.optionSubtitle}>{institution.city ?? 'بدون مدينة محددة'}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const isLoading = institutions.isLoading || profile.isLoading || subscriptions.isLoading;
  const isError = institutions.isError || profile.isError || subscriptions.isError;

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
        <EmptyState title="حدث خطأ" message="تعذر تحميل بيانات الصفحة الرئيسية. يرجى المحاولة لاحقاً." icon="alert-circle-outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.greetingSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={28} color={colors.primary} />
        </View>
        <View style={styles.greetingTexts}>
          <Text style={styles.greeting}>أهلاً {user?.full_name || 'بك'}</Text>
          <Text style={styles.caption}>جهّز بياناتك مرة واحدة، وبعدها ستظهر لك السائقون المناسبون لمؤسستك.</Text>
        </View>
      </View>

      <Section title="حالة الاشتراك">
        {activeSubscription ? (
          <StatusCard
            title="اشتراك فعّال"
            subtitle={`ينتهي في ${activeSubscription.end_date ?? 'غير محدد'}`}
            variant="success"
          />
        ) : (
          <EmptyState
            title="لا يوجد اشتراك فعّال"
            message="بعد حفظ بياناتك يمكنك طلب اشتراك من تبويب الاشتراك."
            icon="receipt-outline"
          />
        )}
      </Section>

      <Section
        title="بيانات الطالب"
        subtitle="المؤسسة ونقطة الصعود هما ما يحددان السائقين الذين يمكنك الاشتراك معهم."
      >
        <AppTextInput
          label="الاسم الكامل"
          value={fullName}
          onChangeText={setFullName}
          placeholder="مثال: علي أحمد"
          accessibilityLabel="أدخل الاسم الكامل"
        />

        <Text style={styles.sectionLabel}>اختر المؤسسة</Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {institutions.data?.map(renderInstitutionOption)}
        </View>

        {selectedInstitution ? (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text style={styles.selectedText}>{selectedInstitution.name}</Text>
          </View>
        ) : null}

        <AppTextInput
          label="وصف نقطة الصعود"
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="مثال: قرب الباب الرئيسي للمنطقة"
          accessibilityLabel="وصف نقطة الصعود"
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <AppTextInput
              label="خط العرض"
              value={pickupLat}
              onChangeText={setPickupLat}
              keyboardType="decimal-pad"
              accessibilityLabel="خط العرض لنقطة الصعود"
            />
          </View>
          <View style={styles.flex}>
            <AppTextInput
              label="خط الطول"
              value={pickupLng}
              onChangeText={setPickupLng}
              keyboardType="decimal-pad"
              accessibilityLabel="خط الطول لنقطة الصعود"
            />
          </View>
        </View>

        <AppButton
          title="استخدام موقعي الحالي"
          onPress={handleUseCurrentLocation}
          loading={currentCoordinates.isPending}
          variant="secondary"
          accessibilityHint="يحدث إحداثيات خط الطول والعرض لموقعك الحالي"
        />
        <AppButton
          title="حفظ بيانات الطالب"
          onPress={handleSaveProfile}
          loading={upsertProfile.isPending}
          accessibilityHint="يحفظ التغييرات على بياناتك الشخصية وموقع الصعود"
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingSection: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTexts: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  caption: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionTexts: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectedBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  selectedText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    writingDirection: 'rtl',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
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
