import React, { useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  runOnJS,
  createAnimatedComponent,
} from 'react-native-reanimated';
import { useOnboarding } from '../../context/OnboardingContext';
import { Button } from '../ui/Button';
import { Title, Subtitle, Body } from '../ui/Typography';
import { firebaseAnalytics } from '../../services/firebase';

const AnimatedScrollView = createAnimatedComponent(ScrollView);
const AnimatedPressable = createAnimatedComponent(Pressable);
const { width, height } = Dimensions.get('window');

// Sample background video URL (replace with your own)
const BACKGROUND_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

interface OnboardingStep {
  title: string;
  subtitle: string;
  description?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'onboarding.step1.title',
    subtitle: 'onboarding.step1.subtitle',
    description: 'onboarding.step1.description',
  },
  {
    title: 'onboarding.step2.title',
    subtitle: 'onboarding.step2.subtitle',
    description: 'onboarding.step2.description',
  },
  {
    title: 'onboarding.step3.title',
    subtitle: 'onboarding.step3.subtitle',
    description: 'onboarding.step3.description',
  },
];

export function OnboardingPager() {
  const router = useRouter();
  const { t } = useTranslation();
  const { completeOnboarding } = useOnboarding();
  const scrollViewRef = useRef<any>(null);
  const [buttonText, setButtonText] = useState(t('onboarding.next'));
  const translateX = useSharedValue(0);
  const currentIndex = useSharedValue(0);

  // Background video player (mounted once)
  const player = useVideoPlayer(BACKGROUND_VIDEO_URL, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const totalSteps = ONBOARDING_STEPS.length;

  const handleGetStarted = () => {
    firebaseAnalytics.logEvent('onboarding_completed', {
      method: 'get_started',
      step_index: currentIndex.value,
    });
    completeOnboarding();
    router.replace('/paywall');
  };

  const handleSkip = () => {
    firebaseAnalytics.logEvent('onboarding_completed', {
      method: 'skip',
      step_index: currentIndex.value,
    });
    completeOnboarding();
    router.replace('/paywall');
  };

  const handleNext = () => {
    if (currentIndex.value < totalSteps - 1) {
      const nextIndex = currentIndex.value + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const updateButtonText = (index: number) => {
    setButtonText(index >= totalSteps - 1 ? t('onboarding.getStarted') : t('onboarding.next'));
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      translateX.value = event.contentOffset.x;
      const newIndex = Math.round(event.contentOffset.x / width);
      if (newIndex !== currentIndex.value) {
        currentIndex.value = newIndex;
        runOnJS(firebaseAnalytics.logEvent)('onboarding_step_viewed', {
          step_index: newIndex,
        });
        runOnJS(updateButtonText)(newIndex);
      }
    },
  });

  const prevButtonOpacity = useDerivedValue(() =>
    interpolate(currentIndex.value, [0, 1], [1, 0], Extrapolation.CLAMP)
  );

  const dotOpacity = (index: number) => {
    'worklet';
    return interpolate(
      currentIndex.value,
      [index - 1, index, index + 1],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
  };

  const dotScale = (index: number) => {
    'worklet';
    return interpolate(
      currentIndex.value,
      [index - 1, index, index + 1],
      [1, 1.3, 1],
      Extrapolation.CLAMP
    );
  };

  const textOpacity = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [0, width],
      [1, 0],
      Extrapolation.CLAMP
    );
  });

  const newTextOpacity = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [0, width],
      [0, 1],
      Extrapolation.CLAMP
    );
  });

  // Skip button visibility - derived value to avoid reading .value during render
  const skipButtonOpacity = useDerivedValue(() => {
    return currentIndex.value < totalSteps - 1 ? 1 : 0;
  });

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
        fullscreenControls={false}
        allowsPictureInPicture={false}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      {/* Content */}
      <SafeAreaView style={styles.contentContainer} edges={['top', 'bottom']}>
        {/* Top: Skip button */}
        <AnimatedPressable
          onPress={handleSkip}
          hitSlop={20}
          style={[styles.skipButton, { opacity: skipButtonOpacity }]}
        >
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </AnimatedPressable>

        {/* Middle: Onboarding Steps Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {ONBOARDING_STEPS.map((step, index) => (
              <View key={index} style={styles.slide}>
                <View style={styles.slideContent}>
                  <Animated.View
                    style={[
                      styles.textContainer,
                      { opacity: index === 0 ? 1 : textOpacity },
                    ]}
                  >
                    <Title align="center" numberOfLines={2}>
                      {t(step.title)}
                    </Title>
                    <View style={styles.spacer} />
                    <Subtitle align="center" numberOfLines={2}>
                      {t(step.subtitle)}
                    </Subtitle>
                    <View style={styles.spacer} />
                    <Body align="center" style={styles.description}>
                      {t(step.description || '')}
                    </Body>
                  </Animated.View>
                  <Animated.View
                    style={[
                      styles.textContainer,
                      styles.textContainerAbsolute,
                      { opacity: index === 0 ? 0 : newTextOpacity },
                    ]}
                  >
                    <Title align="center" numberOfLines={2}>
                      {t(step.title)}
                    </Title>
                    <View style={styles.spacer} />
                    <Subtitle align="center" numberOfLines={2}>
                      {t(step.subtitle)}
                    </Subtitle>
                    <View style={styles.spacer} />
                    <Body align="center" style={styles.description}>
                      {t(step.description || '')}
                    </Body>
                  </Animated.View>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        </View>

        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: dotOpacity(index),
                  transform: [{ scale: dotScale(index) }],
                },
              ]}
            />
          ))}
        </View>

        {/* Bottom: CTA Button */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ opacity: prevButtonOpacity }}>
            <Button
              variant="primary"
              size="large"
              title={buttonText}
              onPress={handleNext}
              testID="onboarding-cta-button"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: StyleSheet.absoluteFillObject,
  gradient: StyleSheet.absoluteFillObject,
  contentContainer: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 12,
    paddingRight: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
  },
  slideContent: {
    paddingHorizontal: 32,
  },
  textContainer: {
    alignItems: 'center',
  },
  textContainerAbsolute: {
    position: 'absolute',
    alignItems: 'center',
  },
  spacer: {
    height: 16,
  },
  description: {
    maxWidth: 280,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
