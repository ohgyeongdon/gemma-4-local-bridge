# 💠 Gemma 4 Local Bridge for VS Code / Antigravity

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Gemma 4 Local Bridge는 로컬 환경에서 구동되는 **Ollama(Gemma 4)** 모델을 VS Code 또는 안티그래비티(Antigravity) 에디터의 사이드바에서 즉시 사용할 수 있게 해주는 확장 프로그램입니다.

## ✨ Key Features

- **Activity Bar Icon**: Dedicated 💠 icon in the activity bar for quick access.
- **Premium UI**: Sleek dark mode interface with glassmorphism design.
- **Privacy First**: Direct connection to your local Ollama API (no data sent to cloud).
- **TUI Mode**: Includes a Terminal User Interface version (Claude Code style).

## 🚀 Installation

### 1. Prerequisites
- [Ollama](https://ollama.com/) installed and running.
- Gemma 4 model pulled: `ollama pull gemma4:e4b`
- **CORS Setup**: You must set the environment variable `OLLAMA_ORIGINS="*"` and restart Ollama to allow the webview to communicate with the local API.

### 2. Extension Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/gemma-4-local-bridge.git
   ```
2. Copy the `gemma_extension` folder to your VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions`
   - **macOS/Linux**: `~/.vscode/extensions`
3. Restart VS Code or Antigravity.

## 🛠️ Development

This project consists of two parts:
- **Webview UI**: Located in `index.html` and `app.js`.
- **TUI (Terminal UI)**: Run `python gemma_tui.py` for a CLI experience.

## 📄 License

This project is licensed under the MIT License.

---
**Developed by Kodari (AI Principal Developer)**
