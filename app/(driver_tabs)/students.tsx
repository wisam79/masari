import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useApproveSubscription, useDriverSubscriptions, useRejectSubscription } from '../../hooks/useSubscriptions';
import { useUsersByIds } from '../../hooks/useUsers';
import { colors } from '../../lib/theme';
import type { Subscription } from '../../types/models';
import { formatCurrency } from '../../utils/formatters';

export default function StudentsScreen() {
  const { user } = useAuth();
  const subscriptions = useDriverSubscriptions(user?.id);
  const approveSubscription = useApproveSubscription();
  const rejectSubscription = useRejectSubscription();
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

  const renderPending = (subscription: Subscription) => (
    <View key={subscription.id} style={styles.item}>
      <Text style={styles.itemTitle}>{getStudentName(subscription.student_id)}</Text>
      <Text style={styles.itemText}>المبلغ: {formatCurrency(subscription.amount)}</Text>
      <Text style={styles.itemText}>طريقة الدفع: {translatePayment(subscription.payment_method)}</Text>
      <Text style={styles.itemText}>المرجع: {subscription.payment_reference || 'غير مذكور'}</Text>
      <View style={styles.actions}>
        <View style={styles.action}>
          <AppButton
            title="موافقة"
            onPress={() => approve(subscription.id)}
            loading={approveSubscription.isPending}
          />
        </View>
        <View style={styles.action}>
          <AppButton
            title="رفض"
            onPress={() => reject(subscription.id)}
            loading={rejectSubscription.isPending}
            variant="danger"
          />
        </View>
      </View>
    </View>
  );

  const renderActive = (subscription: Subscription) => (
    <View key={subscription.id} style={styles.item}>
      <Text style={styles.itemTitle}>{getStudentName(subscription.student_id)}</Text>
      <Text style={styles.itemText}>ينتهي: {subscription.end_date ?? 'غير محدد'}</Text>
    </View>
  );

  return (
    <Screen>
      <Section title="طلبات الاشتراك">
        {pendingSubscriptions.length > 0 ? (
          pendingSubscriptions.map(renderPending)
        ) : (
          <EmptyState title="لا توجد طلبات معلقة" message="طلبات الطلاب الجديدة ستظهر هنا عند رفع الوصل." />
        )}
      </Section>

      <Section title="الطلاب الفعّالون">
        {activeSubscriptions.length > 0 ? (
          activeSubscriptions.map(renderActive)
        ) : (
          <EmptyState title="لا توجد اشتراكات فعّالة" message="بعد الموافقة على الطلبات سيظهر الطلاب هنا." />
        )}
      </Section>
    </Screen>
  );
}

function translatePayment(method: string): string {
  if (method === 'zaincash') return 'زين كاش';
  if (method === 'fib') return 'FIB';
  if (method === 'cash') return 'نقداً';
  return 'أخرى';
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: 6,
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
    marginTop: 8,
  },
  action: {
    flex: 1,
  },
});
