import { Alert, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useProfiles';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';

export default function StudentProfileScreen() {
  const { user, signOut } = useAuth();
  const profile = useStudentProfile(user?.id);

  const handleSignOut = async () => {
    const success = await signOut();
    if (!success) {
      Alert.alert('تعذر تسجيل الخروج', 'حاول مرة أخرى');
    }
  };

  if (profile.isLoading) {
    return (
      <Screen>
        <View style={styles.centerContainer} accessible accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </View>
      </Screen>
    );
  }

  if (profile.isError) {
    return (
      <Screen>
        <EmptyState title="حدث خطأ" message="تعذر تحميل بيانات الحساب." icon="alert-circle-outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.profileName}>{user?.full_name || 'غير مكتمل'}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="school-outline" size={14} color={colors.primary} />
          <Text style={styles.roleText}>طالب</Text>
        </View>
      </View>

      <Section title="معلومات الحساب">
        <View style={styles.infoRows}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
              <Text style={styles.infoValue}>{user?.email || 'غير متوفر'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>الهاتف</Text>
              <Text style={styles.infoValue}>{user?.phone || 'غير متوفر'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="business-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>المؤسسة</Text>
              <Text style={styles.infoValue}>{profile.data?.institution_id ? 'محددة' : 'غير محددة'}</Text>
            </View>
          </View>
        </View>
      </Section>

      <View style={styles.signOutSection}>
        <AppButton
          title="تسجيل الخروج"
          onPress={handleSignOut}
          variant="danger"
          accessibilityHint="يقوم بتسجيل الخروج من الحساب الحالي"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  profileName: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    writingDirection: 'rtl',
  },
  roleBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  roleText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    writingDirection: 'rtl',
  },
  infoRows: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  signOutSection: {
    marginTop: spacing.sm,
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