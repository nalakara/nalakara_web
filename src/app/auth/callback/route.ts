import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/admin';

  if (error || errorDescription) {
    const redirectUrl = new URL('/admin/login', origin);
    redirectUrl.searchParams.set('error', errorDescription || error || 'Authentication failed');
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      const redirectUrl = new URL('/admin/login', origin);
      redirectUrl.searchParams.set('error', exchangeError.message || 'Unable to exchange authentication code');
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // If no code provided, redirect to login
  const redirectUrl = new URL('/admin/login', origin);
  redirectUrl.searchParams.set('error', 'No authentication code found in callback URL');
  return NextResponse.redirect(redirectUrl.toString());
}
