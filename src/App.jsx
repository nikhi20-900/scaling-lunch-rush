import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import K8sArchitecture from './components/K8sArchitecture';
import AutoScalingSimulation from './components/AutoScalingSimulation';
import DevOpsPipeline from './components/DevOpsPipeline';
import MetricsDashboard from './components/MetricsDashboard';
import ConclusionSection from './components/ConclusionSection';
import Footer from './components/Footer';
import { useAutoScaling } from './hooks/useAutoScaling';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const scaling = useAutoScaling();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-surface-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="bg-mesh fixed inset-0 pointer-events-none z-0" />
      <div className="relative z-10">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main>
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <K8sArchitecture />
          <AutoScalingSimulation scaling={scaling} darkMode={darkMode} />
          <DevOpsPipeline />
          <MetricsDashboard scaling={scaling} darkMode={darkMode} />
          <ConclusionSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
