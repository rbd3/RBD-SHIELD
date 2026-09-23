import React, { useState } from 'react';
import { VitalityBar } from '../components/VitalityBar';
import { Hero } from '../components/Hero';
import { BondCalculator } from '../components/BondCalculator';
import { AgentCarousel } from '../components/AgentCarousel';
import { HowItWorks } from '../components/HowItWorks';
import { RegisterAgentModal } from '../components/RegisterAgentModal';
import type { AgentData } from '../data/mockAgents';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onSelectAgent?: (agent: AgentData) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectAgent }) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleHowItWorksScroll = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCalculatedTerm = (coverage: number, premium: number, days: number) => {
    // When user wants to protect from calculator, navigate to directory or coverage
    console.log('Calculated coverage selected:', { coverage, premium, days });
    onNavigate('directory');
  };

  return (
    <main className="home-page-root">
      {/* 1. Protocol Heartbeat Vitality Bar */}
      <VitalityBar />

      {/* 2. Hero Section */}
      <Hero
        onExploreAgents={() => onNavigate('directory')}
        onHowItWorks={handleHowItWorksScroll}
        onOpenRegisterModal={() => setRegisterModalOpen(true)}
      />

      {/* 3. Interactive Bond & Coverage Primitive Calculator */}
      <BondCalculator onSelectCalculatedTerm={handleSelectCalculatedTerm} />

      {/* 4. Featured Agents Carousel */}
      <AgentCarousel
        onSelectAgent={(agent) => {
          if (onSelectAgent) onSelectAgent(agent);
          onNavigate('directory');
        }}
        onViewAllAgents={() => onNavigate('directory')}
      />

      {/* 5. How It Works & Guided Walkthrough */}
      <HowItWorks />

      {/* Supply-Side Agent Registration Modal */}
      <RegisterAgentModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </main>
  );
};
