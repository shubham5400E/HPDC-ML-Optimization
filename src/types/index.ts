export type AlloyType = 'LM16' | 'AC2A' | 'Other';
export type DefectSeverity = 'Low' | 'Medium' | 'High';
export type DefectLocation = 'Thin wall' | 'Thick section' | 'Gate area' | 'End of fill' | 'Unknown' | 'Other';
export type DefectType = 'Good casting / No major defect' | 'Porosity' | 'Incomplete filling' | 'Cold shut' | 'Flash' | 'Surface defects' | 'Other defect';

export interface ComponentData {
  id: string;
  name: string;
  alloy: AlloyType;
  machineProfileId: string;
  dieType: string;
  cavities: number;
  mass: number;
  coolingConfig: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  volume: number;
  projectedArea: number;
  wallThickness: number;
  uploadDate: string;
}

export interface RecommendationParameters {
  injectionSpeed: number; // m/s
  injectionPressure: number; // MPa
  dieTemperature: number; // °C
  meltTemperature: number; // °C
  intensificationPressure: number; // MPa
  firstStageVelocity: number; // m/s
  secondStageVelocity: number; // m/s
  velocityTransitionPoint: number; // mm
  fillingTime: number; // ms
  intensificationTiming: number; // ms
}

export interface ParameterConstraint {
  min: number;
  max: number;
  unit: string;
}

export interface DemoMachineProfile {
  id: string;
  name: string;
  clampingForceClass: string;
  maxInjectionPressure: number;
  constraints: Record<keyof RecommendationParameters, ParameterConstraint>;
}

export interface TrialFeedback {
  id: string;
  defects: DefectType[];
  severity: DefectSeverity;
  location: DefectLocation;
  inspectedCount: number;
  rejectedCount: number;
  comments: string;
  date: string;
}

export interface ParameterChange {
  parameter: keyof RecommendationParameters;
  initialValue: number;
  revisedValue: number;
  reason: string;
}

export interface OptimizationIteration {
  id: string;
  iterationNumber: number;
  componentId: string;
  previousRecommendationId?: string;
  parameters: RecommendationParameters;
  feedback?: TrialFeedback;
  changesFromPrevious: ParameterChange[];
  diagnosticExplanation?: string;
  status: 'Pending Trial' | 'Trial Recorded' | 'Optimized';
  date: string;
}

export interface AnalysisSession {
  id: string;
  component: ComponentData;
  iterations: OptimizationIteration[];
  status: 'In Progress' | 'Completed';
  lastUpdated: string;
}
