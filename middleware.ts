export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/add-product/:path*',
    '/deals-new/:path*',
    '/wishlist/:path*',
  ],
};