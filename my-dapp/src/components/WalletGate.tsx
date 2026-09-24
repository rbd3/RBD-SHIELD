import { useWallet } from '../context/WalletContext';
import './WalletGate.css';

export const WalletGate = ({ title, description }: { title: string; description: string }) => {
  const { connectWallet, demoMode, setDemoMode, walletBusy } = useWallet();
  return <main className="wallet-gate-page"><div className="container"><section className="wallet-gate glass-panel"><div className="wallet-gate-icon">◈</div><div className="wallet-gate-copy"><span>WALLET-SPECIFIC AREA</span><h1>{title}</h1><p>{description}</p><div className="wallet-gate-actions"><button className="wallet-gate-connect" onClick={connectWallet} disabled={walletBusy}>{walletBusy ? 'Connecting wallet...' : 'Connect wallet'}</button><button className="wallet-gate-demo" onClick={() => setDemoMode(!demoMode)}>{demoMode ? 'Exit demo mode' : 'View demo data'}</button></div><small>Demo Mode uses seeded data only and never represents your wallet activity.</small></div></section></div></main>;
};
