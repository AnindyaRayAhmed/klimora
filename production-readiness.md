# Klimora Production Readiness Guide

This document serves as the definitive runbook for deploying Klimora Phase 4.5 securely into production on Google Cloud Run and Supabase.

## Environment Variables

### Backend (Cloud Run)
The backend container requires the following environment variables injected at deployment. **Never commit these to version control.**

* `NODE_ENV`: Set to `production`.
* `PORT`: Set to `8080` (Cloud Run default).
* `API_BASE_PATH`: Set to `/api/v1`.
* `FRONTEND_URL`: Set to the exact deployed frontend origin (e.g., `https://klimora.app`) to strictly enforce CORS headers.
* `SUPABASE_URL`: Your Supabase project URL.
* `SUPABASE_ANON_KEY`: The public anon key (used in some contexts).
* `SUPABASE_SERVICE_ROLE_KEY`: **[CRITICAL]** Keep secret. Used by background AI and verification jobs to bypass RLS safely.
* `GEMINI_API_KEY`: Google Gemini provider key for the Rit Agent and Verification flows.
* `OPENWEATHER_API_KEY`: Access key for OpenWeather.
* `SENTINEL_HUB_CLIENT_ID`: Planet/Sentinel provider access ID.
* `SENTINEL_HUB_CLIENT_SECRET`: Planet/Sentinel provider access secret.

### Frontend (Vite Static Hosting)
The frontend should be built and served as a static asset. The only environment variables safely injected during the build step are:

* `VITE_SUPABASE_URL`: The Supabase project URL.
* `VITE_SUPABASE_ANON_KEY`: The public anon key.
* `VITE_GOOGLE_MAPS_API_KEY`: Maps browser key (if applicable, with HTTP referrers restricted in GCP console).

> [!WARNING]
> Ensure no backend secrets (Gemini, Sentinel, OpenWeather) ever appear in `import.meta.env` or `.env.production` for the frontend.

## Deployment Sequence

Deploy the stack in the following exact order to prevent orphaned data or failed startup checks:

1. **Supabase Migrations**: Run all migrations sequentially using the Supabase CLI (`supabase db push`).
2. **Supabase Storage Policies**: Verify the bucket and object-level RLS policies apply via the Supabase dashboard.
3. **Backend Container**: Build the Docker image, push to Google Artifact Registry, and deploy to Cloud Run.
4. **Frontend Asset Build**: Run `npm run build` injecting the Supabase keys, and deploy to your static hosting provider (e.g., Firebase Hosting, Vercel).

## Supabase Deployment Checklist

### RLS Policies
Ensure `ENABLE ROW LEVEL SECURITY` is explicitly declared on all application tables.
- [ ] `profiles`
- [ ] `mission_submissions`
- [ ] `verification_results`
- [ ] `user_points`
- [ ] `rit_conversations`
- [ ] `rit_messages`
- [ ] `user_behavior_profiles`
- [ ] `user_behavior_history`
- [ ] `rit_insights`

### Bucket Policies (`mission-evidence` Bucket)
- [ ] The bucket is set to `Public: false`.
- [ ] Object Insert Policy restricts folder path to `auth.uid()`.
- [ ] Object Insert Policy validates MIME extensions (`IN ('jpg', 'jpeg', 'png', 'mp4', 'mov')`).
- [ ] Object Select/Delete Policies restrict access to `auth.uid()`.

## Rollback Considerations

If the backend deployment introduces critical failures (e.g. failing healthchecks or missing environment variables):
1. **Traffic Split**: Use Cloud Run's native traffic routing to route 100% of traffic back to the previous stable revision.
2. **Database Migrations**: If `008_security_hardening.sql` must be rolled back due to breaking legitimate user flows, execute a `DROP POLICY` script for the offending policies rather than dropping the tables.
3. **Log Audit**: Check Cloud Run logs immediately. Because `app.ts` implements redaction for headers and tokens, logs are safe to export to Google Cloud Logging for post-mortem analysis.
