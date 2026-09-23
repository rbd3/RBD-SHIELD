import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import { MOCK_AGENTS } from '../data/mockAgents';
import type { AgentData } from '../data/mockAgents';
import './AgentCarousel.css';

interface AgentCarouselProps {
  onSelectAgent: (agent: AgentData) => void;
  onViewAllAgents: () => void;
}

export const AgentCarousel: React.FC<AgentCarouselProps> = ({ onSelectAgent, onViewAllAgents }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useReveal();

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement;
    if (!card) return;
    const trackLeft = track.getBoundingClientRect().left;
    const cardLeft = card.getBoundingClientRect().left;
    track.scrollBy({ left: cardLeft - trackLeft, behavior: 'smooth' });
    setActiveIndex(index);
  }, []);

  const prevSlide = () => {
    const next = activeIndex === 0 ? MOCK_AGENTS.length - 1 : activeIndex - 1;
    scrollToIndex(next);
  };

  const nextSlide = () => {
    const next = activeIndex === MOCK_AGENTS.length - 1 ? 0 : activeIndex + 1;
    scrollToIndex(next);
  };

  // Sync active dot with scroll position (for touch/trackpad scrolling)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handleScroll = () => {
      const cardWidth = (track.children[0] as HTMLElement)?.offsetWidth ?? 0;
      const gap = 24;
      const idx = Math.round(track.scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(idx, MOCK_AGENTS.length - 1));
    };
    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, []);

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
            {MOCK_AGENTS.map((agent, index) => (
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
          {MOCK_AGENTS.map((agent, index) => (
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
            <span>View All Registered Agents in Directory ({MOCK_AGENTS.length} Active) →</span>
          </button>
        </div>
      </div>
    </section>
  );
};
