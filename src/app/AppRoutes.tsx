import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import PrivateRoute from '@routes/PrivateRoutes'
import AdminRoute from '@routes/AdminRoutes'
import PublicOnlyRoute from '@routes/PublicRoutes'
import MainLayout from '@layouts/MainLayout'
import AdminLayout from '@layouts/AdminLayout'

// ─── Customer pages ───────────────────────────────────────────────────────────
const CustomerLoginPage = lazy(
  () => import('@features/authentication/CustomerLoginPage'),
)
const AdminLoginPage = lazy(
  () => import('@features/authentication/AdminLoginPage'),
)
const ProfilePage = lazy(() => import('@features/profile/ProfilePage'))
const ProfileSettingsPage = lazy(() => import('@features/profile/ProfileSettingsPage'))
const HomePage = lazy(() => import('@features/home/HomePage'))
const GalleryPage = lazy(() => import('@features/gallery/GalleryPage'))
const ProductsPage = lazy(() => import('@features/products/ProductsPage'))
const ContactPage = lazy(() => import('@features/contact/ContactPage'))
const LoyaltyPage = lazy(() => import('@features/loyalty/LoyaltyPage'))
const SubscriptionPage = lazy(
  () => import('@features/subscriptions/SubscriptionPage'),
)
const SubscriptionsCatalogPage = lazy(
  () => import('@features/subscriptions/SubscriptionsCatalogPage'),
)
const NotificationsPage = lazy(
  () => import('@features/notifications/NotificationsPage'),
)
const MyReservationsPage = lazy(
  () => import('@features/reservations/MyReservationsPage'),
)
const ReservationWizard = lazy(
  () => import('@features/reservations/ReservationWizard'),
)
const ReservationQRPage = lazy(
  () => import('@features/reservations/ReservationQRPage'),
)

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminScannerPage = lazy(
  () => import('@features/admin/AdminScannerPage'),
)
const AdminSubscriptionsPage = lazy(
  () => import('@features/admin/AdminSubscriptionsPage'),
)
const AdminDashboardPage = lazy(
  () => import('@features/admin/AdminDashboardPage'),
)
const AdminSettingsPage = lazy(
  () => import('@features/admin/AdminSettingsPage'),
)
const AdminComingSoonPage = lazy(
  () => import('@features/admin/AdminComingSoonPage'),
)
const AdminBarbersPage = lazy(() => import('@features/admin/AdminBarbersPage'))
const AdminServicesPage = lazy(() => import('@features/admin/AdminServicesPage'))
const AdminProductsPage = lazy(() => import('@features/admin/AdminProductsPage'))
const AdminGalleryPage = lazy(() => import('@features/admin/AdminGalleryPage'))
const AdminClientsPage = lazy(() => import('@features/admin/AdminClientsPage'))
const AdminContactPage = lazy(() => import('@features/admin/AdminContactPage'))
const AdminAnnouncementsPage = lazy(() => import('@features/admin/AdminAnnouncementsPage'))
const AdminReservationsPage = lazy(() => import('@features/admin/AdminReservationsPage'))

// ─── 404 ─────────────────────────────────────────────────────────────────────
const NotFound: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
    <p className="text-6xl font-bold text-accent">404</p>
    <h1 className="text-xl font-semibold text-primary">Page introuvable</h1>
    <p className="text-sm text-gray-500">Cette page n'existe pas.</p>
  </div>
)

// ─── Page loader ──────────────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
  </div>
)

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ------------------------------------------------------------------ */}
        {/* PUBLIC ONLY — redirect away if already authenticated               */}
        {/* ------------------------------------------------------------------ */}
        <Route element={<PublicOnlyRoute forAdmin={false} />}>
          <Route path={ROUTES.LOGIN} element={<CustomerLoginPage />} />
        </Route>

        <Route element={<PublicOnlyRoute forAdmin={true} />}>
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
        </Route>

        {/* ------------------------------------------------------------------ */}
        {/* PRIVATE CUSTOMER — requires customer session                       */}
        {/* ------------------------------------------------------------------ */}
        <Route element={<PrivateRoute />}>
          <Route
            path={ROUTES.HOME}
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.GALLERY}
            element={
              <MainLayout>
                <GalleryPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.PRODUCTS}
            element={
              <MainLayout>
                <ProductsPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.MY_RESERVATIONS}
            element={
              <MainLayout>
                <MyReservationsPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.PROFILE_SETTINGS}
            element={
              <MainLayout>
                <ProfileSettingsPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.CONTACT}
            element={
              <MainLayout>
                <ContactPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.LOYALTY}
            element={
              <MainLayout>
                <LoyaltyPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.SUBSCRIPTIONS}
            element={
              <MainLayout>
                <SubscriptionPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.SUBSCRIPTIONS_CATALOG}
            element={
              <MainLayout>
                <SubscriptionsCatalogPage />
              </MainLayout>
            }
          />
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <MainLayout>
                <NotificationsPage />
              </MainLayout>
            }
          />

          {/* Reservation Wizard */}
          <Route
            path={ROUTES.RESERVATION}
            element={<ReservationWizard />}
          />
          {/* QR View */}
          <Route
            path="/reservations/:id/qr"
            element={<ReservationQRPage />}
          />
        </Route>

        {/* ------------------------------------------------------------------ */}
        {/* PRIVATE ADMIN — requires Firebase Auth                             */}
        {/* ------------------------------------------------------------------ */}
        <Route element={<AdminRoute />}>
          {/* Today's Queue (default dashboard) */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            }
          />
          {/* Subscriptions */}
          <Route
            path={ROUTES.ADMIN_SUBSCRIPTIONS}
            element={
              <AdminLayout>
                <AdminSubscriptionsPage />
              </AdminLayout>
            }
          />
          {/* Settings */}
          <Route
            path={ROUTES.ADMIN_SETTINGS}
            element={
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            }
          />
          {/* QR Scanner (standalone — no AdminLayout chrome) */}
          <Route
            path={ROUTES.ADMIN_SCANNER}
            element={<AdminScannerPage />}
          />
          {/* Actual CRUD pages */}
          <Route path={ROUTES.ADMIN_RESERVATIONS} element={<AdminLayout><AdminReservationsPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_BARBERS} element={<AdminLayout><AdminBarbersPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_SERVICES} element={<AdminLayout><AdminServicesPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminLayout><AdminProductsPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_GALLERY} element={<AdminLayout><AdminGalleryPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_CLIENTS} element={<AdminLayout><AdminClientsPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_CONTACT} element={<AdminLayout><AdminContactPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_ANNOUNCEMENTS} element={<AdminLayout><AdminAnnouncementsPage /></AdminLayout>} />
          <Route path={ROUTES.ADMIN_COMING_SOON} element={<AdminLayout><AdminComingSoonPage /></AdminLayout>} />
        </Route>

        {/* ------------------------------------------------------------------ */}
        {/* 404                                                                */}
        {/* ------------------------------------------------------------------ */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
