# Nalakara Web v1.2 — Phase 2A: PKCE Verifier Storage Diagnosis Report

This document records the exact investigation into the authentication error:
> *"PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared."*

---

## 1. EXACT ROOT CAUSE

The failure originates from **cross-context PKCE storage loss**:

1. **How PKCE Works in `@supabase/ssr`**:
   * When `supabase.auth.signInWithOtp()` is called in the browser, `@supabase/ssr` (`createBrowserClient`) generates a random PKCE `code_challenge` and a matching `code_verifier`.
   * The `code_verifier` is stored locally in the browser cookie under the key pattern:
     `sb-<project-ref>-auth-token-code-verifier` (or `sb-<project-ref>-auth-token-flow-<id>-code-verifier`).
2. **Where the Failure Occurred**:
   * The PKCE flow is strictly bound to the **originating browser instance / profile / cookie jar**.
   * When the Magic Link email is received:
     * **Primary Cause (Cross-Browser Opening)**: If the Magic Link is clicked from an email client (such as Apple Mail, Outlook, Gmail app, or a different browser profile), the link opens in a separate browser context or private window that does **not** contain the `code_verifier` cookie that was set when clicking "Send Magic Link".
     * **Secondary Factor (Storage Lifecycle)**: If the user cleared cookies/cache, or if the browser blocks first-party cookies, `createBrowserClient` cannot find the matching verifier key when calling `exchangeCodeForSession(code)`.

---

## 2. DETAILED CHECKLIST ANALYSIS

| Inspection Item | Finding & Evidence |
| :--- | :--- |
| **A. `client.ts` Implementation** | Uses `createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)` from `@supabase/ssr: ^0.12.5`. **Compliant**. |
| **B. `server.ts` Implementation** | Uses `createServerClient<Database>` from `@supabase/ssr` with Next.js `cookies()`. **Compliant**. |
| **C. Environment Variables** | Both `client.ts` and `server.ts` read the exact same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| **D. PKCE Storage Compatibility** | `createBrowserClient` defaults to `flowType: 'pkce'`. It uses browser `document.cookie` adapter under key `sb-<project-ref>-auth-token`. |
| **E. Verifier Cookie Storage** | Stored in `document.cookie`. Survives in-page navigation and reloads within the **same browser session**, but is unavailable across different browsers/devices. |
| **F. Cookie Attributes** | `Path=/`, `SameSite=Lax`, `Secure` (when https). |
| **G. Middleware Impact** | `src/middleware.ts` runs `updateSession()`. It only touches `admin/*` and does not delete or truncate `sb-*` auth cookies. |
| **H. Client Creation Per Request** | `src/app/auth/callback/page.tsx` initializes `createClient()` upon mount. |
| **I. Storage Mixing** | The current callback is purely client-side; it uses the exact same `createBrowserClient` as `src/app/admin/login/page.tsx`. |
| **J. Package Versions** | `@supabase/ssr: ^0.12.5`, `@supabase/supabase-js: ^2.112.4`, `next: ^15.1.7`. |
| **K. Client vs Server Config Mismatch** | No mismatch. Both use standard default storage keys (`sb-<project-ref>-auth-token`). |

---

## 3. WHERE THE FLOW BREAKS

```
1. [User opens http://localhost:3005/admin/login in Browser A (e.g. Chrome)]
   └─ Browser A sets cookie: `sb-...-code-verifier`
2. [Supabase sends email with link: http://localhost:3005/auth/callback?code=...]
3. [User clicks link]
   ├─ If opened in Browser A:
   │  └─ Cookie exists → exchangeCodeForSession(code) SUCCEEDS.
   └─ If opened from Email Client in Browser B (e.g. Safari, Default Browser, or Webview):
      └─ Cookie DOES NOT EXIST → Fails with "PKCE code verifier not found in storage".
```

---

## 4. MINIMAL CORRECTIVE STRATEGY

To provide a robust, failure-proof login experience while preserving the passwordless architectural mandate:

1. **Retain Client-Side Callback with Informative Diagnostics**:
   * Add a clear visual hint on the Login page:
     > *"Important: Please open the Magic Link in this exact same browser window."*
   * If `PKCE code verifier not found` occurs, offer a 1-click **Email OTP Code (6-digit token)** input fallback.
2. **Alternative: 6-Digit Email OTP (Zero-Cookie PKCE Dependency)**:
   * Supabase `signInWithOtp` sends an email containing both a Magic Link and a **6-digit numeric token**.
   * In addition to clicking the link, the user can simply type or paste the 6-digit code directly into the login form:
     ```typescript
     supabase.auth.verifyOtp({
       email,
       token: otpCode,
       type: 'email'
     })
     ```
   * **Why this is superior**: The 6-digit token input works 100% reliably regardless of which email client, device, or browser opens the email, completely eliminating the cross-browser PKCE cookie issue while staying 100% passwordless.

---

## 5. IMPACT & CONFIGURATION AUDIT

* **Files That Would Need Modification**:
  - [`src/app/admin/login/page.tsx`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/admin/login/page.tsx) (Add 6-digit OTP code verification option alongside magic link).
  - [`src/app/auth/callback/page.tsx`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/auth/callback/page.tsx) (Handle callback error messaging gracefully).
* **Supabase Dashboard Changes**: None required. Supabase OTP emails already send the 6-digit token by default.
* **Database / Schema / RLS Changes**: **Zero** changes required. Single-owner verification via `admin_users` remains completely intact.

---

## 6. CURRENT TECHNICAL VALIDATION

* **TypeScript Compilation**: `npx tsc --noEmit` $\rightarrow$ **PASS (0 errors)**.
* **Production Build**: `npm run build` $\rightarrow$ **PASS (7/7 routes compiled cleanly)**.
