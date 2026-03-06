/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        midnight: "#080E1A",
        "navy-deep": "#0A1628",
        "navy-card": "#0F1D32",
        "navy-raise": "#162A46",
        "navy-border": "#1E3354",
        amber: "#F59E0B",
        honey: "#FBBF24",
        cream: "#FDE68A",
        ember: "#FF6B5A",
        "ember-dim": "#FF8577",
        ash: "#9BA3B5",
        fog: "#C8CDD8",
        success: "#34C97A",
        warning: "#F59E0B",
        danger: "#FF5050",
        info: "#5AC8FA",
      },
      fontFamily: {
        "display": ["Fraunces_900Black"],
        "display-italic": ["Fraunces_900Black_Italic"],
        "body": ["Outfit_400Regular"],
        "body-medium": ["Outfit_500Medium"],
        "body-semibold": ["Outfit_600SemiBold"],
        "body-bold": ["Outfit_700Bold"],
        "body-extrabold": ["Outfit_800ExtraBold"],
        "mono": ["JetBrainsMono_400Regular"],
        "mono-bold": ["JetBrainsMono_700Bold"],
      },
    },
  },
  plugins: [],
};
