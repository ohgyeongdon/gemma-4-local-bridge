const vscode = require('vscode');

function activate(context) {
    const provider = new GemmaViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('gemma-chat-view', provider)
    );

    // Open Command (Editor Tab)
    let disposable = vscode.commands.registerCommand('gemma.open', () => {
        const panel = vscode.window.createWebviewPanel(
            'gemmaChat',
            'Gemma 4 Chat',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            }
        );

        panel.webview.html = provider._getHtmlForWebview(panel.webview);
    });

    context.subscriptions.push(disposable);
}

class GemmaViewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = undefined;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    postMessageToWebview(text) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'ask', text: text });
        }
    }

    _getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'ui', 'app.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'ui', 'style.css'));
        
        // We read the index.html but replace the links
        return `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Gemma 4 Sidebar</title>
                <link rel="stylesheet" href="${styleUri}">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Outfit:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { height: 100vh; overflow: auto; }
                    .sidebar { width: 100%; border-right: none; }
                    .app-container { flex-direction: column; }
                    .chat-interface { height: 100vh; }
                </style>
            </head>
            <body>
                <div class="app-container">
                    <main class="chat-interface">
                        <div class="chat-window" id="chat-window">
                            <div class="message system">
                                <div class="avatar">🤖</div>
                                <div class="content">Gemma 4 사이드바가 활성화되었습니다.</div>
                            </div>
                        </div>
                        <div class="input-area">
                            <div class="input-wrapper">
                                <textarea id="user-input" placeholder="Gemma에게 질문하세요..." rows="1"></textarea>
                                <button id="send-btn">🚀</button>
                            </div>
                        </div>
                    </main>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
