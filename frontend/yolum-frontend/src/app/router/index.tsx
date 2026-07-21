import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { MarketingLayout } from '@/app/layouts/MarketingLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { AppLayout } from '@/app/layouts/AppLayout'
import { MentorAppLayout } from '@/app/layouts/MentorAppLayout'
import { ProtectedRoute, RoleRoute, GuestOnlyRoute } from '@/app/router/guards'
import { PageLoader } from '@/components/shared/PageLoader'

const LandingPage = lazy(() => import('@/features/landing/LandingPage'))
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const VerifyOtpPage = lazy(() => import('@/features/auth/VerifyOtpPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'))
const UserSignupPage = lazy(() => import('@/features/onboarding/user/UserSignupPage'))
const MentorSignupPage = lazy(() => import('@/features/onboarding/mentor/MentorSignupPage'))
const MentorApplicationStatusPage = lazy(() => import('@/features/onboarding/mentor/MentorApplicationStatusPage'))

const ChatPage = lazy(() => import('@/features/chat/ChatPage'))
const RoadmapPage = lazy(() => import('@/features/roadmap/RoadmapPage'))
const MentorFindPage = lazy(() => import('@/features/mentors/MentorFindPage'))
const MentorDetailPage = lazy(() => import('@/features/mentors/MentorDetailPage'))
const GamesPage = lazy(() => import('@/features/games/GamesPage'))
const GameDetailPage = lazy(() => import('@/features/games/GameDetailPage'))
const BlogPage = lazy(() => import('@/features/blog/BlogPage'))
const BlogArticlePage = lazy(() => import('@/features/blog/BlogArticlePage'))
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'))

const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const AccountSection = lazy(() => import('@/features/profile/sections/AccountSection'))
const FavoritesSection = lazy(() => import('@/features/profile/sections/FavoritesSection'))
const InterestsSection = lazy(() => import('@/features/profile/sections/InterestsSection'))
const SubscriptionSection = lazy(() => import('@/features/profile/sections/SubscriptionSection'))
const NotificationSettingsSection = lazy(() => import('@/features/profile/sections/NotificationSettingsSection'))
const SecuritySection = lazy(() => import('@/features/profile/sections/SecuritySection'))
const HelpSection = lazy(() => import('@/features/profile/sections/HelpSection'))

const MentorDashboardPage = lazy(() => import('@/features/mentor-dashboard/DashboardPage'))
const MentorSessionsPage = lazy(() => import('@/features/mentor-dashboard/SessionsPage'))
const MentorMessagesPage = lazy(() => import('@/features/mentor-dashboard/MessagesPage'))
const MentorReviewsPage = lazy(() => import('@/features/mentor-dashboard/ReviewsPage'))
const MentorEarningsPage = lazy(() => import('@/features/mentor-dashboard/EarningsPage'))

const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'))

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [{ path: '/', element: withSuspense(<LandingPage />) }],
  },
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: withSuspense(<LoginPage />) },
          { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
          { path: '/verify-otp', element: withSuspense(<VerifyOtpPage />) },
          { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
        ],
      },
      { path: '/assessment', element: withSuspense(<UserSignupPage />) },
      { path: '/onboarding/user', element: <Navigate to="/demo" replace /> },
      { path: '/signup', element: <Navigate to="/assessment" replace /> },
    ],
  },
  { path: '/mentor/signup', element: <Navigate to="/mentor/apply" replace /> },
  // Public MVP demo: marketplace APIs are AllowAny and receive the anonymous
  // X-Session-Id through the shared Axios client.
  {
    element: <AppLayout />,
    children: [
      { path: '/demo', element: withSuspense(<ChatPage guestMode />) },
      { path: '/demo/roadmap', element: withSuspense(<RoadmapPage guestMode />) },
      { path: '/mentors', element: withSuspense(<MentorFindPage />) },
      { path: '/mentors/:mentorId', element: withSuspense(<MentorDetailPage />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/mentor/apply', element: withSuspense(<MentorSignupPage />) },
      {
        path: '/mentor/application-status',
        element: withSuspense(<MentorApplicationStatusPage />),
      },
      {
        element: <AppLayout />,
        children: [
          { path: '/chat', element: withSuspense(<ChatPage />) },
          { path: '/roadmap', element: withSuspense(<RoadmapPage />) },
          { path: '/games', element: withSuspense(<GamesPage />) },
          { path: '/games/:gameId', element: withSuspense(<GameDetailPage />) },
          { path: '/blog', element: withSuspense(<BlogPage />) },
          { path: '/blog/:postId', element: withSuspense(<BlogArticlePage />) },
          { path: '/notifications', element: withSuspense(<NotificationsPage />) },
          {
            path: '/profile',
            element: withSuspense(<ProfilePage />),
            children: [
              { index: true, element: withSuspense(<AccountSection />) },
              { path: 'account', element: withSuspense(<AccountSection />) },
              { path: 'favorites', element: withSuspense(<FavoritesSection />) },
              { path: 'interests', element: withSuspense(<InterestsSection />) },
              { path: 'subscription', element: withSuspense(<SubscriptionSection />) },
              { path: 'notification-settings', element: withSuspense(<NotificationSettingsSection />) },
              { path: 'security', element: withSuspense(<SecuritySection />) },
              { path: 'help', element: withSuspense(<HelpSection />) },
            ],
          },
        ],
      },
      {
        element: <RoleRoute role="mentor" />,
        children: [
          {
            element: <MentorAppLayout />,
            children: [
              { path: '/mentor/dashboard', element: withSuspense(<MentorDashboardPage />) },
              { path: '/mentor/sessions', element: withSuspense(<MentorSessionsPage />) },
              { path: '/mentor/messages', element: withSuspense(<MentorMessagesPage />) },
              { path: '/mentor/reviews', element: withSuspense(<MentorReviewsPage />) },
              { path: '/mentor/earnings', element: withSuspense(<MentorEarningsPage />) },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
