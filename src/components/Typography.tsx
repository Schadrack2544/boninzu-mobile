import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TextProps,
  TextInputProps,
  TextStyle,
} from 'react-native';

/**
 * Poppins is embedded through the expo-font config plugin (see app.json).
 * On Android a custom font family does not respond to `fontWeight`, so every
 * weight is its own font file. These wrappers translate the `fontWeight`
 * used throughout the style sheets into the matching Poppins family.
 */
export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

const familyForWeight = (weight?: TextStyle['fontWeight']): string => {
  switch (String(weight ?? '400')) {
    case '500':
      return fonts.medium;
    case '600':
      return fonts.semiBold;
    case '700':
    case '800':
    case '900':
    case 'bold':
      return fonts.bold;
    default:
      return fonts.regular;
  }
};

export const withPoppins = (style: TextProps['style']): TextStyle => {
  const { fontWeight, fontFamily, ...rest } = (StyleSheet.flatten(style) || {}) as TextStyle;
  return { ...rest, fontFamily: fontFamily ?? familyForWeight(fontWeight) };
};

export const Text = forwardRef<RNText, TextProps>(({ style, ...props }, ref) => (
  <RNText ref={ref} {...props} style={withPoppins(style)} />
));
Text.displayName = 'Text';

// The inputs sit on white cards, so don't inherit the system (possibly dark) theme colours.
export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ style, placeholderTextColor = '#9ca3af', ...props }, ref) => (
    <RNTextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor}
      {...props}
      style={withPoppins([{ color: '#111827' }, style])}
    />
  )
);
TextInput.displayName = 'TextInput';
