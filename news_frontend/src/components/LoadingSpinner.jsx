export default function LoadingSpinner({ label }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      {label && <span>{label}</span>}
    </div>
  );
}


