import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TagInputProps } from '../types';
import { THEME } from '../constants';

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  suggestions,
  onTagsChange,
  placeholder = 'Add tags...',
}) => {
  const [inputText, setInputText] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setInputText('');
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleInputSubmit = () => {
    if (inputText.trim()) {
      addTag(inputText);
    }
  };

  const getFilteredSuggestions = () => {
    if (!inputText) return suggestions;
    return suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(inputText.toLowerCase()) &&
        !tags.includes(suggestion)
    );
  };

  return (
    <View style={styles.container}>
      {/* Selected Tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tag}
              onPress={() => removeTag(tag)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input Field */}
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder={placeholder}
        placeholderTextColor={THEME.colors.textSecondary}
        onSubmitEditing={handleInputSubmit}
        returnKeyType="done"
      />

      {/* Suggestions */}
      {(inputText || suggestions.length > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
        >
          {getFilteredSuggestions().map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestion}
              onPress={() => addTag(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: THEME.spacing.sm,
    gap: THEME.spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.lg,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: THEME.spacing.xs,
  },
  tagRemove: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
  },
  suggestionsContainer: {
    marginTop: THEME.spacing.sm,
  },
  suggestion: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.md,
    marginRight: THEME.spacing.xs,
  },
  suggestionText: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
}); 