# Nalakara Web v1.2 — Production PKCE Authentication Diagnosis Report

This document records the systematic audit and root cause diagnosis of the production authentication error encountered on `https://nalakaraweb.vercel.app/auth/callback`:
> **"PKCE code verifier not found in storage."**

---

## 1. Executive Summary & Diagnostic Verdict

* **Error**: `PKCE code verifier not found in storage`
* **Affected Endpoint**: `https://nalakaraweb.vercel.app/auth/callback?code=...`
* **Root Cause**: **Cross-Context PKCE Cookie Isolation & Client-Side Callback Architecture**.
  - When requesting the Magic Link on `/admin/login`, `@supabase/ssr` (`createBrowserClient`) generates a cryptographic PKCE `code_verifier` and stores it in the browser's local cookie jar under the key:
    `sb-sbdwivikjkyvobfopcbr-auth-token-code-verifier`.
  - When the owner receives the email and clicks the Magic Link, the operating system opens the link in the **default system browser** or within an **in-app mail webview** (e.g. Apple Mail, Gmail app, Outlook).
  - If the link opens in a browser profile or window different from where the Magic Link was initiated, the `code_verifier` cookie **does not exist** in that browser's cookie jar.
  - Furthermore, `/auth/callback` is currently implemented as a client component (`page.tsx`) rather than the canonical Next.js Server Route Handler (`route.ts`), which prevents clean server-side cookie exchange.

---

## 2. Deep Technical Audit (8-Point Checklist)

### 1. Where `createBrowserClient()` stores the PKCE code verifier
* **Storage Location**: Browser cookies via `document.cookie`.
* **Exact Cookie Key**: `sb-<project-ref>-auth-token-code-verifier`
  (In our production Supabase project: `sb-sbdwivikjkyvobfopcbr-auth-token-code-verifier`).

### 2. Storage Mechanism & Cookie Attributes
* **Mechanism**: Handled by `@supabase/ssr` / `@supabase/auth-js`.
* **Attributes**: `path=/`, `SameSite=Lax`, `Secure` (over HTTPS on `nalakaraweb.vercel.app`).
* **TTL**: Short-lived session cookie intended solely for the duration of the authentication exchange.

### 3. Does the callback request receive the verifier cookie in production?
* **Same Browser Tab / Window**: **YES**. If the link is copied and pasted into the exact same browser tab where the login was initiated, the cookie is sent.
* **Email Client / External Browser Window**: **NO**. Clicking an email link in an external mail client (Apple Mail, Outlook, etc.) spawns a request in a new context without the originating cookie jar. The request to `/auth/callback` arrives with zero `code-verifier` cookies.

### 4. Is `createServerClient()` configured for the same cookie namespace?
* **Yes**. Both `src/lib/supabase/client.ts` (`createBrowserClient`) and `src/lib/supabase/server.ts` (`createServerClient`) use standard `@supabase/ssr` defaults (`sb-<project-ref>-auth-token`).

### 5. Is the callback using the correct client architecture?
* **Current State**: `src/app/auth/callback/page.tsx` is a **Client Component (`'use client'`)** executing `supabase.auth.exchangeCodeForSession(code)` in `useEffect()`.
* **Supabase SSR Standard**: The canonical Next.js App Router pattern requires a **Server Route Handler (`src/app/auth/callback/route.ts`)** using `createServerClient()` from `src/lib/supabase/server.ts`. This ensures cookie exchange occurs on the server and `Set-Cookie` headers are set directly on the HTTP response before redirecting to `/admin`.

### 6. Does Middleware modify, delete, or drop auth cookies?
* **Inspection of `src/lib/supabase/middleware.ts`**:
  * `updateSession()` intercepts `/auth/callback` because it is matched by the general route matcher.
  * It calls `supabase.auth.getUser()`, which returns `user: null` prior to code exchange.
  * It does not delete or truncate `sb-*` cookies.
  * However, running `getUser()` on the callback route before the exchange is unnecessary and should be skipped for `/auth/callback`.

### 7. Vercel / Next.js Production Behavior
* On Vercel HTTPS (`https://nalakaraweb.vercel.app`):
  * Cookies with `SameSite=Lax` and `Secure` are strictly partitioned by browser profile and domain.
  * Cross-browser cookie sharing is blocked by design across all modern browsers (Chrome, Safari, Firefox).

### 8. `@supabase/ssr` Package Constraints (`^0.12.5`)
* `@supabase/ssr` enforces strict PKCE flow by default for all `signInWithOtp` calls.
* PKCE is fundamentally a defense against authorization code interception, which requires the verifier to exist in the exchanging client.

---

## 3. The Structural Failure Mechanism

```
[1. Owner enters email on https://nalakaraweb.vercel.app/admin/login in Browser A (e.g. Chrome)]
       │
       ▼
   Browser A stores cookie: `sb-sbdwivikjkyvobfopcbr-auth-token-code-verifier`
   Supabase sends email with:
     - Magic Link: https://nalakaraweb.vercel.app/auth/callback?code=...
     - 6-Digit OTP Code: 123456

[2. Owner opens email in Mail App and clicks link]
       │
       ├─ Scenario A (Link opens in Browser A):
       │   └─ Cookie exists ──> exchangeCodeForSession(code) SUCCEEDS ──> Redirects to /admin
       │
       └─ Scenario B (Link opens in Browser B / Mail Webview / Different Window):
           └─ Cookie DOES NOT EXIST
               └─ exchangeCodeForSession(code) FAILS:
                  "PKCE code verifier not found in storage."
```

---

## 4. Minimal Clean Architectural Fix

To solve this permanently without weakening security or introducing passwords:

### Component 1: Convert Callback to Server Route Handler (`src/app/auth/callback/route.ts`)
Replace `page.tsx` with a standard Next.js App Router Route Handler:
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return user to login with informative error parameter
  return NextResponse.redirect(`${origin}/admin/login?error=auth-code-expired`);
}
```

### Component 2: Dual In-Browser Verification on `/admin/login` (Magic Link + 6-Digit OTP)
When `signInWithOtp` is called, Supabase sends an email containing **both** the Magic Link and a **6-Digit OTP Code**.
By adding a 6-digit code input on the login page:
1. The owner can click the Magic Link (works if opened in same browser).
2. **OR** the owner can simply copy the 6-digit code from email and enter it directly into the login form:
   ```typescript
   const { error } = await supabase.auth.verifyOtp({
     email,
     token: otpToken,
     type: 'email',
   });
   ```
3. **Why this is completely immune to the PKCE cross-browser issue**:
   - The OTP verification request is executed directly inside the originating browser tab.
   - It works across any device, mail client, or incognito setup.
   - It is 100% passwordless and preserves single-owner allowlist security.

---

## 5. Security & Invariant Guarantees

* **Single-Owner Protection**: Verified via `admin_users` table after session establishment.
* **RLS**: Active and enforced on all tables.
* **Passwordless**: 100% passwordless (Magic Link + One-Time Password token).
* **Zero Secret Leakage**: Service role key remains server-only.

---

## 6. Request for Approval

Diagnosis is complete. Awaiting user approval before applying the fix.
