// === CẤU HÌNH GEMINI API ===
const MAX_TEXT_LENGTH = 200; // Giới hạn ký tự gửi dịch
const TRANSLATE_COOLDOWN_MS = 1500; // Thời gian chờ giữa 2 lần dịch (ms)
let isTranslating = false;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com';
const GEMINI_API_VERSION = 'v1';
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite'
];
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';

async function callGemini(model, requestBody, apiKey) {
  const url = `${GEMINI_API_BASE}/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Lỗi API không xác định');
  }

  const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!translated) {
    throw new Error('Gemini không trả về nội dung dịch.');
  }

  return translated.trim();
}

async function translateWithGemini(text, apiKey) {
  if (!text || text.trim().length < 2) return null;

  const requestBody = {
    contents: [{
      parts: [{
        text: `Dịch đoạn văn bản sau đây sang tiếng Việt. Chỉ trả về bản dịch, không giải thích gì thêm: "${text}"`
      }]
    }],
    generationConfig: {
      temperature: 0.3,
    }
  };

  try {
    let lastError = null;

    for (const model of GEMINI_MODELS) {
      try {
        const translated = await callGemini(model, requestBody, apiKey);
        console.info(`[Gemini] Using model: ${model} (${GEMINI_API_VERSION})`);
        return translated;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Không tìm được model Gemini khả dụng.');

  } catch (error) {
    console.error('Lỗi Gemini:', error);
    return `[Lỗi dịch: ${error.message}]`;
  }
}

async function translateWithChatGPT(text, apiKey) {
  if (!text || text.trim().length < 2) return null;

  const prompt = `Translate this text to Vietnamese. Only return the translation: "${text}"`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a translation assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Lỗi API OpenAI không xác định');
    }

    const translated = data?.choices?.[0]?.message?.content;
    if (!translated) {
      throw new Error('ChatGPT không trả về nội dung dịch.');
    }

    console.info(`[ChatGPT] Using model: ${OPENAI_MODEL}`);
    return translated.trim();
  } catch (error) {
    console.error('Lỗi ChatGPT:', error);
    return `[Lỗi dịch: ${error.message}]`;
  }
}

function extractCellTextFromAriaLabel(ariaLabel) {
  if (!ariaLabel) return '';

  // Google Sheets thường trả aria-label dạng "A1 <giá trị>".
  const cleaned = ariaLabel.replace(/^[A-Z]+\d+\s+/, '').trim();
  return cleaned || ariaLabel.trim();
}

function getTextFromEventTarget(event) {
  const selectionText = window.getSelection()?.toString()?.trim();
  if (selectionText) return selectionText;

  const target = event.target;
  if (!target) return '';

  const editable = target.closest?.('input, textarea, [contenteditable="true"], [role="textbox"]');
  if (editable) {
    const editableText = (editable.value || editable.innerText || editable.textContent || '').trim();
    if (editableText) return editableText;
  }

  const sheetCell = target.closest?.('[role="gridcell"]');
  if (sheetCell) {
    const cellText = (sheetCell.innerText || sheetCell.textContent || '').trim();
    if (cellText) return cellText;

    const ariaText = extractCellTextFromAriaLabel(sheetCell.getAttribute('aria-label'));
    if (ariaText) return ariaText;
  }

  const directText = (target.innerText || target.textContent || '').trim();
  if (directText) return directText;

  const path = event.composedPath?.() || [];
  for (const node of path) {
    if (!(node instanceof Element)) continue;

    const text = (node.innerText || node.textContent || '').trim();
    if (text) return text;

    const ariaText = extractCellTextFromAriaLabel(node.getAttribute('aria-label'));
    if (ariaText) return ariaText;
  }

  return '';
}

// === XỬ LÝ SỰ KIỆN CLICK ===
document.addEventListener('click', async function(event) {
  // Giữ phím Alt + Click để dịch
  if (!event.altKey) return;

  if (isTranslating) return; // Chặn click liên tục

  const clickedElement = event.target;
  const rawText = getTextFromEventTarget(event);

  if (!rawText || rawText.trim().length === 0) return;

  // Giới hạn độ dài văn bản gửi đi
  const originalText = rawText.trim().length > MAX_TEXT_LENGTH
    ? rawText.trim().slice(0, MAX_TEXT_LENGTH) + '…'
    : rawText.trim();

  isTranslating = true;

  chrome.storage.local.get(['translator_provider', 'gemini_api_key', 'openai_api_key'], async (result) => {
    const provider = result.translator_provider || 'gemini';
    const apiKey = provider === 'chatgpt' ? result.openai_api_key : result.gemini_api_key;

    if (!apiKey) {
      const providerName = provider === 'chatgpt' ? 'ChatGPT' : 'Gemini';
      alert(`Vui lòng dán ${providerName} API Key vào popup!`);
      return;
    }

    // Hiệu ứng đổi màu tạm thời để biết đang xử lý
    const oldBg = clickedElement.style.backgroundColor;
    clickedElement.style.backgroundColor = '#e8f0fe';

    const translatedText = provider === 'chatgpt'
      ? await translateWithChatGPT(originalText, apiKey)
      : await translateWithGemini(originalText, apiKey);

    if (translatedText) {
      const providerLabel = provider === 'chatgpt' ? 'ChatGPT' : 'Gemini';
      const truncated = rawText.trim().length > MAX_TEXT_LENGTH ? ` (đã cắt bớt còn ${MAX_TEXT_LENGTH} ký tự)` : '';
      alert(`[${providerLabel} Dịch]${truncated}:\n----------\n${translatedText}`);
    }

    clickedElement.style.backgroundColor = oldBg;
    setTimeout(() => { isTranslating = false; }, TRANSLATE_COOLDOWN_MS);
  });
});