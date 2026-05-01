import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useProfiles';
import { colors } from '../../lib/theme';

export default function StudentProfileScreen() {
  const { user, signOut } = useAuth();
  const profile = useStudentProfile(user?.id);

  const handleSignOut = async () => {
    const success = await signOut();
    if (!success) {
      Alert.alert('تعذر تسجيل الخروج', 'حاول مرة أخرى');
    }
  };

  return (
    <Screen>
      <Section title="حساب الطالب">
        <View style={styles.infoBox}>
          <Text style={styles.info}>الاسم: {user?.full_name || 'غير مكتمل'}</Text>
          <Text style={styles.info}>الهاتف: {user?.phone || 'غير متوفر'}</Text>
          <Text style={styles.info}>نوع الحساب: طالب</Text>
          <Text style={styles.info}>المؤسسة: {profile.data?.institution_id ? 'محددة' : 'غير محددة'}</Text>
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
