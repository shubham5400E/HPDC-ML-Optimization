import { DefectType, RecommendationParameters } from '../types';

export interface DiagnosticResult {
  explanation: string;
  relevantParameters: Array<keyof RecommendationParameters>;
}

export function analyzeTrialFeedback(defects: DefectType[]): DiagnosticResult {
  if (defects.length === 0 || defects.includes('Good casting / No major defect')) {
    return {
      explanation: 'No major defects reported. Process parameters appear stable.',
      relevantParameters: [],
    };
  }

  // Simplified rule-based diagnosis for the demo
  const relevantParameters = new Set<keyof RecommendationParameters>();
  const explanations: string[] = [];

  if (defects.includes('Porosity')) {
    explanations.push('Porosity: Possible contributors include gas entrapment, inadequate feeding or intensification, filling behaviour, and die thermal conditions.');
    relevantParameters.add('intensificationPressure');
    relevantParameters.add('intensificationTiming');
    relevantParameters.add('dieTemperature');
    relevantParameters.add('secondStageVelocity');
  }

  if (defects.includes('Incomplete filling')) {
    explanations.push('Incomplete filling: Possible contributors include filling time, melt temperature, die temperature, flow restrictions, and injection velocity.');
    relevantParameters.add('fillingTime');
    relevantParameters.add('meltTemperature');
    relevantParameters.add('dieTemperature');
    relevantParameters.add('secondStageVelocity');
  }

  if (defects.includes('Cold shut')) {
    explanations.push('Cold shut: Possible contributors include premature solidification, flow-front interaction, melt temperature, die temperature, and filling behaviour.');
    relevantParameters.add('meltTemperature');
    relevantParameters.add('dieTemperature');
    relevantParameters.add('injectionSpeed');
    relevantParameters.add('firstStageVelocity');
  }

  if (defects.includes('Flash')) {
    explanations.push('Flash: Possible contributors include excessive cavity pressure, die locking force, die condition, and parting-line issues.');
    relevantParameters.add('injectionPressure');
    relevantParameters.add('intensificationPressure');
  }

  if (defects.includes('Surface defects')) {
    explanations.push('Surface defects: Often related to die temperature, melt temperature, or lubrication.');
    relevantParameters.add('dieTemperature');
    relevantParameters.add('meltTemperature');
  }
  
  if (defects.includes('Other defect')) {
    explanations.push('Other defect: General parameters flagged for review.');
    relevantParameters.add('injectionSpeed');
    relevantParameters.add('dieTemperature');
  }

  return {
    explanation: explanations.join(' '),
    relevantParameters: Array.from(relevantParameters),
  };
}
