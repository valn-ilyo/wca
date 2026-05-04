import type { ChatAnalytics } from "@/types/analytics";

// base64url (no padding, URL-safe) ----------------------------------------

function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Narrows ArrayBufferLike → ArrayBuffer to satisfy BufferSource
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(
    u8.byteOffset,
    u8.byteOffset + u8.byteLength,
  ) as ArrayBuffer;
}

// Public API ---------------------------------------------------------------

export async function encodePayload(analytics: ChatAnalytics): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(analytics));
  const stream = new CompressionStream("gzip");
  const writer = stream.writable.getWriter();
  writer.write(toArrayBuffer(json));
  writer.close();
  const compressed = await new Response(stream.readable).arrayBuffer();
  return toBase64url(new Uint8Array(compressed));
}

export async function decodePayload(encoded: string): Promise<ChatAnalytics> {
  const bytes = fromBase64url(encoded);
  const stream = new DecompressionStream("gzip");
  const writer = stream.writable.getWriter();
  writer.write(toArrayBuffer(bytes));
  writer.close();
  const text = await new Response(stream.readable).text();
  return JSON.parse(text) as ChatAnalytics;
}
