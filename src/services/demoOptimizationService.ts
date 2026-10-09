import { RecommendationParameters, ParameterChange, TrialFeedback, DemoMachineProfile } from '../types';
import { analyzeTrialFeedback } from './demoDiagnosticService';

export function optimizeParameters(
  previousParams: RecommendationParameters,
  feedback: TrialFeedback,
  machineProfile: DemoMachineProfile
): { revisedParams: RecommendationParameters; changes: ParameterChange[]; explanation: string } {
  
  const diagnostic = analyzeTrialFeedback(feedback.defects);
  const revisedParams = { ...previousParams };
  const changes: ParameterChange[] = [];

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

  // A very simple rule-based adjustment for the demo
  diagnostic.relevantParameters.forEach(paramKey => {
    let newValue = previousParams[paramKey];
    let reason = '';
    const constraint = machineProfile.constraints[paramKey];

    if (feedback.defects.includes('Porosity') && (paramKey === 'intensificationPressure' || paramKey === 'intensificationTiming')) {
      newValue = previousParams[paramKey] * 1.1; // Increase by 10%
      reason = 'Increased to reduce gas entrapment and improve feeding.';
    } else if (feedback.defects.includes('Incomplete filling') && (paramKey === 'fillingTime' || paramKey === 'meltTemperature' || paramKey === 'secondStageVelocity')) {
      if (paramKey === 'fillingTime') {
        newValue = previousParams[paramKey] * 0.9; // Decrease filling time
        reason = 'Decreased to prevent premature solidification.';
      } else {
        newValue = previousParams[paramKey] * 1.05; // Increase temps and velocity
        reason = 'Increased to improve metal flow to thin sections.';
      }
    } else if (feedback.defects.includes('Cold shut') && (paramKey === 'meltTemperature' || paramKey === 'dieTemperature')) {
      newValue = previousParams[paramKey] * 1.05;
      reason = 'Increased to prevent premature metal freezing.';
    } else if (feedback.defects.includes('Flash') && (paramKey === 'injectionPressure' || paramKey === 'intensificationPressure')) {
      newValue = previousParams[paramKey] * 0.9;
      reason = 'Decreased to prevent exceeding die locking force.';
    } else {
      // Generic adjustment
      newValue = previousParams[paramKey] * 1.02;
      reason = 'Slightly adjusted based on defect profile.';
    }

    newValue = clamp(newValue, constraint.min, constraint.max);
    
    // Round to 2 decimal places for neatness
    newValue = Math.round(newValue * 100) / 100;

    if (newValue !== previousParams[paramKey]) {
      revisedParams[paramKey] = newValue;
      changes.push({
        parameter: paramKey,
        initialValue: previousParams[paramKey],
        revisedValue: newValue,
        reason: reason
      });
    }
  });

  return {
    revisedParams,
    changes,
    explanation: diagnostic.explanation
  };
}
