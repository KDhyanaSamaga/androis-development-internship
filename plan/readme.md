# Studify (StudyIO) - Complete Project Documentation

Studify is a comprehensive student productivity application built with **React Native (v0.62.3)**. It is designed to help students manage their academic life through attendance tracking, task management, timetable organization, and focus-enhancing tools.

## 🚀 Core Features

### 1. Dashboard (Main Hub)
- **Overview**: Centralized view of all student metrics.
- **Attendance Summary**: Displays the overall attendance percentage with dynamic feedback messages.
- **Task Counter**: Real-time tracking of pending tasks.
- **Timetable Status**: Quick check if the weekly schedule has been uploaded.

### 2. Attendance Tracker
- **Subject Management**: Users can add and delete their subjects.
- **Live Tracking**: Mark subjects as 'Present' or 'Absent' with a single tap.
- **Percentage Calculation**: Automated per-subject and overall attendance monitoring to ensure students stay above their required threshold.

### 3. Task Manager
- **Task CRUD**: Add, view, and complete tasks.
- **Persistence**: Tasks are saved locally and persist even after the app is closed.
- **Optimized Performance**: Large lists are optimized for smooth scrolling on all device types.

### 4. Timetable Management
- **Image-Based Schedule**: Allows students to upload a photo of their timetable for quick reference.
- **Zoom Support**: Integrated `PhotoView` allows zooming in on small text in schedule images.

### 5. Focus Music (Concentrate)
- **Curated Tracks**: Built-in player with curated tracks designed for meditation and study focus.
- **Full Player Controls**: Play, pause, seek, and skip tracks with a premium UI.

---

## 🛠️ Technical Architecture

### Data Persistence
The app uses **AsyncStorage** for all local data storage. We have implemented a robust JSON-based storage layer to ensure data integrity:
- `SUBJECTS`: JSON array of student subjects.
- `TASKS`: JSON array of task objects.
- `PRESENT_COUNT` / `TOTAL_COUNT`: Synchronized arrays tracking attendance hits.
- `Image_id_1` / `Image_id_2`: URIs for the timetable and profile photos.

### Build Optimization
- **JS Bundling**: Configured `bundleInDebug: true` to ensure the app works "offline" without a development server.
- **Proguard**: Enabled code shrinking and optimization for faster execution and smaller APK size (~30MB).
- **Hermes/JSC**: Reverted to JavaScriptCore (JSC) for maximum compatibility with modern ARM64 chipsets (Redmi, CMF, etc.).

---

## 🔧 Critical Fixes Applied

During the development and debugging phase, the following major issues were resolved:

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Build Failure** | Incompatible Java Version | Forced the environment to use **JDK 8**, as the legacy Gradle 6.0.1 cannot run on modern Java 17/21. |
| **Missing SDK** | Incorrect `local.properties` | Configured the `sdk.dir` to point to the local Android SDK path. |
| **Splash Screen Hang** | Missing JS Bundle | Enabled JS bundling in debug builds so the app doesn't wait for a dev server that isn't there. |
| **Silent JS Crash** | Legacy Hermes Engine | Disabled Hermes in favor of JSC to prevent crashes on modern ARM64 devices. |
| **OpenSSL Error** | Node.js v17+ incompatibility | Implemented the `--openssl-legacy-provider` flag for the Metro bundler. |
| **Dependency Conflict** | Missing `@react-native-community/slider` | Patched `SeekBar.js` to use the correctly installed `react-native-slider` package. |
| **Missing Libs** | Deprecated JCenter Repos | Manually updated build scripts to use **Maven Central** and **JitPack** for missing libraries. |

---

## 💻 Environment Requirements

To build or modify this project, ensure you have:
- **Node.js**: v16+ (requires `openssl-legacy-provider` for higher versions).
- **JDK**: Version 1.8 (Java 8).
- **Android SDK**: Build Tools 28.0.3, Platform 28.
- **Gradle**: 6.0.1.

---
**Developed with Antigravity** | Google DeepMind
