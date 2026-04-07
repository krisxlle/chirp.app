/**
 * Chirp style guide (aligned with Expo `components/` feed).
 * Use for Vite inline styles and Tailwind arbitrary values.
 */
export const C = {
  deepPurple: '#6A4C92',
  vibrantPurple: '#A240D1',
  magentaPink: '#D94CC2',
  mediumLavender: '#9D8CD9',
  lightBlueGrey: '#BEC6EB',
  paleLavender: '#E2DAFF',
  softPeach: '#FDEADF',
  dustyRose: '#E1A0C3',
} as const;

/** Primary CTA / FAB / tab pill (lavender → magenta) */
export const brandGradient = 'linear-gradient(135deg, #9D8CD9, #D94CC2)';

export const font = {
  heading: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700 as const },
  body: { fontFamily: "'Inter', sans-serif", fontWeight: 400 as const },
  bodyMedium: { fontFamily: "'Inter', sans-serif", fontWeight: 500 as const },
} as const;
