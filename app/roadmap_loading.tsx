import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";

const PHRASES = [
  "Analyzing your profile...",
  "Building your personalized path...",
  "Gathering resources...",
  "One more moment...",
];

export default function RoadmapLoadingScreen({ onComplete }: { onComplete: () => void }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const listener = progressAnim.addListener(({ value }) => {
      setPercentage(Math.round(value));
    });

    return () => {
      progressAnim.removeListener(listener);
    };
  }, [progressAnim]);

  useEffect(() => {
    const sequence = [
      { toValue: 10, duration: 800 },
      { toValue: 10, duration: 600 }, // pause
      { toValue: 30, duration: 800 },
      { toValue: 30, duration: 600 }, // pause
      { toValue: 40, duration: 800 },
      { toValue: 40, duration: 600 }, // pause
      { toValue: 70, duration: 900 },
      { toValue: 70, duration: 600 }, // pause
      { toValue: 100, duration: 1200 },
    ];

    let currentIndex = 0;
    let phraseCounter = 0;

    const playNextStep = () => {
      if (currentIndex >= sequence.length) {
        onComplete();
        return;
      }

      const step = sequence[currentIndex];

      // Change phrase every 2 steps (roughly every 3 seconds)
      if (currentIndex > 0 && currentIndex % 2 === 0 && phraseCounter < PHRASES.length - 1) {
        phraseCounter++;
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
  }, [progressAnim, onComplete]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Generating your roadmap</Text>

        <View style={styles.progressTrackContainer}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <Animated.Text
          style={[
            styles.phrase,
            {
              opacity: progressAnim.interpolate({
                inputRange: [0, 15, 25, 35, 50, 65, 80, 100],
                outputRange: [1, 0.7, 1, 0.7, 1, 0.7, 1, 0.9],
              }),
            },
          ]}
        >
          {PHRASES[phraseIndex]}
        </Animated.Text>

        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 28,
    color: "#f5f7fb",
    marginBottom: 60,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  progressTrackContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2b2f38",
    overflow: "hidden",
    marginBottom: 40,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c5cff",
    borderRadius: 4,
  },
  phrase: {
    fontFamily: "ClashGrotesk-Regular",
    fontSize: 15,
    color: "#b7adff",
    textAlign: "center",
    minHeight: 22,
    marginBottom: 24,
  },
  percentage: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 18,
    color: "#aab3c3",
    marginTop: 12,
  },
});
