import { useRouter } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();

  const navigateToAuth = () => {
    router.replace('/');
  };

  const navigateToOTP = (phone: string) => {
    router.push({ pathname: '/otp', params: { phone } });
  };

  const navigateToRoleSelection = () => {
    router.replace('/role-selection');
  };

  const navigateToStudentTabs = () => {
    router.replace('/(student_tabs)');
  };

  const navigateToDriverTabs = () => {
    router.replace('/(driver_tabs)');
  };

  const navigateToStudentHome = () => {
    router.push('/(student_tabs)');
  };

  const navigateToStudentSubscription = () => {
    router.push('/(student_tabs)/subscription');
  };

  const navigateToStudentAttendance = () => {
    router.push('/(student_tabs)/attendance');
  };

  const navigateToStudentProfile = () => {
    router.push('/(student_tabs)/profile');
  };

  const navigateToDriverHome = () => {
    router.push('/(driver_tabs)');
  };

  const navigateToDriverStudents = () => {
    router.push('/(driver_tabs)/students');
  };

  const navigateToDriverRoute = () => {
    router.push('/(driver_tabs)/route');
  };

  const navigateToDriverProfile = () => {
    router.push('/(driver_tabs)/profile');
  };

  return {
    navigateToAuth,
    navigateToOTP,
    navigateToRoleSelection,
    navigateToStudentTabs,
    navigateToDriverTabs,
    navigateToStudentHome,
    navigateToStudentSubscription,
    navigateToStudentAttendance,
    navigateToStudentProfile,
    navigateToDriverHome,
    navigateToDriverStudents,
    navigateToDriverRoute,
    navigateToDriverProfile,
  };
}