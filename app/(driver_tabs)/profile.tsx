import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useDriverInstitutions, useInstitutions } from '../../hooks/useInstitutions';
import { colors } from '../../lib/theme';

export default function DriverProfileScreen() {
  const { user, signOut } = useAuth();
  const institutions = useInstitutions();
  const driverInstitutions = useDriverInstitutions(user?.id);

  const handleSignOut = async () => {
    const success = await signOut();
    if (!success) {
      Alert.alert('تعذر تسجيل الخروج', 'حاول مرة أخرى');
    }
  };

  const institutionNames =
    driverInstitutions.data
      ?.map((link) => institutions.data?.find((institution) => institution.id === link.institution_id)?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  return (
    <Screen>
      <Section title="حساب السائق">
        <View style={styles.infoBox}>
          <Text style={styles.info}>الاسم: {user?.full_name || 'غير مكتمل'}</Text>
          <Text style={styles.info}>الهاتف: {user?.phone || 'غير متوفر'}</Text>
          <Text style={styles.info}>نوع الحساب: سائق</Text>
          <Text style={styles.info}>
            المؤسسات: {institutionNames.length > 0 ? institutionNames.join('، ') : 'لم تربط مؤسسة بعد'}
          </Text>
        </View>
        <AppButton title="تسجيل الخروج" onPress={handleSignOut} variant="danger" />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    gap: 10,
  },
  info: {
    color: colors.text,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
