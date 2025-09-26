"use client";

import React from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

interface PhotoSphereViewerProps {
  imageUrl: string;
  height?: string;
  width?: string;
  className?: string;
}

export default function PhotoSphereViewer({ 
  imageUrl, 
  height = "100vh", 
  width = "100%",
  className = "w-full h-screen"
}: PhotoSphereViewerProps) {
  const photoSphereRef = React.createRef<React.ComponentRef<typeof ReactPhotoSphereViewer>>();


  return (
    <div className={className}>
      <ReactPhotoSphereViewer
        ref={photoSphereRef}
        src={imageUrl}
        littlePlanet={false}
        lang={{
          littlePlanetButton: "Little Planet",
        }}
        hideNavbarButton={false}
        height={height}
        width={width}
      />
    </div>
  );
}
