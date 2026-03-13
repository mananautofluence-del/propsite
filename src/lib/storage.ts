export async function compressImage(file: File, maxWidth = 800, quality = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadFile(file: File, path: string): Promise<string> {
  // Instead of using Firebase Storage, we compress the image and return it as a Base64 string.
  // This allows storing the image directly in Firestore without needing Firebase Storage.
  try {
    const base64 = await compressImage(file, 800, 0.5);
    return base64;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Failed to process image.");
  }
}

export async function uploadFiles(files: File[], path: string): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, path));
  return Promise.all(uploadPromises);
}
