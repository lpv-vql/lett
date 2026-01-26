const GAS_URL = "https://script.google.com/macros/s/AKfycbzpIL0d8KGQfskjX0lbbD8SJQwsJJPkN3jJBEqA6Q99hL2LfyTCWrz6Hkmvd_dXSDy5Lw/exec";

// ローカルストレージから設定を読み込み
let config = JSON.parse(localStorage.getItem('sns_config') || '{}');

// 設定画面を開く
function openModal() {
    document.getElementById('modal').style.display = 'flex';
    if(config.name) {
        document.getElementById('nameInput').value = config.name;
        document.getElementById('codeInput').value = config.secretCode;
    }
}

// 入力欄のUI（名前・背景色）を現在の設定に合わせる
function updateInputUI() {
    const nameLabel = document.getElementById('current-user-name');
    const inputBubble = document.getElementById('input-bubble-ui');
    
    if (config.name) {
        nameLabel.innerText = config.name;
        inputBubble.style.backgroundColor = config.color;
    }
}

// 設定を保存
function saveSettings() {
    const selectedColor = document.querySelector('input[name="color"]:checked').value;
    config = {
        name: document.getElementById('nameInput').value || '名無し',
        color: selectedColor,
        secretCode: document.getElementById('codeInput').value || 'default'
    };
    localStorage.setItem('sns_config', JSON.stringify(config));
    document.getElementById('modal').style.display = 'none';
    updateInputUI();
}

// メッセージ読み込み
async function loadMessages() {
    try {
        const res = await fetch(GAS_URL, { redirect: "follow" });
        const data = await res.json();
        const tl = document.getElementById('timeline');
        
        tl.innerHTML = data.map(m => {
            const date = new Date(m[0]).toLocaleString('ja-JP', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            // 空白が入らないように1行で連結
            return `<div class="msg-wrapper"><div class="msg-header">${m[1]}<span class="info-pop">ID: ${m[5]}<br>投稿: ${date}</span></div><div class="bubble" style="background-color: ${m[4]}">${m[2]}</div></div>`;
        }).join('');
    } catch (e) {
        console.error("読み込み失敗:", e);
    }
}

// メッセージ送信
async function sendMessage() {
    const textInput = document.getElementById('msgInput');
    const text = textInput.value.trim();
    if (!text) return;
    
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.style.opacity = "0.5";
    sendBtn.style.pointerEvents = "none";

    try {
        await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify({...config, message: text})
        });
        textInput.value = '';
        await loadMessages();
    } catch (e) {
        alert("送信に失敗しました");
    } finally {
        sendBtn.style.opacity = "1";
        sendBtn.style.pointerEvents = "auto";
    }
}

// 初期化処理
window.onload = () => {
    if (!config.name) {
        openModal();
    } else {
        updateInputUI();
        loadMessages();
    }
};

// 5秒ごとに自動更新
setInterval(loadMessages, 5000);
