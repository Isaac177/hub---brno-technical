import { useState, useCallback } from "react";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const API_BASE_URL = 'https://course.ybyraihub.kz/api/v1';

const retryOperation = async (operation, maxRetries, delay) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Retry attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw lastError;
};

export const useVideoUpload = (options = {}) => {
  const { onUploadComplete } = options;
  const [uploads, setUploads] = useState(new Map());
  const [uploadErrors, setUploadErrors] = useState(new Map());

  const updateUploadProgress = useCallback((key, updates) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(key) || {};
      newMap.set(key, {
        ...current,
        ...updates,
        id: key
      });
      return newMap;
    });
  }, []);

  const setUploadError = useCallback((key, error) => {
    setUploadErrors((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, { message: error });
      return newMap;
    });
  }, []);

  const clearUploadError = useCallback((key) => {
    setUploadErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const uploadVideo = useCallback(async (file, sectionIndex, topicIndex, topicTitle) => {
    const uploadKey = `${sectionIndex}-${topicIndex}`;
    const sessionId = Math.random().toString(36).substring(7);
    let uploadData = null;

    try {
      clearUploadError(uploadKey);
      updateUploadProgress(uploadKey, {
        status: "uploading",
        progress: 0,
        fileName: file.name,
        sectionIndex,
        topicIndex,
        topicTitle,
        file,
      });

      // Initialize upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);
      formData.append("fileType", "VIDEO");

      uploadData = await retryOperation(
        async () => {
          const response = await fetch(`${API_BASE_URL}/uploads/initiate`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        },
        MAX_RETRIES,
        RETRY_DELAY
      );

      console.log("Upload initialized:", uploadData);
      const { id: uploadId, tempKey } = uploadData;
      const chunks = Math.ceil(file.size / CHUNK_SIZE);

      // Upload chunks
      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        const presignedData = await retryOperation(
          async () => {
            const params = new URLSearchParams({
              uploadId,
              key: tempKey,
              partNumber,
            });
            const response = await fetch(`${API_BASE_URL}/uploads/presigned-url?${params}`, {
              method: 'GET',
              credentials: 'include'
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          },
          MAX_RETRIES,
          RETRY_DELAY
        );

        const response = await fetch(presignedData.url, {
          method: 'PUT',
          body: chunk,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to upload part ${partNumber}`);
        }

        const etag = response.headers.get('etag');
        if (!etag) {
          throw new Error(`No ETag received for part ${partNumber}`);
        }

        await retryOperation(
          async () => {
            const params = new URLSearchParams({
              uploadId,
              partNumber,
              eTag: etag.replace(/"/g, '')
            });
            const response = await fetch(`${API_BASE_URL}/uploads/parts?${params}`, {
              method: 'POST',
              credentials: 'include'
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Don't try to parse empty responses
            return response.headers.get('content-length') > 0 ? response.json() : null;
          },
          MAX_RETRIES,
          RETRY_DELAY
        );

        updateUploadProgress(uploadKey, {
          status: "uploading",
          progress: Math.round((partNumber / chunks) * 100),
        });
      }

      // Complete the upload
      await retryOperation(
        async () => {
          const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}/complete`, {
            method: 'POST',
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          // Don't try to parse empty responses
          return response.headers.get('content-length') > 0 ? response.json() : null;
        },
        MAX_RETRIES,
        RETRY_DELAY
      );

      console.log("Upload completed, moving to final location");

      // Move to final location
      const moveResponse = await retryOperation(
        async () => {
          const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}/move`, {
            method: 'POST',
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          // Don't try to parse empty responses
          return response.headers.get('content-length') > 0 ? response.json() : null;
        },
        MAX_RETRIES,
        RETRY_DELAY
      );

      console.log("Move response:", moveResponse);

      // Ensure we have a final key, either from the move response or the temp key
      const finalKey = moveResponse?.finalKey || tempKey;

      // Update final state
      updateUploadProgress(uploadKey, {
        status: "completed",
        progress: 100,
        finalLocation: finalKey
      });

      // Notify completion
      if (onUploadComplete) {
        onUploadComplete({
          sectionIndex,
          topicIndex,
          finalLocation: finalKey
        });
      }

      return finalKey;

    } catch (error) {
      console.error("Upload failed:", error);

      setUploadError(uploadKey, error.message || "Upload failed");
      updateUploadProgress(uploadKey, {
        status: "error",
        progress: 0
      });

      if (uploadData?.id && uploadData?.tempKey) {
        try {
          const params = new URLSearchParams({
            uploadId: uploadData.id,
            key: uploadData.tempKey
          });
          await fetch(`${API_BASE_URL}/uploads/abort?${params}`, {
            method: 'POST',
            credentials: 'include'
          });
        } catch (abortError) {
          console.error("Failed to abort upload:", abortError);
        }
      }

      throw error;
    }
  }, [updateUploadProgress, setUploadError, clearUploadError, onUploadComplete]);

  const retryUpload = useCallback(async (key) => {
    const upload = uploads.get(key);
    if (!upload) return;

    clearUploadError(key);
    try {
      await uploadVideo(
        upload.file,
        upload.sectionIndex,
        upload.topicIndex,
        upload.topicTitle
      );
    } catch (error) {
      console.error("Retry failed:", error);
    }
  }, [uploads, uploadVideo, clearUploadError]);

  const removeUpload = useCallback((key) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
    clearUploadError(key);
  }, [clearUploadError]);

  const clearAll = useCallback(() => {
    setUploads(new Map());
    setUploadErrors(new Map());
  }, []);

  return {
    uploads,
    uploadErrors,
    uploadVideo,
    retryUpload,
    removeUpload,
    clearAll,
  };
};