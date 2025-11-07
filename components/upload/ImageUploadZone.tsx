'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadZoneProps {
  onImageSelect: (file: File | null) => void;
  className?: string;
}

export default function ImageUploadZone({ onImageSelect, className = '' }: ImageUploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select an image file');
      return;
    }

    // Check file size (50MB limit - Supabase Storage limit)
    // No longer limited by Vercel since we upload directly to Supabase
    if (file.size > 50 * 1024 * 1024) {
      showNotification('error', 'File size must be less than 50MB. Please compress your image.');
      return;
    }

    try {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    } catch (error) {
      console.error('Error processing image:', error);
      showNotification('error', 'Failed to process image');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
            `}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              360° campus images (JPG, PNG, etc.)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={256}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={handleClear}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Notification */}
        {notification && (
          <div className={`
            fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full fade-in
            ${notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
            }
          `}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
