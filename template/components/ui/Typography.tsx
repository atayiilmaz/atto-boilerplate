import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type TypographyVariant = 'title' | 'subtitle' | 'body' | 'caption';
export type TypographyColor = 'primary' | 'secondary' | 'accent' | 'error';

interface TypographyPropsBase {
  color?: TypographyColor;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  style?: object;
  numberOfLines?: number;
  testID?: string;
}

interface TypographyProps extends TypographyPropsBase {
  variant: TypographyVariant;
}

const FONT_SIZES: Record<TypographyVariant, number> = {
  title: 28,
  subtitle: 20,
  body: 17,
  caption: 13,
};

const FONT_WEIGHTS: Record<TypographyVariant, '700' | '600' | '400' | '500'> = {
  title: '700',
  subtitle: '600',
  body: '400',
  caption: '500',
};

export function Title({ children, color = 'primary', align, style, numberOfLines, testID }: TypographyPropsBase) {
  return (
    <Typography
      variant="title"
      color={color}
      align={align}
      style={style}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Typography>
  );
}

export function Subtitle({ children, color = 'primary', align, style, numberOfLines, testID }: TypographyPropsBase) {
  return (
    <Typography
      variant="subtitle"
      color={color}
      align={align}
      style={style}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Typography>
  );
}

export function Body({ children, color = 'primary', align, style, numberOfLines, testID }: TypographyPropsBase) {
  return (
    <Typography
      variant="body"
      color={color}
      align={align}
      style={style}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Typography>
  );
}

export function Caption({ children, color = 'secondary', align, style, numberOfLines, testID }: TypographyPropsBase) {
  return (
    <Typography
      variant="caption"
      color={color}
      align={align}
      style={style}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Typography>
  );
}

export function Typography({
  variant,
  color = 'primary',
  align = 'left',
  children,
  style,
  numberOfLines,
  testID,
}: TypographyProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getColor = (): string => {
    switch (color) {
      case 'primary': return colors.text;
      case 'secondary': return colors.text.replace('#ffffff', '#8e8e93').replace('#000000', '#8e8e93');
      case 'accent': return colors.primary;
      case 'error': return '#FF3B30';
    }
  };

  return (
    <Text
      testID={testID}
      style={[
        {
          fontSize: FONT_SIZES[variant],
          fontWeight: FONT_WEIGHTS[variant],
          color: getColor(),
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
