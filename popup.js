const providerEl = document.getElementById('provider');
const apiKeyEl = document.getElementById('apiKey');
const statusEl = document.getElementById('status');
const hintGeminiEl = document.getElementById('hintGemini');
const hintOpenAIEl = document.getElementById('hintOpenAI');
const clickHotkeyEl = document.getElementById('clickHotkey');
const usageHotkeyEl = document.getElementById('usageHotkey');

const DEFAULT_CLICK_HOTKEY = 'alt';
const HOTKEY_STORAGE_KEY = 'translator_click_hotkey';

function normalizeHotkey(value) {
  const allowed = ['alt', 'ctrl', 'shift', 'meta'];
  return allowed.includes(value) ? value : DEFAULT_CLICK_HOTKEY;
}

function hotkeyDisplayName(hotkey) {
  switch (hotkey) {
    case 'ctrl':
      return 'Ctrl';
    case 'shift':
      return 'Shift';
    case 'meta':
      return 'Meta';
    case 'alt':
    default:
      return 'Alt';
  }
}

function storageKeyByProvider(provider) {
  return provider === 'chatgpt' ? 'openai_api_key' : 'gemini_api_key';
}

function renderProviderUI(provider) {
  const isChatGPT = provider === 'chatgpt';
  apiKeyEl.placeholder = isChatGPT ? 'sk-...' : 'AIza...';
  hintGeminiEl.style.display = isChatGPT ? 'none' : 'inline-block';
  hintOpenAIEl.style.display = isChatGPT ? 'inline-block' : 'none';
}

function renderHotkeyUI(hotkey) {
  const normalized = normalizeHotkey(hotkey);
  clickHotkeyEl.value = normalized;
  usageHotkeyEl.textContent = hotkeyDisplayName(normalized);
}

function loadKeyForProvider(provider) {
  const keyName = storageKeyByProvider(provider);
  chrome.storage.local.get([keyName], (result) => {
    apiKeyEl.value = result[keyName] || '';
  });
}

// Khi mở popup, load provider + key tương ứng.
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['translator_provider', 'gemini_api_key', 'openai_api_key', HOTKEY_STORAGE_KEY], (result) => {
    const provider = result.translator_provider || 'gemini';
    const hotkey = normalizeHotkey(result[HOTKEY_STORAGE_KEY]);
    providerEl.value = provider;
    renderProviderUI(provider);
    renderHotkeyUI(hotkey);
    loadKeyForProvider(provider);
  });
});

providerEl.addEventListener('change', () => {
  const provider = providerEl.value;
  renderProviderUI(provider);
  loadKeyForProvider(provider);
});

clickHotkeyEl.addEventListener('change', () => {
  renderHotkeyUI(clickHotkeyEl.value);
});

// Xử lý sự kiện nhấn nút Lưu
document.getElementById('save').addEventListener('click', () => {
  const provider = providerEl.value;
  const key = apiKeyEl.value.trim();
  const hotkey = normalizeHotkey(clickHotkeyEl.value);

  const keyName = storageKeyByProvider(provider);
  const payload = {
    translator_provider: provider,
    [HOTKEY_STORAGE_KEY]: hotkey
  };

  if (key) {
    payload[keyName] = key;
  }

  chrome.storage.local.set(payload, () => {
    statusEl.textContent = key
      ? 'Đã lưu cấu hình thành công!'
      : 'Đã lưu nhà cung cấp + hotkey (không đổi API key).';
    statusEl.style.color = 'green';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);
  });
});