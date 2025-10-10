'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ImageUploadZone from '@/components/upload/ImageUploadZone';
import CampusMap from '@/components/gameplay/CampusMap';

interface UploadFormProps {
  userId: string;
}

export default function UploadForm({ userId }: UploadFormProps) {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (base64: string) => {
    setImageBase64(base64);
  };

  const handlePinDrop = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
  };

  const handleSubmit = async () => {
    if (!imageBase64) {
      alert('Please select an image');
      return;
    }

    if (!coordinates) {
      alert('Please select a location on the map');
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

      alert('Image uploaded successfully!');

      // Reset form
      setImageBase64('');
      setCoordinates(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
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
    </div>
  );
}
