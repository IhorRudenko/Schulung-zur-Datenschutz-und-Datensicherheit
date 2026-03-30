export default function ProgressBar({ progress }) {
  return (
    <div className="progress-wrap" aria-hidden="true">
      <div
        className="progress-bar"
        id="progressBar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
