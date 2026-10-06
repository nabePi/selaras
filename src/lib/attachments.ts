export const MB = 1024 * 1024;
export const MAX_IMAGE_BYTES = 5 * MB;
export const MAX_MEDIA_BYTES = 100 * MB;
export const MAX_ATTACHMENTS = 10;

export type AttachmentKind = "image" | "video" | "audio";

export function attachmentKind(mime: string): AttachmentKind | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return null;
}

export const maxBytesFor = (kind: AttachmentKind) => (kind === "image" ? MAX_IMAGE_BYTES : MAX_MEDIA_BYTES);

export const formatSize = (bytes: number) => `${(bytes / MB).toFixed(1)} MB`;
