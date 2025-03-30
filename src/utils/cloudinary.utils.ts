// src/utils/cloudinary.utils.ts

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary.config';

export const uploadToCloudinary = async (file: File, folderPath?: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    if (folderPath) {
      formData.append('folder', folderPath);
    }
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error uploading to Cloudinary: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error in Cloudinary upload:', error);
    throw error;
  }
};

export default {
  uploadToCloudinary
};