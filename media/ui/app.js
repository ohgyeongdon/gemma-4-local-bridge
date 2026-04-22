const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const ollamaStatus = document.getElementById('ollama-status');
const clearBtn = document.getElementById('clear-chat');

// Listen for messages from VS Code extension
window.addEventListener('message', event => {
    const message = event.data;
    if (message.type === 'ask') {
        userInput.value = message.text;
        sendMessage();
    }
});

const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gemma4:e4b';

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Check Ollama Status
async function checkStatus() {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            ollamaStatus.textContent = 'Online';
            ollamaStatus.className = 'value online';
        } else {
            throw new Error();
        }
    } catch (err) {
        ollamaStatus.textContent = 'Offline';
        ollamaStatus.className = 'value offline';
    }
}

checkStatus();
setInterval(checkStatus, 10000);

// Add message to UI
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
}

// Send message to Ollama
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing';
    typingIndicator.id = 'typing-indicator';
    typingIndicator.textContent = 'Gemma가 생각 중입니다...';
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const response = await fetch(OLLAMA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: text,
                stream: false
            })
        });

        const data = await response.json();
        
        // Remove typing indicator
        document.getElementById('typing-indicator').remove();
        
        addMessage('ai', data.response);
    } catch (err) {
        document.getElementById('typing-indicator').remove();
        addMessage('ai', '에러: Ollama 서버에 연결할 수 없습니다. OLLAMA_ORIGINS="*" 설정을 확인해 주세요.');
        console.error(err);
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

clearBtn.addEventListener('click', () => {
    chatWindow.innerHTML = '';
    addMessage('system', '채팅 내역이 초기화되었습니다.');
});
