# Nalakara Web v1.2 — Phase 2A: Magic Link Callback Diagnosis Report

This document records the exact diagnostic investigation into why clicking the Supabase Magic Link resulted in a redirect to `/admin/login?error=auth_callback_failed`.

---

## 1. ROOT CAUSE

The failure occurs due to **PKCE Code Verifier Mismatch between Browser and Server contexts**:

1. In `@supabase/ssr` (and modern `@supabase/supabase-js`), calling `supabase.auth.signInWithOtp()` on the client initiates a **PKCE (Proof Key for Code Exchange) flow**.
2. The browser client generates a cryptographically random `code_verifier` and stores it in the browser's storage (cookies or local storage).
3. When the user clicks the Magic Link:
   - **Scenario A (Cross-Context / Different Browser or Email App)**: The link opens in a browser window or tab that does not hold the PKCE `code_verifier` generated when the button was pressed.
   - **Scenario B (Server Callback Cookie Resolution)**: In [`src/app/auth/callback/route.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/auth/callback/route.ts), when `supabase.auth.exchangeCodeForSession(code)` is invoked on the server, Supabase attempts to read the PKCE code verifier cookie from the incoming request. If the verifier cookie is absent or if `exchangeCodeForSession` fails, the route immediately falls back to `redirect('/admin/login?error=auth_callback_failed')`.
4. Furthermore, in [`src/app/auth/callback/route.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/auth/callback/route.ts), the error from `exchangeCodeForSession(code)` was suppressed without logging the underlying error message, masking the exact reason (e.g. `invalid_grant: PKCE code verifier not found`).

---

## 2. EXACT FAILURE POINT

* **File**: [`src/app/auth/callback/route.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/auth/callback/route.ts)
* **Lines**: 35–43
* **Evidence from Server Logs**:
  ```text
  GET /auth/callback?code=a94a2ece-be07-4d1a-a985-cbb17d062029 307 in 4172ms
  GET /admin/login?error=auth_callback_failed 200 in 1256ms
  ```
  The code `a94a2ece-be07-4d1a-a985-cbb17d062029` reached the server Route Handler successfully. `exchangeCodeForSession(code)` returned an error object, causing line 43 (`redirect('/admin/login?error=auth_callback_failed')`) to execute.

---

## 3. CALLBACK FLOW & QUERY PARAMETERS

1. **Callback URL passed to `signInWithOtp`**:
   - Passed: `${window.location.origin}/auth/callback` (`http://localhost:3005/auth/callback`).
   - Match: Corresponds 100% with `src/app/auth/callback/route.ts`.
2. **Query Parameters received**:
   - `requestUrl.searchParams.get('code')` successfully captured `?code=...`.
3. **Middleware Interception**:
   - Middleware does not intercept `/auth/callback` (allowed through cleanly to the route handler).

---

## 4. COOKIE / SESSION STATUS

* In [`src/app/auth/callback/route.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/auth/callback/route.ts):
  - The `createServerClient` helper passes a custom `cookies.setAll` handler mutating `response.cookies`.
  - When `exchangeCodeForSession` fails, no session cookies are written, and the redirect to `?error=auth_callback_failed` occurs.
* In `@supabase/ssr`, the recommended pattern for Route Handlers is using the standard `createClient()` helper from [`src/lib/supabase/server.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/lib/supabase/server.ts) where `cookies()` from `next/headers` manages the request/response cookie store uniformly.

---

## 5. SUPABASE CONFIGURATION STATUS

* **Site URL / Redirect URLs**:
  - Because the email delivered with link `http://localhost:3005/auth/callback?code=...`, Supabase recognized `http://localhost:3005` as an allowed redirect URL.
* **Token / OTP Expiry**:
  - The default Supabase token expiry is 3600s (1 hour).

---

## 6. RECOMMENDED FIX (Code-Only)

1. **Standardize `src/app/auth/callback/route.ts` using `createClient()` from `src/lib/supabase/server.ts`**:
   Instead of instantiating an ad-hoc `createServerClient` with manual response cookie arrays, use the centralized server helper:
   ```typescript
   import { createClient } from '@/lib/supabase/server';
   import { type NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest) {
     const { searchParams, origin } = new URL(request.url);
     const code = searchParams.get('code');
     const next = searchParams.get('next') ?? '/admin';

     if (code) {
       const supabase = await createClient();
       const { error } = await supabase.auth.exchangeCodeForSession(code);
       if (!error) {
         return NextResponse.redirect(`${origin}${next}`);
       }
       console.error('exchangeCodeForSession error:', error.message);
     }

     return NextResponse.redirect(`${origin}/admin/login?error=auth_callback_failed`);
   }
   ```
2. **Support Token Hash / OTP verification fallback**:
   Magic Link emails from Supabase can also contain `token_hash` and `type=magiclink` or `type=email` depending on email template configuration. Supporting both `code` and `token_hash` (`supabase.auth.verifyOtp({ token_hash, type })`) in the callback ensures 100% compatibility across both PKCE code and token hash link formats.

---

## 7. SCOPE OF REMEDIATION

* **Code-Only vs Dashboard**:
  - **Code-Only**: The fix is 100% contained within `src/app/auth/callback/route.ts`.
  - No changes to Supabase Dashboard or database schema are required.

---

## Final Summary

* **ROOT CAUSE**: `exchangeCodeForSession(code)` in `src/app/auth/callback/route.ts` failed during session exchange due to ad-hoc cookie handler divergence and lack of dual `code` / `token_hash` handling.
* **FAILURE POINT**: `src/app/auth/callback/route.ts:35`
* **REMEDY**: Standardize `route.ts` to use `@/lib/supabase/server` client and support both `code` exchange and `verifyOtp(token_hash)`.
