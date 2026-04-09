import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

type GradientBackgroundProps = ViewProps & {
  variant?: 'full' | 'soft';
};

export function GradientBackground({ style, variant = 'full', ...props }: GradientBackgroundProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const baseColors = isDark
    ? ['#060913', '#0a1220', '#121b33']
    : ['#f8fbff', '#eff4ff', '#e2e9ff'];
  const glowOneColors = isDark
    ? ['rgba(124, 92, 255, 0.30)', 'rgba(124, 92, 255, 0.08)', 'transparent']
    : ['rgba(124, 92, 255, 0.18)', 'rgba(124, 92, 255, 0.05)', 'transparent'];
  const glowTwoColors = isDark
    ? ['rgba(155, 171, 255, 0.18)', 'rgba(155, 171, 255, 0.05)', 'transparent']
    : ['rgba(172, 149, 255, 0.10)', 'rgba(172, 149, 255, 0.03)', 'transparent'];

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]} {...props}>
      <LinearGradient colors={baseColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={glowOneColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={variant === 'soft' ? styles.softGlowOne : styles.glowOne}
      />
      <LinearGradient
        colors={glowTwoColors}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={variant === 'soft' ? styles.softGlowTwo : styles.glowTwo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glowOne: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.9,
  },
  glowTwo: {
    position: 'absolute',
    right: -120,
    bottom: 80,
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.85,
  },
  softGlowOne: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.9,
  },
  softGlowTwo: {
    position: 'absolute',
    right: -60,
    bottom: 40,
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.85,
  },
});