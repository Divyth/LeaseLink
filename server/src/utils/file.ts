import path from 'node:path';

export function safeFileExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
}

export function uploadUrl(filename: string) {
  return `/uploads/${filename}`;
}

