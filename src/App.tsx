import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BallFlightPage } from './pages/BallFlightPage'
import { BallFlightProcessingPage } from './pages/BallFlightProcessingPage'
import { BallFlightResultsPage } from './pages/BallFlightResultsPage'
import { HistoryPage } from './pages/HistoryPage'
import { ProcessingPage } from './pages/ProcessingPage'
import { ResultsPage } from './pages/ResultsPage'
import { TrainPage } from './pages/TrainPage'
import { UploadPage } from './pages/UploadPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/processing/:jobId" element={<ProcessingPage />} />
          <Route path="/results/:deliveryId" element={<ResultsPage />} />
          <Route path="/ball-flight" element={<BallFlightPage />} />
          <Route path="/ball-flight/processing/:jobId" element={<BallFlightProcessingPage />} />
          <Route path="/ball-flight/results/:sessionId" element={<BallFlightResultsPage />} />
          <Route path="/train" element={<TrainPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
