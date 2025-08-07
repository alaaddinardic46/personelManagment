import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import cookie from 'cookie'

// Middleware işlevi
export function middleware(req: NextRequest) {
  const cookies = cookie.parse(req.headers.get('cookie') || '')
  const user = cookies.user ? JSON.parse(cookies.user) : null

  // Eğer kullanıcı girişi yapılmamışsa, login sayfasına yönlendir
  if (!user) {
    if (req.nextUrl.pathname === '/login') {
      return NextResponse.next()  // Login sayfasına zaten gidiyorsa yönlendirme yapma
    }
    return NextResponse.redirect(new URL('/login', req.url))  // Login sayfasına yönlendir
  }

  // Eğer kullanıcı giriş yapmışsa ve ana sayfaya (admin sayfası) erişiyorsa
  if (req.nextUrl.pathname === '/') {
    // Kullanıcı admin değilse, user sayfasına yönlendir
    if (user.status !== '1') {
      return NextResponse.redirect(new URL('/user', req.url))  // User kullanıcılarını user sayfasına yönlendir
    }
  }

  // Eğer kullanıcı giriş yapmışsa ve user sayfasına erişiyorsa
  if (req.nextUrl.pathname.startsWith('/user')) {
    // Kullanıcı adminse, user sayfasına erişmesini engelle ve ana sayfaya yönlendir
    if (user.status === '1') {
      return NextResponse.redirect(new URL('/', req.url))  // Admin kullanıcılarını ana sayfaya yönlendir
    }
  }

  // Eğer kullanıcı zaten login olmuş ve doğru sayfada ise yönlendirme yapma
  if (user && req.nextUrl.pathname === '/login') {
    const redirectUrl = user.status === '1' ? '/' : '/user' // Kullanıcının rolüne göre yönlendir
    return NextResponse.redirect(new URL(redirectUrl, req.url)) // Doğru sayfaya yönlendir
  }

  return NextResponse.next()  // Diğer durumlarda sayfayı geçmeye devam et
}

// Bu middleware sadece '/user', '/login', '/' gibi sayfalarda çalışacak
export const config = {
  matcher: ['/', '/user', '/login'], // Yalnızca bu sayfalarda middleware çalışacak
}