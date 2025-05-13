# 🌟 TWITTER-DETOXIFY 🚀

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/KunjShah95/TWITTER-DETOXIFY?style=for-the-badge)
![Repo Stars](https://img.shields.io/github/stars/KunjShah95/TWITTER-DETOXIFY?style=for-the-badge)
![Contributors](https://img.shields.io/github/contributors/KunjShah95/TWITTER-DETOXIFY?style=for-the-badge)

---

## ✨ Overview

**TWITTER-DETOXIFY** is a lightweight browser extension that enhances your Twitter/X experience. It lets you filter out distracting or toxic content, schedule focus periods by blocking access, and gain insight into how your feed is curated — all with a user-friendly interface. 🌈

---

## ⚙️ Features

- ✅ **Site Blocker** – Block access to Twitter/X for a specified time to boost focus.
- ✅ **Keyword Filtering** – Hide tweets containing certain keywords or phrases.
- ✅ **User Blocking** – Remove tweets from specific users (by username).
- ✅ **Content-Type Filtering** – Hide tweets with images or videos.
- ✅ **Detox Summary** – View real-time stats about filtered content.
- ✅ **Popup Interface** – Easily accessible via the browser toolbar.
- ✅ **Persistent Settings** – All preferences are saved locally.

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript (Vanilla)
- **Browser APIs**: Chrome Storage, Messaging, Scripting
- **Build Tools**: Node.js, npm (used for Tailwind builds only)

---

## 🚀 Getting Started

### Prerequisites

- A Chromium-based browser (e.g., Chrome, Edge, Brave)
- [Node.js](https://nodejs.org/) and npm (only required for customizing styles)

---

### 🧩 Installation (No Code Changes)

> _If you only want to use the extension and **don’t plan to modify any styles**, follow these steps:_

1. **Clone the repository**:
    ```bash
    git clone https://github.com/KunjShah95/TWITTER-DETOXIFY.git
    cd TWITTER-DETOXIFY
    ```

2. **Load the Extension in Your Browser**:
    - Open your browser and go to:
      - Chrome/Edge: `chrome://extensions/`
      - Brave: `brave://extensions/`
    - Enable **Developer Mode** (top right toggle).
    - Click **"Load unpacked"** and select the `src/` folder.

You're all set! 🎉 The extension icon should now appear in your toolbar.

---

### 🧑‍💻 Installation (For Developers or Style Customization)

> _If you want to edit Tailwind CSS or change the UI, follow these steps:_

1. **Install dependencies**:
    ```bash
    npm install
    ```

2. **Build the CSS**:
    ```bash
    npm run build:css
    ```

3. (Optional) **Watch for changes** while developing:
    ```bash
    npm run watch:css
    ```

4. Follow the **load extension** instructions above to use the updated build.

---

## 📖 Usage

1. **Open the Extension** – Click the Detoxifier icon in your browser.

2. **Site Blocker** – Set hours and minutes to temporarily block Twitter/X.

3. **Keyword Filter** – Enter one keyword/phrase per line, then save.

4. **User Blocker** – Enter one username per line (no `@`), then save.

5. **Content Filter** – Toggle checkboxes to hide tweets with images/videos.

6. **Detox Summary** – View and reset counts for filtered tweets.

> 💡 **Tip**: Refresh the Twitter page to apply filter changes instantly.

---

## 💻 Project Structure

All code lives inside the `src/` folder:

| File/Folder         | Purpose |
|---------------------|---------|
| `popup.html/js`     | UI and logic for popup |
| `background.js`     | Timer, inter-script messaging |
| `content.js/css`    | DOM manipulation, filtering |
| `manifest.json`     | Extension metadata and permissions |
| `input.css`         | Tailwind CSS source |
| `output.css`        | Compiled stylesheet (used by extension) |

---

## 🌈 CSS Development

If you're editing styles:

1. Install dependencies: `npm install`
2. Build once: `npm run build:css`
3. Or auto-watch: `npm run watch:css`

Tailwind config lives in:
- `tailwind.config.js`
- `postcss.config.js`

---

## 🔮 Future Plans

- 🔜 **AI-based Filtering** (advanced NLP for toxicity detection)
- 🔜 **Multi-Language Support**
- 🔜 **Import/Export Settings**
- 🔜 **Dark Mode Toggle** (dedicated UI setting)
- 🔜 **Improved UX**

---

## 🤝 Contributing

1. **Fork** the repo
2. Create a branch:
    ```bash
    git checkout -b feature/your-feature
    ```
3. Commit with clear messages:
    ```bash
    git commit -m "Add: New feature"
    ```
4. Push and open a PR:
    ```bash
    git push origin feature/your-feature
    ```

Please follow the existing code style and keep the UI responsive.

---

## 🛡️ License

This project is under the [MIT License](LICENSE).

---

## 📬 Contact

**Kunj Shah**

- GitHub: [@KunjShah95](https://github.com/KunjShah95)
- Email: `kunjshah572005@example.com` 
---

## 🙏 Acknowledgments

- Thanks to the open-source community 🙌
- Special gratitude to contributors and users who provide feedback ❤️

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/KunjShah95">KunjShah95</a>
</div>
