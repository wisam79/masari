import { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme';
import { AppButton } from './AppButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>حدث خطأ غير متوقع</Text>
          <Text style={styles.message}>
            {__DEV__ && this.state.error?.message
              ? this.state.error.message
              : 'يرجى إعادة تشغيل التطبيق والمحاولة مرة أخرى'}
          </Text>
          <AppButton title="إعادة المحاولة" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
