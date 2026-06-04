import { Navigate, Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { CareerDetailPage } from './pages/CareerDetailPage'
import { ExternalCareersPage } from './pages/ExternalCareersPage'
import { HomePage } from './pages/HomePage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { ResultsPage } from './pages/ResultsPage'
import { SourcesPage } from './pages/SourcesPage'

const App = () => (
  <div className="flex min-h-svh flex-col bg-zinc-50">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<QuestionnairePage />} path="/cuestionario" />
        <Route element={<ResultsPage />} path="/resultados" />
        <Route element={<CareerDetailPage />} path="/carreras/:careerId" />
        <Route element={<ExternalCareersPage />} path="/no-ofertadas" />
        <Route element={<SourcesPage />} path="/fuentes" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </main>
    <Footer />
  </div>
)

export default App
