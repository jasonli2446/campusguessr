'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import ImageUploadZone from '@/components/upload/ImageUploadZone';
import CampusMap from '@/components/gameplay/CampusMap';

interface UploadFormProps {
  userId: string;
}

export default function UploadForm({ userId }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handlePinDrop = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showNotification('error', 'Please select an image');
      return;
    }

    if (!coordinates) {
      showNotification('error', 'Please select a location on the map');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload file directly to Supabase Storage (bypasses Vercel 4.5MB limit)
      const supabase = createClient();

      // Generate secure filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `upload_${timestamp}_${randomString}.${fileExtension}`;

      setUploadProgress(10);

      // Upload directly to Supabase Storage from client
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, selectedFile, {
          contentType: selectedFile.type,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(60);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setUploadProgress(70);

      // Step 2: Send only metadata to API route
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: publicUrl,
          fileName: fileName,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          userId: userId,
        }),
      });

      setUploadProgress(90);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Upload failed (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      setUploadProgress(100);
      showNotification('success', 'Image uploaded successfully!');

      // Reset form
      setSelectedFile(null);
      setCoordinates(null);
      setUploadProgress(0);
      setResetKey((prev: number) => prev + 1);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedFile && coordinates && !isSubmitting;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column: Image upload */}
      <div className="space-y-6">
        <div>
          <Label className="text-lg font-semibold mb-2 block">1. Upload Image</Label>
          <ImageUploadZone key={resetKey} onImageSelect={handleImageSelect} />
        </div>

        {/* Coordinates display */}
        {coordinates && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Coordinates</CardTitle>
              <CardDescription>
                Click a different location on the map to update
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Latitude:</span> {coordinates.lat.toFixed(6)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Longitude:</span> {coordinates.lng.toFixed(6)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="lg"
          className="w-full"
        >
          {isSubmitting
            ? uploadProgress > 0
              ? `Uploading... ${uploadProgress}%`
              : 'Uploading...'
            : 'Submit Location'}
        </Button>
      </div>

      {/* Right column: Map */}
      <div>
        <Label className="text-lg font-semibold mb-2 block">2. Select Location</Label>
        <Card className="h-[450px]">
          <CardContent className="p-4 h-full">
            <CampusMap onPinDrop={handlePinDrop} className="h-full" resetPin={resetKey > 0 && !coordinates} />
          </CardContent>
        </Card>
      </div>
      
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
    </div>
  );
}
