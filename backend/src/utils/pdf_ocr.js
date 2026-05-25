import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractTextFromPdf = (pdfPath) => {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, 'pdf_ocr.py');
    
    execFile('python', [pythonScript, pdfPath], (error, stdout, stderr) => {
      if (error) {
        console.error('PDF OCR Error:', error);
        resolve(null);
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        if (result.success && result.text) {
          resolve(result.text);
        } else {
          console.error('PDF OCR Failed:', result.error);
          resolve(null);
        }
      } catch (parseError) {
        console.error('PDF OCR JSON Parse Error:', parseError);
        resolve(null);
      }
    });
  });
};
