import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getDiagnosticHelp = async (symptom: string, image?: { data: string; mimeType: string; }): Promise<string> => {
  try {
    const textPrompt = `Bạn là một chuyên gia sửa chữa xe máy giàu kinh nghiệm tại Việt Nam. Một khách hàng mô tả sự cố của xe như sau: "${symptom}". 
    
    Nếu có hình ảnh đính kèm, hãy phân tích cả hình ảnh đó cùng với mô tả.
    
    Dựa vào thông tin được cung cấp, hãy cung cấp các thông tin sau một cách rõ ràng và có cấu trúc:
    1.  **Chẩn đoán sơ bộ:** Liệt kê các nguyên nhân có khả năng cao nhất gây ra sự cố.
    2.  **Các bước kiểm tra:** Đề xuất các bước kiểm tra cụ thể mà một thợ sửa xe có thể thực hiện để xác định chính xác nguyên nhân.
    3.  **Phụ tùng có thể cần thay thế:** Liệt kê danh sách các phụ tùng có thể liên quan và cần thay thế.
    
    Hãy trình bày câu trả lời bằng tiếng Việt, sử dụng thuật ngữ chuyên ngành phổ thông, dễ hiểu. Định dạng câu trả lời bằng Markdown.`;

    const contents = [];
    contents.push({ text: textPrompt });

    if (image) {
      contents.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: contents },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Đã xảy ra lỗi khi kết nối với trợ lý AI. Vui lòng thử lại sau.";
  }
};