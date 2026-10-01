import React, { useEffect, useState } from 'react';
import { VitalityBar } from '../components/VitalityBar';
import { Hero } from '../components/Hero';
import { BondCalculator } from '../components/BondCalculator';
import { AgentCarousel } from '../components/AgentCarousel';
import { HowItWorks } from '../components/HowItWorks';
import { RegisterAgentModal, type RegisteredAgentSnapshot } from '../components/RegisterAgentModal';
import type { AgentData } from '../data/mockAgents';

type HomeScrollTarget = 'how-it-works' | 'calculator' | null;

interface HomePageProps {
  allAgents?: AgentData[];
  homeScrollTarget?: HomeScrollTarget;
  onNavigate: (tab: string) => void;
  onHomeScrollHandled?: () => void;
  onSelectAgent?: (agent: AgentData) => void;
  onAgentRegistered?: (agent: RegisteredAgentSnapshot) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ allAgents, homeScrollTarget, onNavigate, onHomeScrollHandled, onSelectAgent, onAgentRegistered }) => {
  useEffect(() => {
    document.title = 'RBD Shield | Agent Coverage Protocol';
  }, []);

  useEffect(() => {
    if (!homeScrollTarget) return;

    const target = document.getElementById(homeScrollTarget);
    if (!target) return;

    requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top, behavior: 'smooth' });
      onHomeScrollHandled?.();
    });
  }, [homeScrollTarget, onHomeScrollHandled]);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleHowItWorksScroll = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      const offset = 92;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
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
        agents={allAgents}
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
        onRegistered={onAgentRegistered}
      />
    </main>
  );
};
