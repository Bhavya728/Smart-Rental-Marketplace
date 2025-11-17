import React from 'react';

const Stepper = ({ 
  steps, 
  currentStep, 
  className = "",
  orientation = "horizontal" // horizontal or vertical
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={`stepper ${isHorizontal ? 'stepper-horizontal' : 'stepper-vertical'} ${className}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id || index} className="stepper-item">
            <div className="stepper-content">
              {/* Step Circle */}
              <div className={`stepper-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                {isCompleted ? (
                  <svg className="stepper-check" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="stepper-number">{stepNumber}</span>
                )}
              </div>

              {/* Step Details */}
              <div className="stepper-details">
                <div className={`stepper-title ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  {step.title}
                </div>
                {step.description && (
                  <div className={`stepper-description ${isActive ? 'active' : ''}`}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className={`stepper-connector ${isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}

      <style jsx>{`
        .stepper {
          display: flex;
          width: 100%;
        }

        .stepper-horizontal {
          flex-direction: row;
          align-items: flex-start;
        }

        .stepper-vertical {
          flex-direction: column;
          align-items: stretch;
        }

        .stepper-item {
          position: relative;
          flex: 1;
          display: flex;
        }

        .stepper-horizontal .stepper-item {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stepper-vertical .stepper-item {
          flex-direction: row;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .stepper-vertical .stepper-item:last-child {
          margin-bottom: 0;
        }

        .stepper-content {
          display: flex;
          align-items: center;
          z-index: 1;
        }

        .stepper-horizontal .stepper-content {
          flex-direction: column;
          align-items: center;
        }

        .stepper-vertical .stepper-content {
          flex-direction: row;
          align-items: flex-start;
        }

        .stepper-circle {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e5e7eb;
          background-color: white;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .stepper-circle.active {
          border-color: #3b82f6;
          background-color: #3b82f6;
          color: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .stepper-circle.completed {
          border-color: #10b981;
          background-color: #10b981;
          color: white;
        }

        .stepper-check {
          width: 1.25rem;
          height: 1.25rem;
        }

        .stepper-number {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stepper-details {
          margin-top: 0.75rem;
          max-width: 150px;
        }

        .stepper-vertical .stepper-details {
          margin-top: 0;
          margin-left: 1rem;
          max-width: none;
          flex: 1;
        }

        .stepper-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          transition: color 0.3s ease;
          line-height: 1.4;
        }

        .stepper-title.active {
          color: #3b82f6;
          font-weight: 600;
        }

        .stepper-title.completed {
          color: #10b981;
        }

        .stepper-description {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
          transition: color 0.3s ease;
          line-height: 1.3;
        }

        .stepper-description.active {
          color: #6b7280;
        }

        .stepper-connector {
          position: absolute;
          background-color: #e5e7eb;
          transition: background-color 0.3s ease;
        }

        .stepper-horizontal .stepper-connector {
          top: 1.25rem;
          left: calc(50% + 1.25rem);
          right: calc(-50% + 1.25rem);
          height: 2px;
        }

        .stepper-vertical .stepper-connector {
          left: 1.25rem;
          top: 2.5rem;
          bottom: -2rem;
          width: 2px;
        }

        .stepper-connector.completed {
          background-color: #10b981;
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .stepper-horizontal {
            flex-direction: column;
            align-items: stretch;
          }

          .stepper-horizontal .stepper-item {
            flex-direction: row;
            align-items: flex-start;
            text-align: left;
            margin-bottom: 1.5rem;
          }

          .stepper-horizontal .stepper-item:last-child {
            margin-bottom: 0;
          }

          .stepper-horizontal .stepper-content {
            flex-direction: row;
            align-items: flex-start;
          }

          .stepper-horizontal .stepper-details {
            margin-top: 0;
            margin-left: 1rem;
            max-width: none;
          }

          .stepper-horizontal .stepper-connector {
            top: 2.5rem;
            left: 1.25rem;
            right: auto;
            bottom: -1.5rem;
            width: 2px;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Stepper;