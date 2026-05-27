const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/pjpeg"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export function validatePhotoFile(file: File): string | null {
  if (file.size === 0) {
    return "파일을 선택해 주세요.";
  }

  if (file.size > MAX_BYTES) {
    return "파일 크기는 5MB 이하여야 합니다.";
  }

  const mime = (file.type || "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  const mimeOk = mime ? ALLOWED_MIMES.has(mime) : false;
  const extOk = ALLOWED_EXT.has(ext);

  if (!mimeOk && !extOk) {
    return "jpg, jpeg, png, webp 이미지만 업로드할 수 있습니다.";
  }

  return null;
}

export const PHOTO_MAX_BYTES = MAX_BYTES;
