import "server-only";
import mongoose from "mongoose";
const { GridFSBucket, ObjectId } = mongoose.mongo;
import { connectDB } from "./db";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

async function bucket() {
  await connectDB();
  return new GridFSBucket(mongoose.connection.db!, { bucketName: "media" });
}

export async function saveUpload(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("Unsupported file type");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File too large");

  const bytes = Buffer.from(await file.arrayBuffer());
  const b = await bucket();
  const stream = b.openUploadStream(file.name, { metadata: { contentType: file.type } });
  await new Promise<void>((resolve, reject) => {
    stream.once("error", reject);
    stream.once("finish", () => resolve());
    stream.end(bytes);
  });
  return String(stream.id);
}

export async function readMedia(id: string): Promise<{ data: Buffer; contentType: string } | null> {
  if (!ObjectId.isValid(id)) return null;
  const b = await bucket();
  const _id = new ObjectId(id);
  const [info] = await b.find({ _id }).limit(1).toArray();
  if (!info) return null;

  const chunks: Buffer[] = [];
  for await (const chunk of b.openDownloadStream(_id)) chunks.push(chunk as Buffer);
  return {
    data: Buffer.concat(chunks),
    contentType: (info.metadata?.contentType as string) ?? "application/octet-stream",
  };
}

export async function deleteMedia(id: string) {
  if (!id || !ObjectId.isValid(id)) return;
  const b = await bucket();
  await b.delete(new ObjectId(id)).catch(() => undefined);
}
