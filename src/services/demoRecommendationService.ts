import { ComponentData, DemoMachineProfile, RecommendationParameters } from '../types';

export const DEMO_MACHINE_PROFILES: DemoMachineProfile[] = [
  {
    id: 'm1',
    name: 'CastMaster 400T',
    clampingForceClass: '400T',
    maxInjectionPressure: 120,
    constraints: {
      injectionSpeed: { min: 0.5, max: 6.0, unit: 'm/s' },
      injectionPressure: { min: 20, max: 120, unit: 'MPa' },
      dieTemperature: { min: 150, max: 300, unit: '°C' },
      meltTemperature: { min: 620, max: 720, unit: '°C' },
      intensificationPressure: { min: 40, max: 100, unit: 'MPa' },
      firstStageVelocity: { min: 0.1, max: 1.0, unit: 'm/s' },
      secondStageVelocity: { min: 1.0, max: 6.0, unit: 'm/s' },
      velocityTransitionPoint: { min: 100, max: 500, unit: 'mm' },
      fillingTime: { min: 10, max: 100, unit: 'ms' },
      intensificationTiming: { min: 5, max: 50, unit: 'ms' },
    }
  },
  {
    id: 'm2',
    name: 'HeavyCast 800T',
    clampingForceClass: '800T',
    maxInjectionPressure: 150,
    constraints: {
      injectionSpeed: { min: 0.5, max: 8.0, unit: 'm/s' },
      injectionPressure: { min: 30, max: 150, unit: 'MPa' },
      dieTemperature: { min: 180, max: 320, unit: '°C' },
      meltTemperature: { min: 640, max: 740, unit: '°C' },
      intensificationPressure: { min: 50, max: 120, unit: 'MPa' },
      firstStageVelocity: { min: 0.1, max: 1.5, unit: 'm/s' },
      secondStageVelocity: { min: 1.5, max: 8.0, unit: 'm/s' },
      velocityTransitionPoint: { min: 200, max: 800, unit: 'mm' },
      fillingTime: { min: 20, max: 150, unit: 'ms' },
      intensificationTiming: { min: 10, max: 60, unit: 'ms' },
    }
  }
];

export function generateInitialRecommendation(component: ComponentData): RecommendationParameters {
  const profile = DEMO_MACHINE_PROFILES.find(p => p.id === component.machineProfileId) || DEMO_MACHINE_PROFILES[0];
  
  // Deterministic fake generation based on component mass and volume
  const factor = (component.mass > 0 ? component.mass : 1.5) / 2; // Arbitrary factor for demo consistency
  
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

  return {
    injectionSpeed: clamp(2.5 * factor, profile.constraints.injectionSpeed.min, profile.constraints.injectionSpeed.max),
    injectionPressure: clamp(60 * factor, profile.constraints.injectionPressure.min, profile.constraints.injectionPressure.max),
    dieTemperature: clamp(220 + (factor * 10), profile.constraints.dieTemperature.min, profile.constraints.dieTemperature.max),
    meltTemperature: clamp(680 + (factor * 5), profile.constraints.meltTemperature.min, profile.constraints.meltTemperature.max),
    intensificationPressure: clamp(70 * factor, profile.constraints.intensificationPressure.min, profile.constraints.intensificationPressure.max),
    firstStageVelocity: clamp(0.3 * factor, profile.constraints.firstStageVelocity.min, profile.constraints.firstStageVelocity.max),
    secondStageVelocity: clamp(3.0 * factor, profile.constraints.secondStageVelocity.min, profile.constraints.secondStageVelocity.max),
    velocityTransitionPoint: clamp(250 * factor, profile.constraints.velocityTransitionPoint.min, profile.constraints.velocityTransitionPoint.max),
    fillingTime: clamp(40 / factor, profile.constraints.fillingTime.min, profile.constraints.fillingTime.max),
    intensificationTiming: clamp(20 * factor, profile.constraints.intensificationTiming.min, profile.constraints.intensificationTiming.max),
  };
}
