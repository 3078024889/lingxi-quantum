export function sasiReadiness() {
  const providers = {
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    xai: Boolean(process.env.XAI_API_KEY?.trim()),
    google: Boolean(process.env.GOOGLE_AI_API_KEY?.trim()),
    luma: Boolean(process.env.LUMA_API_KEY?.trim()),
    fal: Boolean(process.env.FAL_KEY?.trim()),
  };
  const billing = process.env.SASI_BILLING_ENABLED === "true";
  const jobs = process.env.SASI_JOBS_ENABLED === "true";
  return {
    catalog: true,
    providers,
    anyProvider: Object.values(providers).some(Boolean),
    billing,
    jobs,
    productionReady: billing && jobs && Object.values(providers).some(Boolean),
  };
}
