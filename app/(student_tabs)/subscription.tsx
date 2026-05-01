import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useAvailableDrivers } from '../../hooks/useInstitutions';
import { useStudentProfile } from '../../hooks/useProfiles';
import { useCreateSubscription, useStudentSubscriptions } from '../../hooks/useSubscriptions';
import { FINANCIAL } from '../../lib/constants';
import { colors } from '../../lib/theme';
import type { PaymentMethod } from '../../services/SubscriptionService';
import type { User } from '../../types/models';
import { formatCurrency } from '../../utils/formatters';

const paymentMethods: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'زين كاش', value: 'zaincash' },
  { label: 'FIB', value: 'fib' },
  { label: 'نقداً', value: 'cash' },
  { label: 'أخرى', value: 'other' },
];

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const profile = useStudentProfile(user?.id);
  const drivers = useAvailableDrivers(profile.data?.institution_id);
  const subscriptions = useStudentSubscriptions(user?.id);
  const createSubscription = useCreateSubscription();
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('zaincash');
  const [paymentReference, setPaymentReference] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | undefined>();

  const latestSubscription = subscriptions.data?.[0];
  const selectedDriver = useMemo(
    () => drivers.data?.find((driver) => driver.id === selectedDriverId),
    [drivers.data, selectedDriverId],
  );

  const pickReceipt = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('صلاحية الصور مطلوبة', 'اسمح للتطبيق بقراءة صورة الوصل من مكتبة الصور.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const submitSubscription = async () => {
    if (!user?.id || !profile.data) {
      Alert.alert('أكمل بياناتك', 'احفظ بيانات الطالب والمؤسسة من الصفحة الرئيسية أولاً');
      return;
    }

    if (!selectedDriverId) {
      Alert.alert('اختر السائق', 'اختر سائقاً يخدم مؤسستك');
      return;
    }

    if (paymentMethod !== 'cash' && !receiptUri) {
      Alert.alert('وصل الدفع مطلوب', 'ارفع صورة الوصل لطرق الدفع غير النقدية');
      return;
    }

    try {
      await createSubscription.mutateAsync({
        studentId: user.id,
        driverId: selectedDriverId,
        institutionId: profile.data.institution_id,
        paymentMethod,
        paymentReference,
        receiptUri,
      });

      setPaymentReference('');
      setReceiptUri(undefined);
      Alert.alert('تم إرسال الطلب', 'سيظهر الطلب للسائق للمراجعة والموافقة');
    } catch (error) {
      Alert.alert('تعذر إرسال الطلب', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const renderDriver = (driver: User) => (
    <Pressable
      key={driver.id}
      onPress={() => setSelectedDriverId(driver.id)}
      style={[styles.option, selectedDriverId === driver.id && styles.optionSelected]}
    >
      <Text style={[styles.optionTitle, selectedDriverId === driver.id && styles.optionTitleSelected]}>
        {driver.full_name || 'سائق مساري'}
      </Text>
      <Text style={styles.optionSubtitle}>{driver.phone}</Text>
    </Pressable>
  );

  return (
    <Screen>
      <Section title="اشتراكك الحالي">
        {latestSubscription ? (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>الحالة: {translateStatus(latestSubscription.status)}</Text>
            <Text style={styles.summaryText}>المبلغ: {formatCurrency(latestSubscription.amount)}</Text>
            <Text style={styles.summaryText}>ينتهي: {latestSubscription.end_date ?? 'لم يبدأ بعد'}</Text>
          </View>
        ) : (
          <EmptyState title="لا توجد طلبات اشتراك" message="اختر سائقاً وارفع وصل الدفع لإنشاء طلب جديد." />
        )}
      </Section>

      <Section
        title="طلب اشتراك شهري"
        subtitle={`قيمة الاشتراك الحالية ${formatCurrency(FINANCIAL.BASE_SUBSCRIPTION)}، والسائق يفعّل الاشتراك لمدة 30 يوماً بعد المراجعة.`}
      >
        {!profile.data ? (
          <EmptyState title="بيانات الطالب غير مكتملة" message="احفظ مؤسستك ونقطة الصعود من الصفحة الرئيسية أولاً." />
        ) : (
          <>
            <Text style={styles.label}>السائقون المتاحون لمؤسستك</Text>
            <View style={styles.options}>
              {drivers.data && drivers.data.length > 0 ? (
                drivers.data.map(renderDriver)
              ) : (
                <EmptyState title="لا يوجد سائقون بعد" message="عند انضمام سائق لمؤسستك سيظهر هنا مباشرة." />
              )}
            </View>

            {selectedDriver ? <Text style={styles.selectedText}>السائق المختار: {selectedDriver.full_name}</Text> : null}

            <Text style={styles.label}>طريقة الدفع</Text>
            <View style={styles.segment}>
              {paymentMethods.map((method) => (
                <Pressable
                  key={method.value}
                  onPress={() => setPaymentMethod(method.value)}
                  style={[styles.segmentItem, paymentMethod === method.value && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentText, paymentMethod === method.value && styles.segmentTextSelected]}>
                    {method.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <AppTextInput
              label="رقم العملية أو ملاحظة الدفع"
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholder="مثال: رقم عملية زين كاش"
            />

            <AppButton
              title={receiptUri ? 'تم اختيار صورة الوصل' : 'اختيار صورة الوصل'}
              onPress={pickReceipt}
              variant="secondary"
            />
            {receiptUri ? <Text style={styles.receiptText}>صورة الوصل جاهزة للرفع مع الطلب</Text> : null}
            <AppButton
              title="إرسال طلب الاشتراك"
              onPress={submitSubscription}
              loading={createSubscription.isPending}
              disabled={drivers.isLoading || subscriptions.isLoading}
            />
          </>
        )}
      </Section>
    </Screen>
  );
}

function translateStatus(status: string): string {
  if (status === 'active') return 'فعّال';
  if (status === 'pending') return 'بانتظار المراجعة';
  if (status === 'rejected') return 'مرفوض';
  if (status === 'expired') return 'منتهي';
  return status;
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: 6,
    padding: 14,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
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
  receiptText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  segment: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  segmentItem: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
});
