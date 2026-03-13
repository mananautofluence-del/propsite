import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadFile(file: File, path: string): Promise<string> {
  const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadFiles(files: File[], path: string): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, path));
  return Promise.all(uploadPromises);
}
