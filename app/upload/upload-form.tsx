'use client';

import { useState } from 'react';
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
  const [imageBase64, setImageBase64] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageSelect = (base64: string) => {
    setImageBase64(base64);
  };

  const handlePinDrop = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
  };

  const handleSubmit = async () => {
    if (!imageBase64) {
      showNotification('error', 'Please select an image');
      return;
    }

    if (!coordinates) {
      showNotification('error', 'Please select a location on the map');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          username: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      showNotification('success', 'Image uploaded successfully!');

      // Reset form
      setImageBase64('');
      setCoordinates(null);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', 'Failed to upload image. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = imageBase64 && coordinates && !isSubmitting;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column: Image upload */}
      <div className="space-y-6">
        <div>
          <Label className="text-lg font-semibold mb-2 block">1. Upload Image</Label>
          <ImageUploadZone onImageSelect={handleImageSelect} />
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
          {isSubmitting ? 'Uploading...' : 'Submit Location'}
        </Button>
      </div>

      {/* Right column: Map */}
      <div>
        <Label className="text-lg font-semibold mb-2 block">2. Select Location</Label>
        <Card className="h-[600px]">
          <CardContent className="p-4 h-full">
            <CampusMap onPinDrop={handlePinDrop} className="h-full" />
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
