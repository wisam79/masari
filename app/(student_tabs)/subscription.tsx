import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { StatusCard } from '../../components/common/StatusCards';
import { useAuth } from '../../hooks/useAuth';
import { useAvailableDrivers } from '../../hooks/useInstitutions';
import { useStudentProfile } from '../../hooks/useProfiles';
import { useCreateSubscription, useStudentSubscriptions } from '../../hooks/useSubscriptions';
import { FINANCIAL } from '../../lib/constants';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';
import type { PaymentMethod } from '../../lib/constants';
import type { User } from '../../types/models';
import { formatCurrency } from '../../utils/formatters';
import { translateSubscriptionStatus } from '../../utils/translations';

const paymentMethods: Array<{ label: string; value: PaymentMethod; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'زين كاش', value: 'zaincash', icon: 'phone-portrait-outline' },
  { label: 'FIB', value: 'fib', icon: 'card-outline' },
  { label: 'نقداً', value: 'cash', icon: 'cash-outline' },
  { label: 'أخرى', value: 'other', icon: 'ellipsis-horizontal-outline' },
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

  const renderDriver = (driver: User) => {
    const isSelected = selectedDriverId === driver.id;
    return (
      <Pressable
        key={driver.id}
        onPress={() => setSelectedDriverId(driver.id)}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`السائق ${driver.full_name || 'سائق مساري'}، رقم الهاتف ${driver.phone}`}
        style={[styles.driverCard, isSelected && styles.driverCardSelected]}
      >
        <View style={styles.driverContent}>
          <View style={[styles.driverAvatar, isSelected && styles.driverAvatarSelected]}>
            <Ionicons name="bus-outline" size={20} color={isSelected ? '#FFFFFF' : colors.primary} />
          </View>
          <View style={styles.driverTexts}>
            <Text style={[styles.driverName, isSelected && styles.driverNameSelected]}>
              {driver.full_name || 'سائق مساري'}
            </Text>
            <Text style={styles.driverPhone}>{driver.phone}</Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </View>
      </Pressable>
    );
  };

  const isLoading = profile.isLoading || drivers.isLoading || subscriptions.isLoading;
  const isError = profile.isError || drivers.isError || subscriptions.isError;

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
        <EmptyState title="حدث خطأ" message="تعذر تحميل بيانات الاشتراك." icon="alert-circle-outline" />
      </Screen>
    );
  }

  const statusVariant = latestSubscription?.status === 'active' ? 'success' : latestSubscription?.status === 'pending' ? 'warning' : latestSubscription?.status === 'rejected' ? 'danger' : 'muted';

  return (
    <Screen>
      <Section title="اشتراكك الحالي">
        {latestSubscription ? (
          <View style={styles.subscriptionSummary}>
            <StatusCard
              title={`الحالة: ${translateSubscriptionStatus(latestSubscription.status)}`}
              subtitle={`المبلغ: ${formatCurrency(latestSubscription.amount)} • ينتهي: ${latestSubscription.end_date ?? 'لم يبدأ بعد'}`}
              variant={statusVariant}
            />
          </View>
        ) : (
          <EmptyState title="لا توجد طلبات اشتراك" message="اختر سائقاً وارفع وصل الدفع لإنشاء طلب جديد." icon="receipt-outline" />
        )}
      </Section>

      <Section
        title="طلب اشتراك شهري"
        subtitle={`قيمة الاشتراك ${formatCurrency(FINANCIAL.BASE_SUBSCRIPTION)}، والسائق يفعّل الاشتراك لمدة 30 يوماً بعد المراجعة.`}
      >
        {!profile.data ? (
          <EmptyState title="بيانات الطالب غير مكتملة" message="احفظ مؤسستك ونقطة الصعود من الصفحة الرئيسية أولاً." icon="warning-outline" />
        ) : (
          <>
            <Text style={styles.label}>السائقون المتاحون لمؤسستك</Text>
            <View style={styles.driversList} accessibilityRole="radiogroup">
              {drivers.data && drivers.data.length > 0 ? (
                drivers.data.map(renderDriver)
              ) : (
                <EmptyState title="لا يوجد سائقون بعد" message="عند انضمام سائق لمؤسستك سيظهر هنا مباشرة." icon="bus-outline" />
              )}
            </View>

            <Text style={styles.label}>طريقة الدفع</Text>
            <View style={styles.paymentGrid}>
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method.value;
                return (
                  <Pressable
                    key={method.value}
                    onPress={() => setPaymentMethod(method.value)}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={method.label}
                    style={[styles.paymentItem, isSelected && styles.paymentItemSelected]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={18}
                      color={isSelected ? '#FFFFFF' : colors.textMuted}
                    />
                    <Text style={[styles.paymentText, isSelected && styles.paymentTextSelected]}>
                      {method.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <AppTextInput
              label="رقم العملية أو ملاحظة الدفع"
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholder="مثال: رقم عملية زين كاش"
              accessibilityLabel="رقم العملية أو ملاحظة الدفع"
            />

            <AppButton
              title={receiptUri ? 'تم اختيار صورة الوصل' : 'اختيار صورة الوصل'}
              onPress={pickReceipt}
              variant="secondary"
              accessibilityHint="يفتح مكتبة الصور لاختيار إيصال الدفع"
            />
            {receiptUri ? (
              <View style={styles.receiptBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.receiptText}>صورة الوصل جاهزة للرفع مع الطلب</Text>
              </View>
            ) : null}
            <AppButton
              title="إرسال طلب الاشتراك"
              onPress={submitSubscription}
              loading={createSubscription.isPending}
              disabled={createSubscription.isPending}
              accessibilityHint="يرسل طلب الاشتراك للمراجعة"
            />
          </>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subscriptionSummary: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  driversList: {
    gap: spacing.sm,
  },
  driverCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  driverCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  driverContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarSelected: {
    backgroundColor: colors.primary,
  },
  driverTexts: {
    flex: 1,
    gap: 2,
  },
  driverName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  driverNameSelected: {
    color: colors.primary,
  },
  driverPhone: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  paymentGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 42,
  },
  paymentItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    writingDirection: 'rtl',
  },
  paymentTextSelected: {
    color: '#FFFFFF',
  },
  receiptBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  receiptText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    writingDirection: 'rtl',
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
