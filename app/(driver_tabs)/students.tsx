import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import {
  useApproveSubscription,
  useDriverSubscriptions,
  useReceiptUrl,
  useRejectSubscription,
} from '../../hooks/useSubscriptions';
import { useUsersByIds } from '../../hooks/useUsers';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';
import type { Subscription } from '../../types/models';
import { formatCurrency } from '../../utils/formatters';
import { translatePaymentMethod } from '../../utils/translations';

export default function StudentsScreen() {
  const { user } = useAuth();
  const subscriptions = useDriverSubscriptions(user?.id);
  const approveSubscription = useApproveSubscription();
  const rejectSubscription = useRejectSubscription();
  const receiptUrl = useReceiptUrl();
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);
  const studentIds = subscriptions.data?.map((subscription) => subscription.student_id) ?? [];
  const students = useUsersByIds(studentIds);

  const pendingSubscriptions = subscriptions.data?.filter((subscription) => subscription.status === 'pending') ?? [];
  const activeSubscriptions = subscriptions.data?.filter((subscription) => subscription.status === 'active') ?? [];

  const getStudentName = (studentId: string): string => {
    const student = students.data?.find((item) => item.id === studentId);
    return student?.full_name || student?.phone || 'طالب مساري';
  };

  const approve = async (subscriptionId: string) => {
    try {
      await approveSubscription.mutateAsync(subscriptionId);
      Alert.alert('تمت الموافقة', 'تم تفعيل اشتراك الطالب لمدة 30 يوماً');
    } catch (error) {
      Alert.alert('تعذر الموافقة', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const reject = async (subscriptionId: string) => {
    try {
      await rejectSubscription.mutateAsync({ subscriptionId, reason: 'لم يتم اعتماد الوصل' });
      Alert.alert('تم الرفض', 'تم تحديث حالة الطلب إلى مرفوض');
    } catch (error) {
      Alert.alert('تعذر الرفض', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const openReceipt = async (receiptPath: string | null, subscriptionId: string) => {
    if (!receiptPath) {
      Alert.alert('لا يوجد وصل', 'هذا الطلب لا يحتوي على ملف وصل محفوظ.');
      return;
    }

    setLoadingReceiptId(subscriptionId);
    try {
      const url = await receiptUrl.mutateAsync(receiptPath);
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('تعذر فتح الوصل', 'الجهاز لا يستطيع فتح رابط الوصل.');
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('تعذر فتح الوصل', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoadingReceiptId(null);
    }
  };

  const renderPending = (subscription: Subscription) => (
    <View key={subscription.id} style={styles.requestCard} accessible={true} accessibilityRole="summary" accessibilityLabel={`طلب من ${getStudentName(subscription.student_id)}`}>
      <View style={styles.requestHeader}>
        <View style={styles.requestAvatar}>
          <Ionicons name="person-outline" size={20} color={colors.warning} />
        </View>
        <View style={styles.requestHeaderTexts}>
          <Text style={styles.requestName}>{getStudentName(subscription.student_id)}</Text>
          <Text style={styles.requestAmount}>{formatCurrency(subscription.amount)}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>بانتظارك</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{translatePaymentMethod(subscription.payment_method)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="key-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{subscription.payment_reference || 'غير مذكور'}</Text>
        </View>
      </View>

      <AppButton
        title={subscription.receipt_image_path ? 'عرض الوصل' : 'لا يوجد وصل'}
        onPress={() => openReceipt(subscription.receipt_image_path, subscription.id)}
        loading={loadingReceiptId === subscription.id}
        disabled={!subscription.receipt_image_path}
        variant="secondary"
        size="small"
        accessibilityHint="يفتح صورة وصل الدفع المرفقة مع الطلب"
      />

      <View style={styles.actionsRow}>
        <View style={styles.actionFlex}>
          <AppButton
            title="موافقة"
            onPress={() => approve(subscription.id)}
            loading={approveSubscription.isPending}
            size="small"
            accessibilityHint="الموافقة على الطلب وتفعيل الاشتراك"
          />
        </View>
        <View style={styles.actionFlex}>
          <AppButton
            title="رفض"
            onPress={() => reject(subscription.id)}
            loading={rejectSubscription.isPending}
            variant="danger"
            size="small"
            accessibilityHint="رفض الطلب لعدم صحة الوصل"
          />
        </View>
      </View>
    </View>
  );

  const renderActive = (subscription: Subscription) => (
    <View key={subscription.id} style={styles.activeCard}>
      <View style={styles.activeHeader}>
        <View style={styles.activeAvatar}>
          <Ionicons name="person-outline" size={18} color={colors.success} />
        </View>
        <View style={styles.activeTexts}>
          <Text style={styles.activeName}>{getStudentName(subscription.student_id)}</Text>
          <Text style={styles.activeExpiry}>ينتهي: {subscription.end_date ?? 'غير محدد'}</Text>
        </View>
        <View style={styles.activeBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.activeBadgeText}>فعّال</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      <Section title="طلبات الاشتراك">
        {subscriptions.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ padding: 20 }} accessibilityLabel="جاري تحميل الطلبات" />
        ) : pendingSubscriptions.length > 0 ? (
          <View style={styles.list}>{pendingSubscriptions.map(renderPending)}</View>
        ) : (
          <EmptyState title="لا توجد طلبات معلقة" message="طلبات الطلاب الجديدة ستظهر هنا عند رفع الوصل." icon="receipt-outline" />
        )}
      </Section>

      <Section title="الطلاب الفعّالون">
        {subscriptions.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ padding: 20 }} accessibilityLabel="جاري تحميل المشتركين" />
        ) : activeSubscriptions.length > 0 ? (
          <View style={styles.list}>{activeSubscriptions.map(renderActive)}</View>
        ) : (
          <EmptyState title="لا توجد اشتراكات فعّالة" message="بعد الموافقة على الطلبات سيظهر الطلاب هنا." icon="people-outline" />
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  requestCard: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  requestHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestHeaderTexts: {
    flex: 1,
    gap: 2,
  },
  requestName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  requestAmount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    writingDirection: 'rtl',
  },
  pendingBadge: {
    backgroundColor: colors.warning,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  requestDetails: {
    gap: spacing.xs,
    paddingRight: spacing.xxl,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    writingDirection: 'rtl',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionFlex: {
    flex: 1,
  },
  activeCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  activeHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  activeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTexts: {
    flex: 1,
    gap: 2,
  },
  activeName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  activeExpiry: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    writingDirection: 'rtl',
  },
  activeBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeBadgeText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});
