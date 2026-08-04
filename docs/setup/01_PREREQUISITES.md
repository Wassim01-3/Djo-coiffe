# Prerequisites

Before cloning and running the Djo Coiffe project, ensure your development environment meets the following requirements. 

## 1. Node.js & Package Manager
The project is built with React 19 and Vite 8, requiring a modern Node environment.
- **Node.js**: Version 20.x LTS or 22.x LTS.
  - *Download*: [Node.js Official Site](https://nodejs.org/)
- **npm**: Version 10.x or higher (comes bundled with Node.js).
  - *Verify*: Run `node -v` and `npm -v` in your terminal.

## 2. Git
Required for version control and cloning the repository.
- **Git**: Version 2.30+
  - *Download*: [Git Official Site](https://git-scm.com/)

## 3. IDE / Code Editor
Visual Studio Code (VS Code) is highly recommended for this project as it seamlessly integrates with TypeScript and ESLint.
- **VS Code**: Latest version
  - *Download*: [VS Code Official Site](https://code.visualstudio.com/)
- **Recommended Extensions**:
  - **ESLint** (dbaeumer.vscode-eslint)
  - **Prettier - Code formatter** (esbenp.prettier-vscode)
  - **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)

## 4. Android Development (For Capacitor)
To build, run, and generate the Android APK for the project, you must have the Android toolchain installed.
- **Android Studio**: "Jellyfish" (2023.3.1) or newer.
  - *Download*: [Android Studio](https://developer.android.com/studio)
- **Java Development Kit (JDK)**: Java 17 is required for modern Capacitor/Gradle builds.
  - *Note*: Android Studio bundles a JDK which is usually sufficient, but if you run CLI builds you may need to install [OpenJDK 17](https://adoptium.net/).
- **Android SDK**: Install SDK API level 34 or 35 via the Android Studio SDK Manager.
- **Android Emulator**: Set up at least one Virtual Device (e.g., Pixel 7 running API 34) in the AVD Manager.

## 5. Web Browser
For debugging the Progressive Web App (PWA) and Service Workers, a Chromium-based browser is required.
- **Google Chrome**: Latest version. Ensure you are familiar with the Chrome DevTools, specifically the "Application" tab for Service Workers.

---
**Next Step:** Once all prerequisites are installed, proceed to [02_PROJECT_INSTALLATION.md](./02_PROJECT_INSTALLATION.md).
