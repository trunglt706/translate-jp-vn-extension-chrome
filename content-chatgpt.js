// === CẤU HÌNH API ===
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// === HÀM GỌI CHATGPT ĐỂ DỊCH ===
async function translateWithChatGPT(text, apiKey) {
  // Nếu text quá ngắn hoặc rỗng thì không dịch
  if (!text || text.trim().length < 2) return null;

  const prompt = `Translate the following Japanese text to Vietnamese. Only provide the translation, no explanation. Text: "${text}"`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Hoặc gpt-4 if you have access
        messages: [
            {"role": "system", "content": "You are a helpful translation assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature: 0.3, // Thấp để dịch chính xác hơn
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error.message}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
        // OpenAI thường trả về 'message' (số ít) thay vì 'messages'
        return data.choices[0].message.content.trim();
    } else {
        throw new Error("Không nhận được phản hồi từ AI");
    }

  } catch (error) {
    console.error('Lỗi khi gọi ChatGPT:', error);
    return `[Lỗi dịch: ${error.message}]`;
  }
}

// === XỬ LÝ SỰ KIỆN CLICK TRÊN TRANG WEB ===
document.addEventListener('click', async function(event) {
  // 1. Kiểm tra xem có đang giữ phím Alt (hoặc phím khác) khi click không?
  // Việc này để tránh việc dịch vô tội vạ khi bạn chỉ muốn click bình thường.
  // Nếu muốn dịch mọi lúc, hãy bỏ dòng 'if (!event.altKey)' này.
  if (!event.altKey) return; 

  event.preventDefault(); // Ngăn chặn hành động mặc định của thẻ (ví dụ click vào link)
  event.stopPropagation(); // Ngăn chặn sự kiện lan bọt

  const clickedElement = event.target;
  const originalText = clickedElement.innerText || clickedElement.textContent;

  if (!originalText || originalText.trim().length === 0) return;

  // 2. Lấy API Key đã lưu
  chrome.storage.local.get(['openai_api_key'], async (result) => {
    const apiKey = result.openai_api_key;

    if (!apiKey) {
      alert('Vui lòng cài đặt API Key trong popup của extension!');
      return;
    }

    // 3. Hiển thị trạng thái "Đang dịch..."
    const originalBackgroundColor = clickedElement.style.backgroundColor;
    clickedElement.style.backgroundColor = '#ffffcc'; // Đổi màu nền nhẹ để đánh dấu

    // 4. Gọi API
    const translatedText = await translateWithChatGPT(originalText, apiKey);

    // 5. Hiển thị kết quả (Sử dụng Tooltip đơn giản)
    if (translatedText) {
        // Bạn có thể tùy biến cách hiển thị ở đây (dùng thư viện tooltip sẽ đẹp hơn)
        alert(`[Dịch JP -> VN]:\n------------------\n${translatedText}`);
    }

    // Trả lại màu nền cũ
    clickedElement.style.backgroundColor = originalBackgroundColor;
  });
});

console.log('Dịch Nhật-Việt Extension đã sẵn sàng! Giữ phím Alt và Click vào văn bản.');