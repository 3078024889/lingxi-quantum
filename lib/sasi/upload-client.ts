"use client";

export type SasiUploadTicket = { assetId: string; bucket: string; path: string; token: string; contentType: string };

export async function uploadSasiAsset(file: File, ticket: SasiUploadTicket, onProgress: (percent: number) => void) {
  const { Upload } = await import("tus-js-client");
  const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (base.hostname.endsWith(".supabase.co")) base.hostname = base.hostname.replace(".supabase.co", ".storage.supabase.co");
  return new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${base.origin}/storage/v1/upload/resumable/sign`,
      headers: { "x-signature": ticket.token },
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      uploadDataDuringCreation: true,
      // Retry within this task; do not persist private filenames or signed upload URLs.
      storeFingerprintForResuming: false,
      removeFingerprintOnSuccess: true,
      metadata: { bucketName: ticket.bucket, objectName: ticket.path, contentType: ticket.contentType, cacheControl: "3600" },
      onProgress: (sent, total) => onProgress(total ? Math.floor(sent / total * 100) : 0),
      onError: reject,
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}
