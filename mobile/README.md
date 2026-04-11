# Expense Tracker Mobile App

React Native (Expo) mobile application for personal expense tracking.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app on physical device)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your API URL:
   - **Production**: `API_URL=https://voxelry.duckdns.org/expensetracker`
   - **Local Development**: `API_URL=http://localhost:8000`
   - **Android Emulator**: `API_URL=http://10.0.2.2:8000`

3. **Start the app:**

   ```bash
   npx expo start
   ```

4. **Run on device:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 📱 Features

- **Dashboard**: Real-time financial overview with balance, income, and expense tracking
- **Expenses**: Add, view, and manage expenses with categories
- **Income**: Track income sources
- **Loans**: Manage money given/taken
- **Budgets**: Set and monitor spending limits
- **Premium UI**: Modern gradient design with smooth animations

## 🔧 Configuration

### Environment Variables

| Variable   | Description          | Example                                      |
| ---------- | -------------------- | -------------------------------------------- |
| `API_URL`  | Backend API endpoint | `https://voxelry.duckdns.org/expensetracker` |
| `APP_NAME` | Application name     | `ExpenseTrackerMobile`                       |

### Switching Between Environments

**For Production:**

```env
API_URL=https://voxelry.duckdns.org/expensetracker
```

**For Local Development:**

```env
API_URL=http://localhost:8000
```

**For Android Emulator:**

```env
API_URL=http://10.0.2.2:8000
```

> **Note**: After changing `.env`, restart the Metro bundler (press `r` in terminal or reload app).

## 📂 Project Structure

```
mobile/
├── src/
│   ├── api/           # Axios configuration
│   ├── context/       # React Context (Auth)
│   ├── navigation/    # Navigation setup
│   ├── screens/       # App screens
│   └── services/      # API service layer
├── .env               # Environment variables (gitignored)
├── .env.example       # Environment template
├── App.js             # Entry point
└── package.json       # Dependencies
```

## 🎨 Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **State Management**: React Context
- **HTTP Client**: Axios
- **UI**: Custom components with Linear Gradients
- **Icons**: Ionicons

## 🔐 Authentication

The app uses token-based authentication (Laravel Sanctum):

1. Login/Register to receive a token
2. Token is stored in AsyncStorage
3. Auto-attached to all API requests
4. Auto-login on app restart

## 📝 Development Notes

- **Hot Reload**: Enabled by default in Expo
- **Debugging**: Shake device → "Debug Remote JS"
- **Clear Cache**: `npx expo start -c`

## 🚢 Building for Production

```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

## 📄 License

MIT
