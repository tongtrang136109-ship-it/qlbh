import React, { useState, useRef } from 'react';
import { getDiagnosticHelp } from '../services/geminiService';
import { SparklesIcon, LoadingSpinner, CameraIcon, CloudArrowUpIcon, XMarkIcon } from './common/Icons';

// Helper function to convert a File/Blob to a base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // The result includes the data URL prefix (e.g., "data:image/png;base64,"), we need to remove it.
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            } else {
                reject(new Error("Failed to read blob as base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


const AiAssistant: React.FC = () => {
  const [symptom, setSymptom] = useState<string>('');
  const [image, setImage] = useState<{ file: File; previewUrl: string; } | null>(null);
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check for valid image types
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chỉ tải lên tệp hình ảnh.');
        return;
      }
      setImage({
        file: file,
        previewUrl: URL.createObjectURL(file),
      });
      setError(null);
    }
  };

  const handleDiagnose = async () => {
    if (!symptom.trim()) {
      setError('Vui lòng mô tả triệu chứng của xe.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setResponse('');
    
    let imagePayload;
    if (image) {
        try {
            const base64Data = await blobToBase64(image.file);
            imagePayload = {
                data: base64Data,
                mimeType: image.file.type,
            };
        } catch (err) {
            setError("Không thể xử lý hình ảnh. Vui lòng thử lại.");
            setIsLoading(false);
            return;
        }
    }

    try {
      const result = await getDiagnosticHelp(symptom, imagePayload);
      setResponse(result);
    } catch (err) {
      setError('Không thể nhận được chẩn đoán. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // A more sophisticated parser for the Gemini response
  const parseAndFormatResponse = (text: string) => {
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;

    text.split('\n').forEach(line => {
        line = line.trim();
        // Match headings like **Chẩn đoán sơ bộ:** or 1. **Chẩn đoán sơ bộ:**
        const headingMatch = line.match(/^\d*\.?\s?\*\*(.+?):\*\*/);
        if (headingMatch) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = { title: headingMatch[1].trim(), content: [] };
        } else if (currentSection && line) {
            currentSection.content.push(line);
        }
    });

    if (currentSection) {
        sections.push(currentSection);
    }
    
    if (sections.length === 0) {
        // Fallback for unstructured responses
        return <p>{text}</p>;
    }

    return sections.map((section, index) => (
        <details key={index} open className="mb-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden last:mb-0">
            <summary className="font-semibold text-slate-800 dark:text-slate-200 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center">
                {section.title}
                <svg className="w-5 h-5 transition-transform transform details-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 prose prose-slate dark:prose-invert max-w-none">
                <ul className="list-disc pl-5 space-y-1">
                    {section.content.map((item, idx) => (
                        <li key={idx}>{item.replace(/^\* /, '')}</li>
                    ))}
                </ul>
            </div>
        </details>
    ));
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <style>{`
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .details-arrow { transform: rotate(180deg); }
      `}</style>
      <div className="flex items-center">
        <SparklesIcon className="w-8 h-8 text-sky-600 dark:text-sky-400"/>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 ml-3">Trợ lý Chẩn đoán AI</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 space-y-4">
        <div>
            <label htmlFor="symptom-textarea" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                1. Mô tả chi tiết các triệu chứng của xe <span className="text-red-500">*</span>
            </label>
            <textarea
              id="symptom-textarea"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-700 transition-colors"
              rows={4}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Ví dụ: Xe khó nổ máy vào buổi sáng, có tiếng kêu lạ ở động cơ khi tăng ga..."
            />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                2. Đính kèm hình ảnh (nếu có)
            </label>
            <div className="flex items-center gap-4">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                 />
                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <CloudArrowUpIcon className="w-5 h-5" /> Tải ảnh lên
                 </button>
                 <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50" disabled>
                    <CameraIcon className="w-5 h-5" /> Chụp ảnh
                 </button>
            </div>
             {image && (
                <div className="mt-4 relative w-40 h-40">
                    <img src={image.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border-2 border-slate-200 dark:border-slate-600" />
                    <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
        
        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        
        <button
          onClick={handleDiagnose}
          disabled={isLoading}
          className="mt-4 w-full flex justify-center items-center bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition-colors disabled:bg-sky-300 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
                <LoadingSpinner />
                <span>Đang chẩn đoán...</span>
            </>
          ) : (
            'Nhận chẩn đoán từ AI'
          )}
        </button>
      </div>

      {response && !isLoading && (
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Kết quả Chẩn đoán</h2>
            <div>
                {parseAndFormatResponse(response)}
            </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;