-- Standalone Supabase Free scheduler. All times are UTC (SGT/Beijing = UTC+8).
-- Requires extensions pg_cron and pg_net, already active in this project.
-- Cron contains only a reference to the encrypted Vault secret, never the raw key.
-- The Edge Function fails closed unless a valid Telegram bot token is set in Edge Secrets.

select cron.schedule(
  'globalsiai-discovery',
  '5 1 * * *',
  $job$
    select net.http_post(
      url := 'https://sxsgdpqojepgbbrxrzlq.supabase.co/functions/v1/globalsiai-bot',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-lx-schedule-key', (select decrypted_secret from vault.decrypted_secrets where name='lx_globalsiai_schedule_secret')
      ),
      body := '{"slot":"discovery"}'::jsonb,
      timeout_milliseconds := 10000
    );
  $job$
);


select cron.schedule(
  'globalsiai-tutorial',
  '5 3 * * *',
  $job$
    select net.http_post(
      url := 'https://sxsgdpqojepgbbrxrzlq.supabase.co/functions/v1/globalsiai-bot',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-lx-schedule-key', (select decrypted_secret from vault.decrypted_secrets where name='lx_globalsiai_schedule_secret')
      ),
      body := '{"slot":"tutorial"}'::jsonb,
      timeout_milliseconds := 10000
    );
  $job$
);


select cron.schedule(
  'globalsiai-comparison',
  '5 6 * * *',
  $job$
    select net.http_post(
      url := 'https://sxsgdpqojepgbbrxrzlq.supabase.co/functions/v1/globalsiai-bot',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-lx-schedule-key', (select decrypted_secret from vault.decrypted_secrets where name='lx_globalsiai_schedule_secret')
      ),
      body := '{"slot":"comparison"}'::jsonb,
      timeout_milliseconds := 10000
    );
  $job$
);


select cron.schedule(
  'globalsiai-creation',
  '5 9 * * *',
  $job$
    select net.http_post(
      url := 'https://sxsgdpqojepgbbrxrzlq.supabase.co/functions/v1/globalsiai-bot',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-lx-schedule-key', (select decrypted_secret from vault.decrypted_secrets where name='lx_globalsiai_schedule_secret')
      ),
      body := '{"slot":"creation"}'::jsonb,
      timeout_milliseconds := 10000
    );
  $job$
);


select cron.schedule(
  'globalsiai-community',
  '5 12 * * *',
  $job$
    select net.http_post(
      url := 'https://sxsgdpqojepgbbrxrzlq.supabase.co/functions/v1/globalsiai-bot',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-lx-schedule-key', (select decrypted_secret from vault.decrypted_secrets where name='lx_globalsiai_schedule_secret')
      ),
      body := '{"slot":"community"}'::jsonb,
      timeout_milliseconds := 10000
    );
  $job$
);
