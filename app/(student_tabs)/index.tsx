import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentCoordinates } from '../../hooks/useLocationTracking';
import { useInstitutions } from '../../hooks/useInstitutions';
import { useStudentProfile, useUpsertStudentProfile } from '../../hooks/useProfiles';
import { useStudentSubscriptions } from '../../hooks/useSubscriptions';
import { colors } from '../../lib/theme';
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
    if (!user?.id) {
      return;
    }

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
      if (updatedUser) {
        setUser(updatedUser);
      }

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

  const renderInstitutionOption = (institution: Institution) => (
    <Pressable
      key={institution.id}
      onPress={() => setInstitutionId(institution.id)}
      style={[
        styles.option,
        institutionId === institution.id && styles.optionSelected,
      ]}
    >
      <Text style={[styles.optionTitle, institutionId === institution.id && styles.optionTitleSelected]}>
        {institution.name}
      </Text>
      <Text style={styles.optionSubtitle}>{institution.city ?? 'بدون مدينة محددة'}</Text>
    </Pressable>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>أهلاً {user?.full_name || 'بك'}</Text>
        <Text style={styles.caption}>جهّز بياناتك مرة واحدة، وبعدها ستظهر لك السائقون المناسبون لمؤسستك.</Text>
      </View>

      <Section title="حالة الاشتراك">
        {activeSubscription ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>اشتراك فعّال</Text>
            <Text style={styles.statusText}>ينتهي في {activeSubscription.end_date ?? 'غير محدد'}</Text>
          </View>
        ) : (
          <EmptyState
            title="لا يوجد اشتراك فعّال"
            message="بعد حفظ بياناتك يمكنك طلب اشتراك من تبويب الاشتراك."
          />
        )}
      </Section>

      <Section
        title="بيانات الطالب"
        subtitle="المؤسسة ونقطة الصعود هما ما يحددان السائقين الذين يمكنك الاشتراك معهم."
      >
        <AppTextInput label="الاسم الكامل" value={fullName} onChangeText={setFullName} placeholder="مثال: علي أحمد" />

        <View style={styles.options}>
          {institutions.data?.map(renderInstitutionOption)}
        </View>

        {selectedInstitution ? (
          <Text style={styles.selectedText}>المؤسسة المختارة: {selectedInstitution.name}</Text>
        ) : null}

        <AppTextInput
          label="وصف نقطة الصعود"
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="مثال: قرب الباب الرئيسي للمنطقة"
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <AppTextInput label="خط العرض" value={pickupLat} onChangeText={setPickupLat} keyboardType="decimal-pad" />
          </View>
          <View style={styles.flex}>
            <AppTextInput label="خط الطول" value={pickupLng} onChangeText={setPickupLng} keyboardType="decimal-pad" />
          </View>
        </View>

        <AppButton
          title="استخدام موقعي الحالي"
          onPress={handleUseCurrentLocation}
          loading={currentCoordinates.isPending}
          variant="secondary"
        />
        <AppButton title="حفظ بيانات الطالب" onPress={handleSaveProfile} loading={upsertProfile.isPending} />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  greeting: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  caption: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusBox: {
    backgroundColor: '#E8F5EF',
    borderRadius: 8,
    gap: 4,
    padding: 14,
  },
  statusTitle: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusText: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  options: {
    gap: 8,
  },
  option: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  optionSelected: {
    backgroundColor: '#E3F4F2',
    borderColor: colors.primary,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 3,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectedText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
