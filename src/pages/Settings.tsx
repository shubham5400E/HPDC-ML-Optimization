import React from 'react';
import { DEMO_MACHINE_PROFILES } from '../services/demoRecommendationService';

const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Machine Profiles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEMO_MACHINE_PROFILES.map(profile => (
          <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
            <p className="text-slate-500 text-sm mb-4">Class: {profile.clampingForceClass} • Max Pressure: {profile.maxInjectionPressure} MPa</p>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 text-sm border-b border-slate-100 pb-2">Configured Constraints</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Injection Spd:</span>
                  <span className="font-medium text-slate-900">{profile.constraints.injectionSpeed.min}-{profile.constraints.injectionSpeed.max} {profile.constraints.injectionSpeed.unit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Die Temp:</span>
                  <span className="font-medium text-slate-900">{profile.constraints.dieTemperature.min}-{profile.constraints.dieTemperature.max} {profile.constraints.dieTemperature.unit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Melt Temp:</span>
                  <span className="font-medium text-slate-900">{profile.constraints.meltTemperature.min}-{profile.constraints.meltTemperature.max} {profile.constraints.meltTemperature.unit}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fill Time:</span>
                  <span className="font-medium text-slate-900">{profile.constraints.fillingTime.min}-{profile.constraints.fillingTime.max} {profile.constraints.fillingTime.unit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
