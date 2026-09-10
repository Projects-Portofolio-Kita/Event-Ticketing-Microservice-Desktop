# TickId Desktop

A lightweight, cross-platform desktop client for the **TickId Event Ticketing Microservice Platform**, built with [Tauri v2](https://v2.tauri.app/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/).

---

## 🚀 Tech Stack

- **Desktop Framework**: [Tauri v2](https://v2.tauri.app/) (Rust backend core)
- **Frontend Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) & [Rust](https://www.rust-lang.org/)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **IPC Protocol**: Tauri Invoke API / Plugins

---

## 📋 Prerequisites

Before running the desktop application, ensure you have the following installed on your development machine:

### 1. Node.js & Package Manager
- **Node.js**: Version 18 or higher (LTS recommended).
- **npm**: Version 9 or higher (bundled with Node.js).

Check your installation:
```bash
node -v
npm -v
```

> [!TIP]
> **No C++ Build Tools or Rust needed locally!**
> You can develop and test the entire user interface locally in your browser with `npm run dev`. Native Windows desktop packages (`.exe`, `.msi`) are compiled automatically in the cloud via **GitHub Actions**. Installing Rust and Microsoft C++ Build Tools is only needed if you want to compile native desktop binaries directly on your local machine.

### 2. Rust & C++ Build Tools (Optional for Local Desktop Compilation)

If you wish to compile the native desktop binaries locally:

#### Windows
1. **Microsoft C++ Build Tools**:
   - Download and install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
   - During installation, select the workload: **"Desktop development with C++"**.
2. **Rust Toolchain**:
   - Install Rust via [rustup.rs](https://rustup.rs/):
     - Download and run `rustup-init.exe`.
     - Follow the standard installation prompts (Default option 1: `x86_64-pc-windows-msvc`).
   - Reopen your terminal and verify:
     ```bash
     rustc --version
     cargo --version
     ```
3. **WebView2**:
   - Built into Windows 10 (version 1803+) and Windows 11. If on older versions, install the [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

#### macOS & Linux
Refer to the official [Tauri Prerequisites Guide](https://v2.tauri.app/start/prerequisites/) for your operating system.

---

## 🛠️ Getting Started

### 1. Install Dependencies

Install the frontend and Tauri CLI dependencies:

```bash
npm install
```

### 2. Run Development Server

To start the desktop application in development mode with live reload:

```bash
npm run tauri dev
```

> **Note**: The first time you run this command, Cargo will download and compile all Rust dependencies, which may take several minutes. Subsequent builds will be incremental and much faster.

If you only want to work on the UI components in a standard web browser:

```bash
npm run dev
```
The Vite dev server will start at `http://localhost:1420`.

---

## 📦 Building for Production

### Option A: Automated Cloud Build via GitHub Actions (Recommended)
You do not need any local C++ tools to produce the final installer:
1. Push your commits to the `main` or `master` branch on GitHub (or trigger the **"Build & Release Desktop App"** workflow manually under the **Actions** tab).
2. GitHub's Windows runner will automatically compile the Rust backend and bundle the installer.
3. Download the compiled `.exe` / `.msi` directly from the workflow's **Artifacts** section or GitHub **Releases** (when tagging a release, e.g., `git tag v0.1.0 && git push --tags`).

### Option B: Local Compilation
If you have installed Rust and Microsoft C++ Build Tools locally:

```bash
npm run tauri build
```

The generated application bundles and executables will be located in:
```
src-tauri/target/release/bundle/
```

---

## 📂 Project Structure

```text
desktop/
├── .vscode/               # VS Code workspace settings & recommended extensions
├── public/                # Static public assets
├── src/                   # React frontend application
│   ├── assets/            # Frontend images, icons, and styles
│   ├── App.css            # Root styles
│   ├── App.tsx            # Main React component & Tauri IPC examples
│   └── main.tsx           # React DOM entry point
├── src-tauri/             # Rust native core
│   ├── capabilities/      # Tauri v2 security capabilities & permissions
│   ├── icons/             # Application icons for various platforms
│   ├── src/
│   │   ├── lib.rs         # Tauri application builder & command handlers
│   │   └── main.rs        # Native desktop executable entry point
│   ├── Cargo.toml         # Rust crate manifest and dependencies
│   └── tauri.conf.json    # Tauri project configuration & window settings
├── index.html             # Main HTML entry file
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript compiler configuration
├── vite.config.ts         # Vite build tool and server configuration
└── README.md              # Project documentation
```

---

## 🧩 Useful Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Vite frontend development server only |
| `npm run build` | Compiles TypeScript and builds the production frontend |
| `npm run preview` | Previews the production frontend build locally |
| `npm run tauri dev` | Runs the full desktop application in development mode |
| `npm run tauri build` | Builds the native production installer and binary |
| `npx tauri info` | Shows environment and dependency information for debugging |

---

## 💡 Recommended IDE Setup

- **IDE**: [Visual Studio Code](https://code.visualstudio.com/)
- **Extensions**:
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) *(if using Tailwind)*
