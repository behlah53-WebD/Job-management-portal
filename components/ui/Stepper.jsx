import React from 'react';
import { Check } from 'lucide-react';
import styles from './Stepper.module.css';

export default function Stepper({
  steps = [],
  currentStep = 1,
  className = '',
}) {
  return (
    <div className={`${styles.stepperContainer} ${className}`}>
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = currentStep > stepNum;
        const isCurrent = currentStep === stepNum;

        return (
          <React.Fragment key={step.title || stepNum}>
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${
                  isCompleted ? styles.completed : isCurrent ? styles.current : styles.upcoming
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} /> : stepNum}
              </div>
              <div className={styles.labelCol}>
                <span className={styles.stepTitle}>{step.title}</span>
                {step.subtitle && <span className={styles.stepSubtitle}>{step.subtitle}</span>}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`${styles.connectorLine} ${
                  currentStep > stepNum ? styles.connectorActive : ''
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
