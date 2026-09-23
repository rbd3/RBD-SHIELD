import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AgentDirectoryPage } from './pages/AgentDirectoryPage';
import type { AgentData } from './data/mockAgents';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [, setSelectedAgent] = useState<AgentData | null>(null);

  return (
    <div className="app-root">
      {/* 1. Sticky Glassmorphic Header */}
      <Navbar currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)} />

      {/* 2. Main Page View */}
      {currentTab === 'home' && (
        <HomePage
          onNavigate={(tab) => setCurrentTab(tab)}
          onSelectAgent={(agent) => {
            setSelectedAgent(agent);
            setCurrentTab('directory');
          }}
        />
      )}

      {currentTab === 'directory' && (
        <AgentDirectoryPage
          onSelectAgent={(agent) => setSelectedAgent(agent)}
          onNavigate={(tab) => setCurrentTab(tab)}
        />
      )}

      {currentTab !== 'home' && currentTab !== 'directory' && (
        <div className="container placeholder-page glass-panel">
          <div className="placeholder-badge font-mono">NEXT PHASE ROADMAP</div>
          <h2 className="placeholder-title">
            {currentTab === 'coverage' && 'Page 5: My Coverage'}
            {currentTab === 'claims' && 'Page 6: Parametric Claims Rail'}
            {currentTab === 'analytics' && 'Page 7: Protocol Invariant Analytics'}
          </h2>
          <p className="placeholder-sub">
            This module is being built in the next step per <code>FRONTEND_IMPLEMENTATION_PLAN.md</code>.
          </p>
          <button className="btn-primary-cyan" onClick={() => setCurrentTab('home')}>
            ← Return to Home Page
          </button>
        </div>
      )}

      {/* 3. Protocol Footer */}
      <Footer />
    </div>
  );
}

export default App;
