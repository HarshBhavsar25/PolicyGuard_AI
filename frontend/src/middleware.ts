import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value

    // If no auth token and trying to access anything other than /login
    if (!authToken && !request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If authenticated and trying to access /login, redirect to home
    if (authToken && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Match all paths except explicit static assets, next internals, and api routes if they shouldn't be protected
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
}
