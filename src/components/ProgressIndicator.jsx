import './ProgressIndicator.css';

export default function ProgressIndicator({ currentStep }) {
  const steps = ['Email', 'Questions', 'Review', 'Done'];

  return (
    <div className="progress-indicator">
      {steps.map((step, index) => (
        <div key={step} className="progress-step">
          <div className="progress-step-content">
            <div className={`progress-circle ${index + 1 <= currentStep ? 'active' : 'inactive'}`}>
              {index + 1}
            </div>
            <span className="progress-label">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`progress-line ${index + 1 < currentStep ? 'active' : 'inactive'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
