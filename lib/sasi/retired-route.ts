export function sasiCreationRetired() {
  return Response.json(
    { error: "SASI_CREATION_RETIRED", replacement: "/sasi" },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}
