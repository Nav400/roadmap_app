import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { GradientBackground } from '@/components/gradient-background';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontsError] = useFonts({
    'ClashGrotesk-Regular': require('../assets/fonts/clash-grotesk/ClashGrotesk_Complete/Fonts/OTF/ClashGrotesk-Regular.otf'),
    'ClashGrotesk-Medium': require('../assets/fonts/clash-grotesk/ClashGrotesk_Complete/Fonts/OTF/ClashGrotesk-Medium.otf'),
    'ClashGrotesk-Semibold': require('../assets/fonts/clash-grotesk/ClashGrotesk_Complete/Fonts/OTF/ClashGrotesk-Semibold.otf'),
    'ClashGrotesk-Bold': require('../assets/fonts/clash-grotesk/ClashGrotesk_Complete/Fonts/OTF/ClashGrotesk-Bold.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsError, fontsLoaded]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  const navigationTheme = colorScheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: Colors.dark.background,
          card: '#0f1830',
          border: 'rgba(157, 180, 255, 0.16)',
          primary: Colors.dark.tint,
          text: Colors.dark.text,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: Colors.light.background,
          card: '#ffffff',
          border: 'rgba(91, 108, 255, 0.14)',
          primary: Colors.light.tint,
          text: Colors.light.text,
        },
      };

  return (
    <ThemeProvider value={navigationTheme}>
      <GradientBackground />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
