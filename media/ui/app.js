const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const ollamaStatus = document.getElementById('ollama-status');

const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gemma4:e4b';

let isGenerating = false;
let abortController = null;

// Icons
const SEND_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
const STOP_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>`;

// Listen for messages from VS Code extension
window.addEventListener('message', event => {
    const message = event.data;
    if (message.type === 'ask') {
        userInput.value = message.text;
        sendMessage();
    }
});

// Auto-resize textarea and dynamic border radius
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    const newHeight = userInput.scrollHeight;
    userInput.style.height = Math.min(newHeight, 150) + 'px';
    
    // Dynamic border-radius logic
    const wrapper = document.querySelector('.input-wrapper');
    const baseHeight = 46;
    const maxDecrease = 15;
    
    let newRadius = 23 - Math.min(maxDecrease, (newHeight - baseHeight) / 4);
    if (newHeight > baseHeight) {
        wrapper.style.borderRadius = `${newRadius}px`;
    } else {
        wrapper.style.borderRadius = '23px';
    }
});

function addMessage(role, text) {
    document.body.classList.add('has-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = text;
    
    msgDiv.appendChild(content);
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return content;
}

async function sendMessage() {
    if (isGenerating) {
        if (abortController) abortController.abort();
        return;
    }

    const text = userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInput.value = '';
    userInput.style.height = '46px';
    document.querySelector('.input-wrapper').style.borderRadius = '23px';

    // State change to Generating
    isGenerating = true;
    sendBtn.classList.add('generating');
    sendBtn.innerHTML = STOP_ICON;
    abortController = new AbortController();

    const aiMsgContent = addMessage('ai', '');
    
    try {
        const response = await fetch(OLLAMA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortController.signal,
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: text,
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (!line) continue;
                try {
                    const data = JSON.parse(line);
                    aiMsgContent.textContent += data.response;
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                } catch (e) {}
            }
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            aiMsgContent.textContent += ' [작성 중단됨]';
        } else {
            aiMsgContent.textContent = '에러: Ollama 서버에 연결할 수 없습니다.';
        }
    } finally {
        isGenerating = false;
        sendBtn.classList.remove('generating');
        sendBtn.innerHTML = SEND_ICON;
        abortController = null;
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
