# App Branding Assets

This document describes the branding assets for the Expense Tracker mobile app.

## Current Assets

### ✅ App Icon (`icon.png` & `adaptive-icon.png`)

- **Size**: 1024x1024px
- **Design**: Modern gradient (Indigo to Purple) with white wallet icon
- **Location**: `assets/icon.png`, `assets/adaptive-icon.png`
- **Usage**: App launcher icon for iOS and Android

## Configuration

All branding is configured in `app.json`:

```json
{
  "expo": {
    "name": "Expense Tracker",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/icon.png",
      "backgroundColor": "#4F46E5"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      }
    }
  }
}
```

## Brand Colors

- **Primary**: `#4F46E5` (Indigo)
- **Secondary**: `#7C3AED` (Purple)
- **Accent**: `#10B981` (Green - for income)
- **Warning**: `#EF4444` (Red - for expenses)
- **Background**: `#F9FAFB` (Light gray)

## Generating Custom Assets

If you want to create custom splash screens or additional branding:

1. **Splash Screen**: Create a 1080x1920px image with your design
2. **Favicon**: Create a 32x32px or 512x512px icon
3. Place files in `assets/` directory
4. Update paths in `app.json`

## Notes

- The current configuration uses the app icon for both launcher and splash screen
- Background color is set to brand indigo (#4F46E5)
- Adaptive icon is configured for Android with transparent foreground
