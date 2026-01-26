const GAS_URL = "https://script.google.com/macros/s/AKfycbzpIL0d8KGQfskjX0lbbD8SJQwsJJPkN3jJBEqA6Q99hL2LfyTCWrz6Hkmvd_dXSDy5Lw/exec";
let config = JSON.parse(localStorage.getItem('sns_config') || '{}');

function openModal() { document.getElementById('modal').style.display = 'flex'; }

function saveSettings() {
    const selectedColor = document.querySelector('input[name="color"]:checked').value;
    config = {
        name: document.getElementById('nameInput').value || '名無し',
        color: selectedColor,
        secretCode: document.getElementById('codeInput').value || 'default'
    };
    localStorage.setItem('sns_config', JSON.stringify(config));
    document.getElementById('modal').style.display = 'none';
}

// 初回起動
if (!config.name) {
    document.getElementById('modal').style.display = 'flex';
} else {
    document.getElementById('modal').style.display = 'none';
}

async function loadMessages() {
    const res = await fetch(GAS_URL, { redirect: "follow" });
    const data = await res.json();
    const tl = document.getElementById('timeline');
    
    tl.innerHTML = data.map(m => {
        const date = new Date(m[0]).toLocaleString('ja-JP');
        return `
        <div class="msg-wrapper">
            <div class="msg-header">
                ${m[1]}
                <span class="info-pop">ID: ${m[5]}<br>${date}</span>
            </div>
            <div class="bubble" style="background-color: ${m[4]}">
                ${m[2]}
            </div>
        </div>
        `;
    }).join('');
}

async function sendMessage() {
    const text = document.getElementById('msgInput').value;
    if (!text) return;
    
    await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({...config, message: text})
    });
    
    document.getElementById('msgInput').value = '';
    loadMessages();
}

setInterval(loadMessages, 5000);
loadMessages();
