import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { THEME, ACTIVITY_CATEGORIES } from '../constants';

interface CategoryDropdownProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  label?: string;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  selectedCategory,
  onCategorySelect,
  label = 'Activity Category',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategoryInfo = ACTIVITY_CATEGORIES.find(cat => cat.key === selectedCategory);

  const handleCategorySelect = (categoryKey: string) => {
    onCategorySelect(categoryKey);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          {selectedCategoryInfo && (
            <View 
              style={[
                styles.colorIndicator, 
                { backgroundColor: selectedCategoryInfo.color }
              ]} 
            />
          )}
          <Text style={styles.buttonText}>
            {selectedCategoryInfo ? selectedCategoryInfo.label : 'Select a category'}
          </Text>
        </View>
        <Text style={[styles.arrow, isOpen && styles.arrowUp]}>▼</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayBackground} 
            onPress={() => setIsOpen(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdown}>
            <ScrollView style={styles.dropdownContent} nestedScrollEnabled>
              {ACTIVITY_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.dropdownItem,
                    selectedCategory === category.key && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleCategorySelect(category.key)}
                  activeOpacity={0.7}
                >
                  <View 
                    style={[
                      styles.colorIndicator, 
                      { backgroundColor: category.color }
                    ]} 
                  />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedCategory === category.key && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
    zIndex: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: THEME.spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    color: THEME.colors.text,
  },
  arrow: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    transform: [{ rotate: '0deg' }],
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownContent: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: THEME.colors.surface,
  },
  dropdownItemText: {
    fontSize: 16,
    color: THEME.colors.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: THEME.colors.primary,
  },
}); 