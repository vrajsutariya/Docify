import { useState, useCallback } from 'react';

export function useUpload(uploadFn) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const startUpload = useCallback(async (file, metadata = {}) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach((key) => formData.append(key, metadata[key]));

    try {
      const result = await uploadFn(formData, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      setUploading(false);
      return result;
    } catch (err) {
      setError(err.message || 'File upload failed');
      setUploading(false);
      throw err;
    }
  }, [uploadFn]);

  return { startUpload, progress, uploading, error, reset: () => { setProgress(0); setError(null); } };
}
