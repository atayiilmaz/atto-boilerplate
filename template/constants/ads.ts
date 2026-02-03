export const AD_UNITS = {
  BANNER: __DEV__
    ? 'ca-app-pub-3940256099942544/6300978111' // Test ad unit
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your ad unit ID
} as const;

export const AD_CONFIG = {
  BANNER_HEIGHT: 50,
} as const;
