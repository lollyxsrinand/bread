import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

const protectedPaths = ['/home', '/settings'];

export async function proxy(request: NextRequest) {
    if (!protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jose.jwtVerify(token, secret)

        console.log('User authenticated:', payload.userId);
        
        return NextResponse.next()
        // const response = NextResponse.next();
        // response.headers.set('X-User-ID', payload.userId as string);
        // return response;

    } catch (error) {
        console.error('JWT Verification Failed:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}
