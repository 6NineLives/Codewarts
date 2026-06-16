import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

type SubmitRecordingModalProps = {
  visible: boolean;
  videoUri: string | null;
  defaultTitle?: string;
  onCancel: () => void;
  onSubmit: (title: string, description: string) => void;
};

export function SubmitRecordingModal({
  visible,
  videoUri,
  defaultTitle = '',
  onCancel,
  onSubmit,
}: SubmitRecordingModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(defaultTitle);
      setDescription('');
    }
  }, [defaultTitle, visible]);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSubmit(trimmedTitle, description.trim());
    setTitle('');
    setDescription('');
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-cream rounded-t-[28px] px-6 pt-6 pb-10">
          <Text className="text-charcoal font-jua text-xl mb-1">Share your sign</Text>
          <Text className="text-charcoal/70 font-jua text-sm mb-5">
            Add a title and description so others can find your video on Discover.
          </Text>

          <Text className="text-charcoal font-jua text-xs mb-2">Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Magandang umaga"
            placeholderTextColor="#1A1A1A66"
            className="bg-white border border-charcoal/10 rounded-2xl px-4 py-3 font-jua text-charcoal mb-4"
            maxLength={80}
            autoFocus
          />

          <Text className="text-charcoal font-jua text-xs mb-2">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What does this sign mean or when do you use it?"
            placeholderTextColor="#1A1A1A66"
            className="bg-white border border-charcoal/10 rounded-2xl px-4 py-3 font-jua text-charcoal mb-6 min-h-[96px]"
            multiline
            textAlignVertical="top"
            maxLength={240}
          />

          {videoUri ? (
            <Text className="text-charcoal/50 font-jua text-[10px] mb-4" numberOfLines={1}>
              Video saved locally and ready to publish.
            </Text>
          ) : null}

          <View className="flex-row gap-3">
            <Pressable
              onPress={handleCancel}
              className="flex-1 rounded-full border border-charcoal/20 py-3 items-center"
              accessibilityRole="button"
              accessibilityLabel="Discard recording"
            >
              <Text className="text-charcoal font-jua text-base">Discard</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!title.trim()}
              className={`flex-1 rounded-full py-3 items-center ${
                title.trim() ? 'bg-forestGreen' : 'bg-forestGreen/40'
              }`}
              accessibilityRole="button"
              accessibilityLabel="Publish to Discover"
            >
              <Text className="text-cream font-jua text-base">Publish</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
