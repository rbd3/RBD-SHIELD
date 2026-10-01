import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AgentDirectoryPage } from './pages/AgentDirectoryPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { MyCoveragePage } from './pages/MyCoveragePage';
import { ClaimsPage } from './pages/ClaimsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { WalletProvider } from './context/WalletContext';
import type { AgentData } from './data/mockAgents';
import { MOCK_AGENTS } from './data/mockAgents';
import type { RegisteredAgentSnapshot } from './components/RegisterAgentModal';
import './App.css';

type DirectoryFocus = {
  section?: 'marketplace';
  agentId?: string;
};

type HomeScrollTarget = 'how-it-works' | 'calculator' | null;

function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [allAgents, setAllAgents] = useState<AgentData[]>(MOCK_AGENTS);
  const [recentAgentRegistration, setRecentAgentRegistration] = useState<RegisteredAgentSnapshot | null>(null);
  const [directoryFocus, setDirectoryFocus] = useState<DirectoryFocus | null>(null);
  const [homeScrollTarget, setHomeScrollTarget] = useState<HomeScrollTarget>(null);

  const navigateToDirectory = (agent?: AgentData) => {
    if (agent) {
      setSelectedAgent(agent);
    }

    setCurrentTab('directory');
    setDirectoryFocus(agent ? { agentId: agent.id } : { section: 'marketplace' });
  };

  return (
    <WalletProvider>
    <div className="app-root">
      {/* 1. Sticky Glassmorphic Header */}
      <Navbar currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)} />

      {/* 2. Main Page View */}
      {currentTab === 'home' && (
        <HomePage
          allAgents={allAgents}
          homeScrollTarget={homeScrollTarget}
          onNavigate={(tab) => setCurrentTab(tab)}
          onHomeScrollHandled={() => setHomeScrollTarget(null)}
          onSelectAgent={(agent) => {
            setSelectedAgent(agent);
            setCurrentTab('agent-detail');
          }}
          onAgentRegistered={setRecentAgentRegistration}
        />
      )}

      {currentTab === 'directory' && (
        <AgentDirectoryPage
          onSelectAgent={(agent) => {
            setSelectedAgent(agent);
            setCurrentTab('agent-detail');
          }}
          onAgentsChange={setAllAgents}
          recentAgentRegistration={recentAgentRegistration}
          onAgentRegistered={setRecentAgentRegistration}
          onNavigate={(tab) => setCurrentTab(tab)}
          directoryFocus={directoryFocus}
          onFocusHandled={() => setDirectoryFocus(null)}
        />
      )}

      {currentTab === 'agent-detail' && (
        <AgentDetailPage
          agent={selectedAgent}
          allAgents={allAgents}
          onBackToDirectory={() => setCurrentTab('directory')}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
          onNavigate={(tab) => setCurrentTab(tab)}
        />
      )}

      {currentTab === 'coverage' && (
        <MyCoveragePage onNavigate={(tab) => setCurrentTab(tab)} />
      )}

      {currentTab === 'claims' && <ClaimsPage onNavigate={(tab) => setCurrentTab(tab)} />}

      {currentTab === 'analytics' && <AnalyticsPage onNavigate={(tab) => setCurrentTab(tab)} />}

      {currentTab !== 'home' && currentTab !== 'directory' && currentTab !== 'agent-detail' && currentTab !== 'coverage' && currentTab !== 'claims' && currentTab !== 'analytics' && (
        <div className="container placeholder-page glass-panel">
          <div className="placeholder-badge font-mono">NEXT PHASE ROADMAP</div>
          <h2 className="placeholder-title">
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
      <Footer
        featuredAgent={allAgents[0]}
        onNavigate={(tab, agent, section) => {
          if (tab === 'directory') {
            navigateToDirectory(agent ?? allAgents[0]);
            return;
          }

          if (tab === 'home') {
            setCurrentTab('home');
            setHomeScrollTarget(section ?? null);
            return;
          }

          setCurrentTab(tab);
        }}
      />
    </div>
    </WalletProvider>
  );
}

export default App;
