import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/site/HomePage'

/**
 * Routing.
 *
 * The home page is bundled eagerly because it is what most visitors land on.
 * Everything else — the rest of the marketing site and the whole workspace — is
 * split per route, so a visitor reading the pricing page never downloads the
 * video-review screens, and a coach opening the workspace never downloads the
 * careers page.
 */

// Marketing
const AboutPage = lazy(() => import('./pages/site/AboutPage').then((m) => ({ default: m.AboutPage })))
const CareersPage = lazy(() => import('./pages/site/CareersPage').then((m) => ({ default: m.CareersPage })))
const ContactPage = lazy(() => import('./pages/site/ContactPage').then((m) => ({ default: m.ContactPage })))
const FaqPage = lazy(() => import('./pages/site/FaqPage').then((m) => ({ default: m.FaqPage })))
const FeaturesPage = lazy(() => import('./pages/site/FeaturesPage').then((m) => ({ default: m.FeaturesPage })))
const HowItWorksPage = lazy(() => import('./pages/site/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })))
const PricingPage = lazy(() => import('./pages/site/PricingPage').then((m) => ({ default: m.PricingPage })))
const PrivacyPage = lazy(() => import('./pages/site/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const RecordVideoPage = lazy(() => import('./pages/site/RecordVideoPage').then((m) => ({ default: m.RecordVideoPage })))
const ResourcesPage = lazy(() => import('./pages/site/ResourcesPage').then((m) => ({ default: m.ResourcesPage })))
const TermsPage = lazy(() => import('./pages/site/TermsPage').then((m) => ({ default: m.TermsPage })))
const TestimonialsPage = lazy(() => import('./pages/site/TestimonialsPage').then((m) => ({ default: m.TestimonialsPage })))

// Workspace
const UploadPage = lazy(() => import('./pages/UploadPage').then((m) => ({ default: m.UploadPage })))
const ProcessingPage = lazy(() => import('./pages/ProcessingPage').then((m) => ({ default: m.ProcessingPage })))
const ResultsPage = lazy(() => import('./pages/ResultsPage').then((m) => ({ default: m.ResultsPage })))
const BallFlightPage = lazy(() => import('./pages/BallFlightPage').then((m) => ({ default: m.BallFlightPage })))
const BallFlightProcessingPage = lazy(() =>
  import('./pages/BallFlightProcessingPage').then((m) => ({ default: m.BallFlightProcessingPage })),
)
const BallFlightResultsPage = lazy(() =>
  import('./pages/BallFlightResultsPage').then((m) => ({ default: m.BallFlightResultsPage })),
)
const TrainPage = lazy(() => import('./pages/TrainPage').then((m) => ({ default: m.TrainPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))

/** Shown while a route chunk loads. Dark, so it never flashes white. */
function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-night">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lime to-lime-deep">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="#05090a" />
            <path d="M6 6.5 Q12 12 6 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M18 6.5 Q12 12 18 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <span className="animate-pulse-bar text-xs font-semibold uppercase tracking-[0.2em] text-chalk/45">
          Loading
        </span>
      </div>
    </div>
  )
}

/** The workspace shares one chrome; marketing pages bring their own. */
function AppShell({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ---------------- Marketing ---------------- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/record" element={<RecordVideoPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* ---------------- Application ---------------- */}
          <Route path="/app" element={<AppShell><UploadPage /></AppShell>} />
          <Route
            path="/app/processing/:jobId"
            element={<AppShell><ProcessingPage /></AppShell>}
          />
          <Route
            path="/app/results/:deliveryId"
            element={<AppShell><ResultsPage /></AppShell>}
          />
          <Route
            path="/app/ball-flight"
            element={<AppShell><BallFlightPage /></AppShell>}
          />
          <Route
            path="/app/ball-flight/processing/:jobId"
            element={<AppShell><BallFlightProcessingPage /></AppShell>}
          />
          <Route
            path="/app/ball-flight/results/:sessionId"
            element={<AppShell><BallFlightResultsPage /></AppShell>}
          />
          <Route path="/app/train" element={<AppShell><TrainPage /></AppShell>} />
          <Route path="/app/history" element={<AppShell><HistoryPage /></AppShell>} />

          {/* Links minted before the workspace moved under /app */}
          <Route path="/processing/:jobId" element={<Navigate to="/app" replace />} />
          <Route path="/results/:deliveryId" element={<Navigate to="/app" replace />} />
          <Route path="/ball-flight/*" element={<Navigate to="/app/ball-flight" replace />} />
          <Route path="/train" element={<Navigate to="/app/train" replace />} />
          <Route path="/history" element={<Navigate to="/app/history" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
