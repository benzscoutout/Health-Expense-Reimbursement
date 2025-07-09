import React, { useState, useCallback, useRef } from 'react';
import { Claim, ReceiptData, ClaimStatus } from '../../types';
import { extractReceiptData } from '../../services/geminiService';
import { ArrowUpOnSquareIcon, CameraIcon, SparklesIcon, XMarkIcon } from '../Icons';
import Spinner from '../Spinner';
import CameraCapture from '../CameraCapture';

interface ClaimFormProps {
  onClaimSubmit: (newClaim: Omit<Claim, 'id' | 'submittedDate' | 'employeeName'>) => void;
  onCancel: () => void;
  
}

const ClaimForm: React.FC<ClaimFormProps> = ({ onClaimSubmit, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [receiptData, setReceiptData] = useState<Partial<ReceiptData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageProcessing = useCallback(async (base64Image: string) => {
    setImage(base64Image);
    setIsLoading(true);
    setError(null);
    try {
      const data = await extractReceiptData(base64Image);
      setReceiptData(data);
    } catch (e) {
      console.error(e);
      setError('ไม่สามารถสกัดข้อมูลจากใบเสร็จได้ กรุณากรอกข้อมูลด้วยตนเอง');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageProcessing(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCameraCapture = (base64Image: string) => {
      setShowCamera(false);
      handleImageProcessing(base64Image);
      // Convert base64 to File for camera captures
      const base64Data = base64Image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setImageFile(file);
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReceiptData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!image || !receiptData.vendor || !receiptData.date || !receiptData.total) {
          setError("กรุณาแน่ใจว่ากรอกข้อมูลครบถ้วนและอัปโหลดใบเสร็จแล้ว");
          return;
      }
      onClaimSubmit({
          receiptImage: imageFile || image,
          receiptData: {
              vendor: receiptData.vendor,
              date: receiptData.date,
              total: Number(receiptData.total),
              items: receiptData.items || []
          },
          status: ClaimStatus.Pending,
      });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in" style={{marginTop: '-10vh'}}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl sm:max-w-2xl lg:max-w-6xl max-h-[90vh] flex flex-col mt-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">ส่งคำร้องใหม่</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 p-1">
            <XMarkIcon className="w-5 h-6 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-3 sm:p-6">
          {showCamera && <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />}
          
          <div className={`grid grid-cols-1 ${image ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-4 sm:gap-8`}>
            {/* Left Side: Image Upload & Preview */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg h-full liquid-glass-bg">
                {image ? (
                    <div className="relative w-full">
                        <img src={image} alt="Receipt Preview" className="rounded-lg max-h-64 sm:max-h-96 w-full object-contain" />
                         <button onClick={() => {setImage(null); setImageFile(null); setReceiptData({});}} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                             <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
                         </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-4">อัปโหลดใบเสร็จของคุณ</h3>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex-1 inline-flex items-center justify-center gap-2 h-12 text-base">
                               <ArrowUpOnSquareIcon className="w-5 h-5" /> อัปโหลดไฟล์
                            </button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => setShowCamera(true)} className="btn-primary flex-1 inline-flex items-center justify-center gap-2 h-12 text-base">
                                <CameraIcon className="w-5 h-5" /> ใช้กล้อง
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full space-y-2 text-gray-700">
                        <Spinner />
                        <SparklesIcon className="w-6 h-6 animate-pulse"/>
                        <p className="font-semibold text-sm sm:text-base">AI กำลังวิเคราะห์ใบเสร็จของคุณ...</p>
                    </div>
                )}
                {!isLoading && image && (
                    <>
                    <div>
                        <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">ร้านค้า/สถานพยาบาล</label>
                        <input type="text" name="vendor" id="vendor" value={receiptData.vendor || ''} onChange={handleFormChange} className="liquid-glass-input mt-1 block w-full h-12 text-base"/>
                    </div>
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">วันที่</label>
                        <input type="date" name="date" id="date" value={receiptData.date || ''} onChange={handleFormChange} className="liquid-glass-input mt-1 block w-full h-12 text-base"/>
                    </div>
                     <div>
                        <label htmlFor="total" className="block text-sm font-medium text-gray-700">จำนวนเงินรวม</label>
                        <input type="number" name="total" id="total" step="0.01" value={receiptData.total || ''} onChange={handleFormChange} className="liquid-glass-input mt-1 block w-full h-12 text-base"/>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    </>
                )}
            </form>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        {!isLoading && image && (
          <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button type="button" onClick={onCancel} className="px-4 py-3 sm:py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition h-12 text-base">
              ยกเลิก
            </button>
            <button type="button" onClick={handleSubmit} className="btn-primary h-12 text-base">
              ส่งคำร้อง
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimForm;