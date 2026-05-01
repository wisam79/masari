import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../../lib/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
}

export function Screen({ children, scroll = true }: ScreenProps) {
  if (!scroll) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: 16,
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
});
