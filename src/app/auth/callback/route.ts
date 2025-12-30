import { createServerClient } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    const type = searchParams.get('type') as EmailOtpType | null;

    if (code) {
        const cookieStore = await cookies();

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Missing Supabase environment variables in auth callback');
            return NextResponse.redirect(new URL('/login?error=missing_env_vars', request.url));
        }

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: Record<string, any>) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: Record<string, any>) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    if (type) {
        // Handling magic links or other OTP types if necessary
        // but exchangeCodeForSession usually handles the hash/code exchange
    }

    // Return the user to an error page with some instructions
    return NextResponse.redirect(new URL('/login?error=auth_code_error', request.url));
}
