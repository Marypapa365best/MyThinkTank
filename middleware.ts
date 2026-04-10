import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 需要登录才能访问的路由
const isProtectedRoute = createRouteMatcher([
  '/history(.*)',
  '/create-skill(.*)',
  '/api/db/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
