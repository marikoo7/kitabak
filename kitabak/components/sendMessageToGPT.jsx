import axios from "axios";

export const sendMessageToGPT = async (message) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo", // تقدر تغيّره لنموذج تاني زي gpt-4 أو claude
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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",
          "HTTP-Referer": "https://kitabak/kitabak/app.com", // اختياري، بس لازم تحط اسم تطبيقك لو طلبوه
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API Error:", error.response?.data || error.message);
    return "عذرًا، حدث خطأ أثناء التواصل مع المساعد.";
  }
};
