module.exports = {
  expo: {
    name: "Expense Tracker",
    slug: "expense-tracker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#3730A3",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.expensetracker.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4F46E5",
      },
      package: "com.expensetracker.app",
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      apiUrl:
        process.env.API_URL || "https://expense-backend-tnag.onrender.com",
      appName: process.env.APP_NAME || "ExpenseTrackerMobile",
    },
  },
};
