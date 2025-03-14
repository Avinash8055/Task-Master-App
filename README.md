
# 🏆  Task Master App  
Task Master app designed for both web and mobile platforms with strong PWA capabilities

---

## 🚀 **Features**  

✅ Daily Tasks – Manage day-to-day tasks.

✅ Planned Tasks – Organize future tasks and events.

✅ Free Time Tasks – Keep track of leisure activities.

✅ Reminders – Timely alerts for pending tasks. 

---

## 🛠️ **Tech Stack**  
- 🌐 **Frontend:** React + TypeScript  
- 🎨 **Styling:** TailwindCSS  
- ⚡ **Build Tool:** Vite  
- 📲 **Mobile:** Capacitor  

---

## 📥 **Installation**  
Follow these steps to set up the project:

### 1️⃣ **Clone the Repository**  
```bash
git clone https://github.com/Avinash8055/Task-Master-App.git
cd Task_Master
```

### 2️⃣ **Install Dependencies**  
```bash
npm install
```

### 3️⃣ **Run the Development Server**  
```bash
npm run dev
```
- Open the app at **http://localhost:5173** in your browser.  

---

## 📲 **Build for Mobile (Android) using Capacitor**  
If you want to modify the code and create a mobile app, follow these steps:

Open a terminal or command prompt in your project directory

### 🧪 **1. Install Capacitor CLI**  
```bash
npm install @capacitor/core @capacitor/cli
```

### 🏗️ **2. Initialize Capacitor**  
```bash
npx cap init 
```
- **App Name:** Password Manager  
- **App ID:** com.example.passwordmanager  

### 📱 **3. Add Android Platform**  
```bash
npx cap add android
```

### 🔄 **4. Sync Changes with Capacitor**  
```bash
npx cap copy
npx cap sync
```

### 🎯 **5. Open in Android Studio**  
```bash
npx cap open android
```

### 🚀 **6. Build and Run**  

Build APK
In Android Studio → `Build > Build Bundle(s) / APK(s) > Build APK(s).`
The generated APK will be available in:

```sh
android/app/build/outputs/apk/debug/app-debug.apk  
```

- Run in Android Studio → `Run > Build > Select Device`  
- Or from the terminal:  
```bash
./gradlew assembleDebug
```



