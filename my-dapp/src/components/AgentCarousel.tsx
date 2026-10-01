import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import { MOCK_AGENTS } from '../data/mockAgents';
import type { AgentData } from '../data/mockAgents';
import './AgentCarousel.css';

interface AgentCarouselProps {
  agents?: AgentData[];
  onSelectAgent: (agent: AgentData) => void;
  onViewAllAgents: () => void;
}

export const AgentCarousel: React.FC<AgentCarouselProps> = ({ agents = MOCK_AGENTS, onSelectAgent, onViewAllAgents }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<number | null>(null);
  const sectionRef = useReveal();
  const visibleAgents = agents.length > 0 ? agents : MOCK_AGENTS;

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(visibleAgents.length - 1, 0)));
  }, [visibleAgents.length]);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current;
    if (!track) return;

    const nextIndex = Math.min(Math.max(index, 0), Math.max(visibleAgents.length - 1, 0));
    const card = track.children[nextIndex] as HTMLElement | undefined;
    if (!card) return;

    track.scrollTo({
      left: card.offsetLeft,
      behavior,
    });

    setActiveIndex(nextIndex);
  }, [visibleAgents.length]);

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }

    if (visibleAgents.length < 2) return;

    autoplayRef.current = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev >= visibleAgents.length - 1 ? 0 : prev + 1;
        requestAnimationFrame(() => scrollToIndex(next, 'smooth'));
        return next;
      });
    }, 2500);
  }, [scrollToIndex, visibleAgents.length]);

  const prevSlide = () => {
    const next = activeIndex === 0 ? visibleAgents.length - 1 : activeIndex - 1;
    resetAutoplay();
    scrollToIndex(next, 'smooth');
  };

  const nextSlide = () => {
    const next = activeIndex === visibleAgents.length - 1 ? 0 : activeIndex + 1;
    resetAutoplay();
    scrollToIndex(next, 'smooth');
  };

  useEffect(() => {
    resetAutoplay();

    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [resetAutoplay]);

  return (
    <section className="featured-agents-section" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div className="container">
        <div className="carousel-top-bar reveal">
          <div>
            <div className="carousel-badge">
              <span>ACTIVE UNDERWRITTEN AGENTS</span>
            </div>
            <h2 className="carousel-title">Meet the Agents Backing Their Decisions</h2>
            <p className="carousel-subtitle">
              Compare real-time Stylus risk signals, bonded vault reserves, and transparent SLA terms before choosing coverage.
            </p>
          </div>

          <div className="carousel-controls">
            <button
              aria-label="Previous Agent"
              className="carousel-arrow-btn"
              onClick={prevSlide}
              disabled={activeIndex === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              aria-label="Next Agent"
              className="carousel-arrow-btn"
              onClick={nextSlide}
              disabled={activeIndex === MOCK_AGENTS.length - 1}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable carousel track */}
        <div className="carousel-outer">
          <div className="agents-track" ref={trackRef}>
            {visibleAgents.map((agent, index) => (
              <div
                key={agent.id}
                className={`agent-card glass-panel ${index === activeIndex ? 'featured' : ''}`}
                onClick={() => onSelectAgent(agent)}
                role="button"
                tabIndex={0}
                aria-label={`Select agent ${agent.name}`}
                onKeyDown={(e) => e.key === 'Enter' && onSelectAgent(agent)}
              >
                <div className="agent-card-header">
                  <div className="agent-avatar-wrap">
                    <span className="agent-avatar">{agent.avatar}</span>
                    <span className="agent-status-dot"></span>
                  </div>

                  <div className="agent-score-badge">
                    <span className="score-val">{agent.riskScore}</span>
                    <span className="score-label">/1000 RISK</span>
                  </div>
                </div>

                <div className="agent-info">
                  <h3 className="agent-name">{agent.name}</h3>
                  <div className="agent-role">{agent.role}</div>
                  <p className="agent-desc">{agent.serviceDescription}</p>
                </div>

                {/* Metrics Matrix */}
                <div className="agent-metrics-matrix">
                  <div className="metric-cell">
                    <div className="cell-label">Vault Collateral</div>
                    <div className="cell-value font-mono">${agent.collateralUsdc.toLocaleString()}</div>
                  </div>
                  <div className="metric-cell">
                    <div className="cell-label">Available Capacity</div>
                    <div className="cell-value font-mono text-cyan">${agent.availableCapacityUsdc.toLocaleString()}</div>
                  </div>
                  <div className="metric-cell">
                    <div className="cell-label">SLA Uptime</div>
                    <div className="cell-value font-mono text-emerald">{agent.uptimePercent}%</div>
                  </div>
                  <div className="metric-cell">
                    <div className="cell-label">Active Policies</div>
                    <div className="cell-value font-mono">{agent.activePoliciesCount}</div>
                  </div>
                </div>

                {/* Sample SLA Term */}
                <div className="agent-sample-sla">
                  <div className="sla-pill-header">
                    <span className="sla-label">Featured SLA Term</span>
                    <span className="sla-cost">From ${agent.slaTerms[0]?.premiumUsdc} USDC</span>
                  </div>
                  <div className="sla-term-desc">
                    {agent.slaTerms[0]?.failureTrigger}
                  </div>
                </div>

                <button className="btn-view-agent" tabIndex={-1} aria-hidden="true">
                  <span>Inspect Agent &amp; SLA Coverage Terms</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Edge fade overlays */}
          <div className="carousel-fade-left" aria-hidden="true"></div>
          <div className="carousel-fade-right" aria-hidden="true"></div>
        </div>

        {/* Dot indicators */}
        <div className="carousel-dots" role="tablist" aria-label="Agent cards">
          {visibleAgents.map((agent, index) => (
            <button
              key={agent.id}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to ${agent.name}`}
              className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>

        <div className="carousel-footer-action">
          <button className="btn-all-agents" onClick={onViewAllAgents}>
            <span>View All Registered Agents in Directory ({visibleAgents.length} Active) →</span>
          </button>
        </div>
      </div>
    </section>
  );
};
