import React, { useState } from 'react';
import { MOCK_AGENTS } from '../data/mockAgents';
import type { AgentData } from '../data/mockAgents';
import './AgentCarousel.css';

interface AgentCarouselProps {
  onSelectAgent: (agent: AgentData) => void;
  onViewAllAgents: () => void;
}

export const AgentCarousel: React.FC<AgentCarouselProps> = ({ onSelectAgent, onViewAllAgents }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? MOCK_AGENTS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === MOCK_AGENTS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="featured-agents-section">
      <div className="container">
        <div className="carousel-top-bar">
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
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button 
              aria-label="Next Agent" 
              className="carousel-arrow-btn" 
              onClick={nextSlide}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="agents-grid">
          {MOCK_AGENTS.map((agent, index) => {
            const isFeatured = index === activeIndex;
            return (
              <div 
                key={agent.id} 
                className={`agent-card glass-panel ${isFeatured ? 'featured' : ''}`}
                onClick={() => onSelectAgent(agent)}
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

                <button className="btn-view-agent">
                  <span>Inspect Agent & SLA Coverage Terms</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            );
          })}
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
