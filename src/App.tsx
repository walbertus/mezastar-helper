/**
 * App component
 * Root application shell: HashRouter, routes, data loading, and layout.
 * Uses useMezatags hook for data; renders Header, SingleBattleView, or TrainerBattleView.
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import { useMezatags } from './hooks/useMezatags';
import { Header } from './components/Header';
import { SingleBattleView } from './components/SingleBattleView';
import { TrainerBattleView } from './components/TrainerBattleView';
import { Skeleton } from './components/ui/skeleton';

/** Loading skeleton that fills the main content area. */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      <Skeleton className="w-full md:w-[300px] h-64 md:h-full rounded-xl" />
      <Skeleton className="flex-1 h-64 md:h-full rounded-xl" />
    </div>
  );
}

/** Error banner shown when data fails to load. */
function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="px-4 py-3 rounded-lg bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-sm font-medium"
    >
      {message}
    </div>
  );
}

/** Main app content — switches between views based on route. */
function AppContent() {
  const { mezatags, loading, error } = useMezatags();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--md-sys-color-background)]">
      <Header />
      <main className="flex-1 p-4">
        {error ? (
          <ErrorBanner message={error} />
        ) : loading ? (
          <LoadingSkeleton />
        ) : (
          <Routes>
            <Route path="/" element={<SingleBattleView mezatags={mezatags} />} />
            <Route path="/trainer" element={<TrainerBattleView mezatags={mezatags} />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

/** Top-level app component — wraps everything in HashRouter for GitHub Pages compatibility. */
export function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
