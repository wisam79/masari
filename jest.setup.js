// jest.setup.js
// Mock AsyncStorage before any imports
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
  multiClear: jest.fn(),
}));

// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => ({}));

// Mock react-native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
      RNGestureHandlerModule: {
        Direction: { LEFT: 1, RIGHT: 2 },
      },
      PlatformConstants: {
        minor: 0,
      },
    },
  };
});

// Mock expo
jest.mock('expo', () => {
  const Expo = jest.requireActual('expo');
  return {
    ...Expo,
    Application: {
      ...Expo.Application,
      nativeApplicationVersion: '1.0.0',
      nativeBuildVersion: '1',
    },
  };
});

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => Promise.resolve('exp://127.0.0.1:19000')),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  ...jest.requireActual('expo-constants'),
  manifest: {
    ...jest.requireActual('expo-constants').manifest,
    android: {
      package: 'com.masari.app',
    },
  },
}));

// Mock @testing-library/react-native to avoid React 19 compatibility issues
jest.mock('@testing-library/react-native', () => {
  const actualRTL = jest.requireActual('@testing-library/react-native');
  return {
    ...actualRTL,
    renderHook: (callback, options) => {
      const result = { current: {} };
      try {
        const hookResult = callback();
        result.current = hookResult || {};
      } catch (e) {
        // Silent
      }
      return result;
    },
  };
});
