import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Camera, ArrowLeft } from 'lucide-react';

interface AvatarSelectorProps {
    selectedAvatar: string;
    onAvatarChange: (avatar: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onAvatarChange }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCustomImage, setIsCustomImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const avatars = [
        '../assets/avatar1.png',
        '../assets/avatar2.png',
        '../assets/avatar3.png',
        '../assets/avatar4.png',
        '../assets/avatar5.png',
        '../assets/avatar6.png',
        '../assets/avatar7.png',
        '../assets/avatar8.png',
        '../assets/avatar9.png',
        '../assets/avatar10.png',
        '../assets/avatar11.png',
        '../assets/avatar12.png',
        '../assets/avatar13.png',
        '../assets/avatar14.png',
        '../assets/avatar15.png',
        '../assets/avatar16.png',
        '../assets/avatar17.png',
        '../assets/avatar18.png'
    ];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));
        onAvatarChange(avatars[currentIndex === 0 ? avatars.length - 1 : currentIndex - 1]);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));
        onAvatarChange(avatars[currentIndex === avatars.length - 1 ? 0 : currentIndex + 1]);
    };

    const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Calculate new dimensions while maintaining aspect ratio
              let width = img.width;
              let height = img.height;
              const maxDimension = 800; // Maximum dimension for either width or height
              
              if (width > height && width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              } else if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
              
              // Set canvas dimensions
              canvas.width = width;
              canvas.height = height;
              
              // Draw and compress image
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Convert to base64 with reduced quality
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 0.7 = 70% quality
              
              resolve(compressedBase64);
            };
            
            img.onerror = () => {
              reject(new Error('Failed to load image'));
            };
          };
          
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
        });
      };

      const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                console.log('Original file size:', file.size / 1024 / 1024, 'MB');
                const compressedBase64 = await compressImage(file);
                const compressedSize = compressedBase64.length * 0.75 / 1024 / 1024;
                console.log('Compressed size:', compressedSize, 'MB');
                onAvatarChange(compressedBase64);
                setIsCustomImage(true);
            } catch (error) {
                console.error('Error compressing image:', error);
                alert('Failed to upload image. Please try again.');
            }
        }
    };

    const handleReturnToDefault = () => {
        setIsCustomImage(false);
        onAvatarChange(avatars[currentIndex]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
            <div className="avatar-section">
                <h3 className="avatar-title">Character Avatar</h3>
                
                <div className="avatar-selector-container">
                    {!isCustomImage && (
                        <button 
                            onClick={handlePrevious} 
                            className="avatar-nav-button left"
                            type="button"
                        >
                            <ChevronLeft className="avatar-nav-icon" />
                        </button>
                    )}
                    
                    <div className="avatar-image-container">
                        <img
                            src={selectedAvatar}
                            alt="Character Avatar"
                            className="avatar-image"
                        />
                    </div>
                    
                    {!isCustomImage && (
                        <button 
                            onClick={handleNext} 
                            className="avatar-nav-button right"
                            type="button"
                        >
                            <ChevronRight className="avatar-nav-icon" />
                        </button>
                    )}
                </div>
    
                <div className="avatar-controls">
                    <label className="upload-button">
                        <Camera className="upload-icon" />
                        <span>Upload Image</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden-input"
                        />
                    </label>
    
                    {isCustomImage && (
                        <button
                            onClick={handleReturnToDefault}
                            className="default-button"
                            type="button"
                        >
                            <ArrowLeft className="arrow-icon" />
                            <span>Use Default</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };
    
    export default AvatarSelector;