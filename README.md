# Kaizoku Mobile 🏴‍☠️

Kaizoku Mobile is a premium, cinematic-focused anime streaming application built with React Native and Expo. It serves as the mobile client for the Kaizoku platform, delivering high-fidelity HLS streaming, seamless file-based navigation, and a modern, fluid user interface.

## 🌟 Features

- **Cinematic UI/UX:** A stunning dark-mode aesthetic with dynamic micro-interactions, soft pill tab indicators, and fluid screen transitions (powered by `react-native-reanimated`).
- **High-Performance Video Playback:** Native HLS streaming support using `react-native-video` to handle complex master playlists and secure CDN delivery.
- **Robust State Management:** Blazing fast global state management with `Zustand`, persisted locally using the ultra-fast `react-native-mmkv` storage (e.g., Watch History).
- **Advanced Discovery:** Filter and explore anime by genres, newest releases, popularity, and ratings with an intuitive search layout.
- **Loading States & Skeletons:** Premium pulsing skeleton loaders provide a polished experience even during network latency.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) & [Expo SDK 53](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Local Storage:** [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **Animations:** [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Video Player:** `react-native-video` (Native module)

## 🚀 Getting Started

Because Kaizoku Mobile utilizes native modules like `react-native-video`, it **cannot** be run using the standard Expo Go app. Instead, we use a **Custom Development Client** compiled via Expo Application Services (EAS). You do **not** need Android Studio installed locally.

### Prerequisites
- Node.js (v18+)
- EAS CLI: `npm install -g eas-cli`

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Custom Dev Client (Android)
Let Expo's cloud servers handle the heavy lifting of compiling the native Android app:
```bash
eas build --profile development --platform android
```
*Once the build finishes, scan the QR code to install the `.apk` on your physical device or emulator.*

### 3. Start the Development Server
With the custom dev client installed on your device, start the Metro bundler to enable live hot-reloading:
```bash
npx expo start --dev-client
```

## 📂 Project Structure

```text
kaizoku-mobile/
├── app/                  # Expo Router file-based screens
│   ├── (tabs)/           # Bottom Tab Navigator (Home, Browse, History)
│   ├── anime/            # Anime Details screens
│   ├── player/           # Fullscreen HLS Video Player
│   └── _layout.tsx       # Root layout and global providers
├── src/
│   ├── api/              # Axios configurations and backend data fetching
│   ├── components/       # Reusable UI components (AnimeCard, Skeletons, etc.)
│   ├── constants/        # Centralized theme tokens (Colors, Spacing, Typography)
│   ├── store/            # Zustand global stores (History, UI state)
│   └── types/            # TypeScript interfaces and models
├── app.json              # Expo configuration
└── eas.json              # EAS Build profiles
```

## 🤝 Contributing

Contributions are welcome! Please ensure that any UI additions strictly adhere to the cinematic, dark-themed design system defined in `src/constants/theme.ts`.

## 📄 License

This project is licensed under the MIT License.
