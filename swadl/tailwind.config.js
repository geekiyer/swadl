/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds (CSS variable driven for light/dark)
        "screen-bg": "rgb(var(--color-screen-bg) / <alpha-value>)",
        "card-bg": "rgb(var(--color-card-bg) / <alpha-value>)",
        "raised-bg": "rgb(var(--color-raised-bg) / <alpha-value>)",
        "border-main": "rgb(var(--color-border) / <alpha-value>)",
        // Text (CSS variable driven)
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-body": "rgb(var(--color-text-body) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        "text-placeholder": "rgb(var(--color-text-placeholder) / <alpha-value>)",
        // Category accents (static)
        "feed-primary": "#E88A30",
        "feed-bg": "#FFF3E4",
        "feed-border": "#F5DFC0",
        "diaper-primary": "#3A8A55",
        "diaper-bg": "#EDF8F0",
        "diaper-border": "#C0E8CE",
        "sleep-primary": "#4A5A9A",
        "sleep-bg": "#EDF0FA",
        "sleep-border": "#C0C8E8",
        "pump-primary": "#B85A5E",
        "pump-bg": "#FDEFF0",
        "pump-border": "#F0C8CA",
        "growth-primary": "#6A5AAA",
        "growth-bg": "#F0F0FD",
        "growth-border": "#C8C4F0",
        "routine-primary": "#8A7A30",
        "routine-bg": "#FFF8E8",
        "routine-border": "#E8DCA0",
        // Semantic
        success: "#34C97A",
        warning: "#E88A30",
        danger: "#FF5050",
        info: "#5AC8FA",
      },
      fontFamily: {
        "display": ["Baloo2_800ExtraBold"],
        "display-bold": ["Baloo2_700Bold"],
        "body": ["Nunito_400Regular"],
        "body-medium": ["Nunito_500Medium"],
        "body-semibold": ["Nunito_600SemiBold"],
        "body-bold": ["Nunito_700Bold"],
        "body-extrabold": ["Nunito_800ExtraBold"],
        "mono": ["JetBrainsMono_400Regular"],
        "mono-bold": ["JetBrainsMono_700Bold"],
      },
    },
  },
  plugins: [],
};
