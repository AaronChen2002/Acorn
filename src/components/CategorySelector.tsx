import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { THEME, ACTIVITY_CATEGORIES } from '../constants';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  label?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  label = 'Activity Category',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {ACTIVITY_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              { borderColor: category.color },
              selectedCategory === category.key && {
                backgroundColor: category.color,
              },
            ]}
            onPress={() => onCategorySelect(category.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.key && styles.categoryTextSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingRight: THEME.spacing.md,
  },
  categoryButton: {
    borderWidth: 2,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    marginRight: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  categoryTextSelected: {
    color: 'white',
  },
}); 