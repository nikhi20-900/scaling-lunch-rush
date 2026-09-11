import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveClusterOps from './components/LiveClusterOps';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import K8sArchitecture from './components/K8sArchitecture';
import AutoScalingSimulation from './components/AutoScalingSimulation';
import BeforeAfterComparison from './components/BeforeAfterComparison';
import DevOpsPipeline from './components/DevOpsPipeline';
import MetricsDashboard from './components/MetricsDashboard';
import ConclusionSection from './components/ConclusionSection';
import Footer from './components/Footer';
import { useAutoScaling } from './hooks/useAutoScaling';
import { useLiveInfrastructure } from './hooks/useLiveInfrastructure';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('live'); // 'live' | 'casestudy'
  const scaling = useAutoScaling();
  const liveInfra = useLiveInfrastructure();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Scroll to top when switching views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-surface-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="bg-mesh fixed inset-0 pointer-events-none z-0" />
      <div className="relative z-10">
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          liveInfra={liveInfra}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <main>
          {activeView === 'live' ? (
            <LiveClusterOps
              liveInfra={liveInfra}
              onSwitchToCaseStudy={() => setActiveView('casestudy')}
            />
          ) : (
            <>
              {/* Back to Live Cluster Ops button */}
              <div className="pt-20 pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <button
                    onClick={() => setActiveView('live')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider hover:bg-primary-600/20 transition-all"
                    id="back-to-live-btn"
                    aria-label="Switch back to live cluster ops view"
                  >
                    ← Back to Live Cluster Ops
                  </button>
                </div>
              </div>
              <HeroSection scaling={scaling} />
              <ProblemSection />
              <SolutionSection />
              <K8sArchitecture scaling={scaling} />
              <AutoScalingSimulation scaling={scaling} darkMode={darkMode} liveInfra={liveInfra} />
              <BeforeAfterComparison scaling={scaling} />
              <DevOpsPipeline />
              <MetricsDashboard scaling={scaling} darkMode={darkMode} liveInfra={liveInfra} />
              <ConclusionSection />
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
