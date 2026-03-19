const providerEl = document.getElementById('provider');
const apiKeyEl = document.getElementById('apiKey');
const statusEl = document.getElementById('status');
const hintGeminiEl = document.getElementById('hintGemini');
const hintOpenAIEl = document.getElementById('hintOpenAI');

function storageKeyByProvider(provider) {
  return provider === 'chatgpt' ? 'openai_api_key' : 'gemini_api_key';
}

function renderProviderUI(provider) {
  const isChatGPT = provider === 'chatgpt';
  apiKeyEl.placeholder = isChatGPT ? 'sk-...' : 'AIza...';
  hintGeminiEl.style.display = isChatGPT ? 'none' : 'inline-block';
  hintOpenAIEl.style.display = isChatGPT ? 'inline-block' : 'none';
}

function loadKeyForProvider(provider) {
  const keyName = storageKeyByProvider(provider);
  chrome.storage.local.get([keyName], (result) => {
    apiKeyEl.value = result[keyName] || '';
  });
}

// Khi mở popup, load provider + key tương ứng.
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['translator_provider', 'gemini_api_key', 'openai_api_key'], (result) => {
    const provider = result.translator_provider || 'gemini';
    providerEl.value = provider;
    renderProviderUI(provider);
    loadKeyForProvider(provider);
  });
});

providerEl.addEventListener('change', () => {
  const provider = providerEl.value;
  renderProviderUI(provider);
  loadKeyForProvider(provider);
});

// Xử lý sự kiện nhấn nút Lưu
document.getElementById('save').addEventListener('click', () => {
  const provider = providerEl.value;
  const key = apiKeyEl.value.trim();

  if (!key) {
    statusEl.textContent = 'Vui lòng nhập Key!';
    statusEl.style.color = 'red';
    return;
  }

  const keyName = storageKeyByProvider(provider);
  chrome.storage.local.set({
    translator_provider: provider,
    [keyName]: key
  }, () => {
    statusEl.textContent = 'Đã lưu cấu hình thành công!';
    statusEl.style.color = 'green';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);
  });
});