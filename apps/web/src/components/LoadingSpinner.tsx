import ClipLoader from 'react-spinners/ClipLoader';

type LoadingSpinnerProps = {
  label?: string;
  size?: number;
  color?: string;
};

const LoadingSpinner = ({
  label = 'Loading...',
  size = 36,
  color = 'var(--ws-brand, #19814d)',
}: LoadingSpinnerProps) => (
  <div className="page-loader" role="status" aria-live="polite">
    <ClipLoader size={size} color={color} />
    <span>{label}</span>
  </div>
);

export default LoadingSpinner;
