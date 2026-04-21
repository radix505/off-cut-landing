import { useRouter } from '../context/RouterContext';

export default function ScissorsTransition() {
  const { cutting } = useRouter();
  if (!cutting) return null;

  return (
    <div className="scissors-overlay">
      <div className="cut-line" />
      <div className="scissors-mover">
        <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g className="scissors-blade-top">
            <circle cx="12" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <line x1="19" y1="12" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
          </g>
          <g className="scissors-blade-bottom">
            <circle cx="12" cy="30" r="8" stroke="currentColor" strokeWidth="1.5" />
            <line x1="19" y1="28" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
          </g>
          <circle cx="46" cy="20" r="2.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
