import { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, Easing } from "react-native";
import Svg, { Defs, Pattern, Rect, Circle, Line, G } from "react-native-svg";

type GradientBackgroundVariant = "default" | "soft" | "vivid";

interface GradientBackgroundProps {
  variant?: GradientBackgroundVariant;
}

/**
 * Futuristic dot-grid background component.
 * Deep-black surface with a precise dot-grid pattern and faint
 * animated diagonal light streaks — technical, minimal, spatial.
 */
export function GradientBackground({ variant = "default" }: GradientBackgroundProps) {
  const streakOpacity1 = useRef(new Animated.Value(0)).current;
  const streakOpacity2 = useRef(new Animated.Value(0)).current;
  const streakOpacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateStreak = (
      anim: Animated.Value,
      delay: number,
      duration: number,
      peakOpacity: number
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: peakOpacity,
            duration: duration * 0.35,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration * 0.65,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(duration * 2.5),
        ])
      ).start();
    };

    animateStreak(streakOpacity1, 0, 3200, variant === "vivid" ? 0.28 : 0.14);
    animateStreak(streakOpacity2, 4800, 2600, variant === "vivid" ? 0.22 : 0.10);
    animateStreak(streakOpacity3, 9200, 3800, variant === "vivid" ? 0.18 : 0.08);
  }, [streakOpacity1, streakOpacity2, streakOpacity3, variant]);

  // Dot grid tuning per variant
  const dotOpacity = variant === "vivid" ? 0.20 : variant === "soft" ? 0.11 : 0.15;
  const dotRadius = 0.9;
  const spacing = 24;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Deep black base */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#080808" }]} />

      {/* Dot grid */}
      <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
        <Defs>
          <Pattern
            id={`dotgrid-${variant}`}
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <Circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={dotRadius}
              fill={`rgba(255, 255, 255, ${dotOpacity})`}
            />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#dotgrid-${variant})`} />
      </Svg>

      {/* Diagonal light streaks — animated */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: streakOpacity1 }]}
        pointerEvents="none"
      >
        <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
          <G>
            {/* Long diagonal streak top-left → bottom-right */}
            <Line
              x1="-10%"
              y1="18%"
              x2="110%"
              y2="72%"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.7"
            />
            <Line
              x1="-10%"
              y1="19.5%"
              x2="110%"
              y2="73.5%"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.4"
            />
          </G>
        </Svg>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: streakOpacity2 }]}
        pointerEvents="none"
      >
        <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
          <G>
            {/* Shorter streak — opposite diagonal, upper right */}
            <Line
              x1="55%"
              y1="-5%"
              x2="110%"
              y2="45%"
              stroke="rgba(255,255,255,0.50)"
              strokeWidth="0.6"
            />
            <Line
              x1="54%"
              y1="-5%"
              x2="109%"
              y2="45%"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.2"
            />
          </G>
        </Svg>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: streakOpacity3 }]}
        pointerEvents="none"
      >
        <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
          <G>
            {/* Third streak — bottom half, subtle cross */}
            <Line
              x1="-5%"
              y1="60%"
              x2="60%"
              y2="105%"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="0.6"
            />
            <Line
              x1="-5%"
              y1="58.5%"
              x2="60%"
              y2="103.5%"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.1"
            />
          </G>
        </Svg>
      </Animated.View>

      {/* Radial center glow — very faint, keeps it from feeling flat */}
      <View style={styles.centerGlow} />

      {/* Edge vignette — top */}
      <View style={styles.vignetteTop} />
      {/* Edge vignette — bottom */}
      <View style={styles.vignetteBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerGlow: {
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
    bottom: "20%",
    borderRadius: 999,
    backgroundColor: "transparent",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.03,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 0 },
  },
  vignetteTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(8, 8, 8, 0.55)",
  },
  vignetteBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(8, 8, 8, 0.55)",
  },
});
