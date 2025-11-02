/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Blue-focused professional palette
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Your hero blue
          600: "#0284c7",
          700: "#0369a1", // Darker blue for accents
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        accent: {
          50: "#fef7ff",
          100: "#fcefff",
          200: "#f8e4ff",
          300: "#f3caff",
          400: "#ea9fff",
          500: "#dd6bff", // Complementary purple
          600: "#c241ff",
          700: "#a31cff",
          800: "#8512e6",
          900: "#6b0fb8",
        },
      },
      backgroundImage: {
        "hero-blue": "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
        "section-light": "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        "blue-fade": "linear-gradient(180deg, #0ea5e9 0%, #f0f9ff 100%)",
        "professional-light":
          "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-in-left": "slideInLeft 0.5s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        "soft-blue": "0 4px 14px 0 rgba(14, 165, 233, 0.1)",
        "medium-blue": "0 8px 25px 0 rgba(14, 165, 233, 0.15)",
        "card-hover": "0 10px 40px -10px rgba(14, 165, 233, 0.2)",
      },
    },
  },
  plugins: [],
};
