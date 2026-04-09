import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";

import { GradientBackground } from "@/components/gradient-background";

function buildPhrases(profile: { year?: string; school?: string } | null) {
  const year = profile?.year?.trim();
  const school = profile?.school?.trim();

  const yearLabel = year ? `${year}s` : "students";
  const schoolLabel = school || "your school";

  return [
    "Matching your goals to real opportunities...",
    `Checking what ${yearLabel} at ${schoolLabel} are doing...`,
    "Building your personalized path...",
    "Gathering resources...",
  ];
}

export default function RoadmapLoadingScreen({
  onComplete,
  profile,
}: {
  onComplete: () => void;
  profile: { year?: string; school?: string } | null;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const logoPulseAnim = useRef(new Animated.Value(0)).current;
  const exitOpacityAnim = useRef(new Animated.Value(1)).current;
  const exitTranslateYAnim = useRef(new Animated.Value(0)).current;
  const phraseAnim = useRef(new Animated.Value(0)).current;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrases = buildPhrases(profile);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulseAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [logoPulseAnim]);

  useEffect(() => {
    phraseAnim.setValue(0);
    Animated.timing(phraseAnim, {
      toValue: 1,
      duration: 520,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [phraseAnim, phraseIndex]);

  useEffect(() => {
    const sequence = [
      { toValue: 10, duration: 1000 },
      { toValue: 10, duration: 1000 }, // pause
      { toValue: 30, duration: 1000 },
      { toValue: 30, duration: 1000 }, // pause
      { toValue: 40, duration: 1000 },
      { toValue: 40, duration: 1000 }, // pause
      { toValue: 70, duration: 1100 },
      { toValue: 70, duration: 1000 }, // pause
      { toValue: 100, duration: 1200 },
    ];

    let currentIndex = 0;
    let phraseCounter = 0;

    const playNextStep = () => {
      if (currentIndex >= sequence.length) {
        Animated.parallel([
          Animated.timing(exitOpacityAnim, {
            toValue: 0,
            duration: 420,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            useNativeDriver: true,
          }),
          Animated.timing(exitTranslateYAnim, {
            toValue: -12,
            duration: 420,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
        });
        return;
      }

      const step = sequence[currentIndex];

      // Change phrase every 2 steps (roughly every 2-3 seconds)
      if (currentIndex > 0 && currentIndex % 2 === 0 && phraseCounter < phrases.length - 1) {
        phraseCounter++;
        phraseAnim.stopAnimation();
        phraseAnim.setValue(0);
        setPhraseIndex(phraseCounter);
      }

      Animated.timing(progressAnim, {
        toValue: step.toValue,
        duration: step.duration,
        easing: step.duration > 700 ? Easing.out(Easing.cubic) : Easing.linear,
        useNativeDriver: false,
      }).start(() => {
        currentIndex++;
        playNextStep();
      });
    };

    playNextStep();
  }, [exitOpacityAnim, exitTranslateYAnim, onComplete, phraseAnim, phrases.length, progressAnim]);

  return (
    <SafeAreaView style={styles.safe}>
      <GradientBackground variant="soft" />
      <Animated.View
        style={[
          styles.container,
          {
            opacity: exitOpacityAnim,
            transform: [{ translateY: exitTranslateYAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.loadingLogoWrap,
            {
              transform: [
                {
                  scale: logoPulseAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.96, 1.05, 0.96],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.loadingGlow,
              {
                opacity: logoPulseAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.7, 0],
                }),
                transform: [
                  {
                    scale: logoPulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.22],
                    }),
                  },
                ],
              },
            ]}
          />
          <Image
            source={require("../app_icon.png")}
            style={styles.loadingLogo}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.phrase,
            {
              transform: [
                {
                  translateY: phraseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
                {
                  scale: phraseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.975, 1],
                  }),
                },
              ],
              opacity: phraseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          {phrases[phraseIndex]}
        </Animated.Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  loadingLogoWrap: {
    width: 154,
    height: 154,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  loadingGlow: {
    position: "absolute",
    width: 154,
    height: 154,
    borderRadius: 44,
    backgroundColor: "rgba(124, 92, 255, 0.2)",
    shadowColor: "#7c5cff",
    shadowOpacity: 0.58,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    color: "#f5f7fb",
    marginBottom: 60,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  loadingLogo: {
    width: 110,
    height: 110,
    borderRadius: 28,
    overflow: "hidden",
  },
  phrase: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 20,
    color: "#b7adff",
    textAlign: "center",
    minHeight: 24,
    letterSpacing: 0.6,
    marginBottom: 24,
  },
});
