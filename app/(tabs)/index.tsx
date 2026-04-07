import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import OnboardingScreen from "../onboarding";
import RevealScreen from "../reveal";
import RoadmapLoadingScreen from "../roadmap_loading";
import RoadmapScreen from "../roadmap";

const { height } = Dimensions.get("window");

function AnimatedBackground() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim1, {
        toValue: 1,
        duration: 6800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(anim2, {
        toValue: 1,
        duration: 8400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(anim3, {
        toValue: 1,
        duration: 9800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [anim1, anim2, anim3]);

  const blob1Y = anim1.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -32, -10, 18, 0],
  });
  const blob1X = anim1.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 28, -12, -26, 0],
  });
  const blob2Y = anim2.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 22, -8, -26, 0],
  });
  const blob2X = anim2.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -24, -6, 22, 0],
  });
  const blob3Y = anim3.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -18, 14, -12, 0],
  });
  const blob3X = anim3.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 16, -20, 10, 0],
  });
  const blob1Opacity = anim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.25, 0.15] });
  const blob2Opacity = anim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.2, 0.1] });
  const blob3Opacity = anim3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.15, 0.08] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.blob,
          {
            width: 320,
            height: 320,
            backgroundColor: "#4c1d95",
            borderRadius: 160,
            top: -60,
            left: -80,
            opacity: blob1Opacity,
            transform: [{ translateY: blob1Y }, { translateX: blob1X }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            width: 280,
            height: 280,
            backgroundColor: "#6d28d9",
            borderRadius: 140,
            top: height * 0.3,
            right: -80,
            opacity: blob2Opacity,
            transform: [{ translateY: blob2Y }, { translateX: blob2X }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            width: 240,
            height: 240,
            backgroundColor: "#a855f7",
            borderRadius: 120,
            bottom: 80,
            left: 20,
            opacity: blob3Opacity,
            transform: [{ translateY: blob3Y }, { translateX: blob3X }],
          },
        ]}
      />
    </View>
  );
}

export default function HomeScreen() {
  const [screen, setScreen] = useState<"landing" | "onboarding" | "reveal" | "loading" | "roadmap">("landing");
  const [profile, setProfile] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, delay: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, delay: 300, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  function handleGetStartedPress() {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 18,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setScreen("onboarding");
    });
  }

  if (screen === "onboarding") {
    return (
      <OnboardingScreen
        startAtQuestions
        onComplete={(data) => {
          setProfile(data);
          setScreen("reveal");
        }}
      />
    );
  }

  if (screen === "reveal") {
    return <RevealScreen profile={profile} onContinue={() => setScreen("loading")} />;
  }

  if (screen === "loading") {
    return <RoadmapLoadingScreen onComplete={() => setScreen("roadmap")} />;
  }

  if (screen === "roadmap") {
    return <RoadmapScreen profile={profile} />;
  }

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >


          <Text style={styles.headline}>Stop feeling{"\n"}lost in your{"\n"}major</Text>

          

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>2 min</Text>
              <Text style={styles.statDesc}>to your roadmap</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>100%</Text>
              <Text style={styles.statDesc}>personalized</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>Free</Text>
              <Text style={styles.statDesc}>to start</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleGetStartedPress}
            disabled={isTransitioning}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>GET STARTED</Text>
          </TouchableOpacity>

        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "flex-end",
    paddingBottom: 52,
  },
  blob: {
    position: "absolute",
  },
  topLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 20,
  },
  topLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7ab648",
  },
  topLabelText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#555",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: "ClashGrotesk-Bold",
    fontSize: 48,
    color: "#fff",
    lineHeight: 54,
    letterSpacing:1,
    marginBottom: 100,
  },
  subtext: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginBottom: 36,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#2a2a2a",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "monospace",
    marginBottom: 2,
  },
  statDesc: {
    fontSize: 15,
    color: "#7d7d7d",
    textAlign: "center",
  },
  statDivider: {
    width: 1.5,
    height: 34,
    backgroundColor: "#2a2a2a",
  },
  ctaBtn: {
    backgroundColor: "#7c5cff",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  ctaBtnText: {
    color: "#f7f5ff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 0.3,
  },
  finePrint: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    fontFamily: "monospace",
  },
});
