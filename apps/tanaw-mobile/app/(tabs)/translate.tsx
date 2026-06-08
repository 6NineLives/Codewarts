import * as Speech from 'expo-speech';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { TranslateActionRow } from '@/components/translate/speak-button';
import { TranslationCard } from '@/components/translate/translation-card';
import {
  getDemoScenario,
  nextDemoScenarioIndex,
} from '@/mocks/translate-demo';

export default function TranslateScreen() {
  const [scenarioIndex, setScenarioIndex] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scenario = getDemoScenario(scenarioIndex) ?? getDemoScenario(0)!;
  const transcript = scenario.transcript || 'Magandang Umaga!';

  const cycleScenario = useCallback(() => {
    setScenarioIndex((current) => nextDemoScenarioIndex(current));
  }, []);

  const speakTranslation = useCallback(() => {
    if (!transcript || isSpeaking) return;

    setIsSpeaking(true);
    Speech.speak(transcript, {
      language: 'fil-PH',
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [isSpeaking, transcript]);

  return (
    <View className="flex-1 bg-cream">
      <View className="absolute top-0 left-0 right-0 z-10">
        <TanawAppBar variant="overlay" />
      </View>

      <Pressable className="flex-1" onPress={cycleScenario}>
        <View className="flex-1 bg-charcoal/90 items-center justify-center pt-24 pb-8">
          <Text className="text-cream/50 font-jua text-sm">Camera preview (Phase 1 mock)</Text>
          <Text className="text-cream font-jua text-base mt-2 text-center px-8">
            Tap anywhere to cycle demo scenario {scenarioIndex + 1}/6
          </Text>
        </View>
      </Pressable>

      <View className="absolute left-0 right-0 bottom-6">
        <TranslationCard transcript={transcript} onPress={cycleScenario} />
        <View className="mt-4">
          <TranslateActionRow onSpeak={speakTranslation} isSpeaking={isSpeaking} />
        </View>
      </View>
    </View>
  );
}
