import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { DEMO_MACHINE_PROFILES } from '../services/demoRecommendationService';
import { Settings2, AlertTriangle, ChevronRight, Save, Download, Play, Info } from 'lucide-react';

const Recommendations: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const session = useAppStore(state => state.sessions.find(s => s.id === sessionId));
  
  if (!session) {
    return <div className="p-8 text-center text-slate-500">Session not found.</div>;
  }

  const latestIteration = session.iterations[session.iterations.length - 1];
  const params = latestIteration.parameters;
  const profile = DEMO_MACHINE_PROFILES.find(p => p.id === session.component.machineProfileId) || DEMO_MACHINE_PROFILES[0];
  const isRevised = session.iterations.length > 1;

  const paramDefinitions = [
    { key: 'injectionSpeed', label: 'Injection Speed', unit: 'm/s', group: 'Velocity Phase' },
    { key: 'firstStageVelocity', label: '1st Stage Velocity', unit: 'm/s', group: 'Velocity Phase' },
    { key: 'secondStageVelocity', label: '2nd Stage Velocity', unit: 'm/s', group: 'Velocity Phase' },
    { key: 'velocityTransitionPoint', label: 'Velocity Transition', unit: 'mm', group: 'Velocity Phase' },
    { key: 'injectionPressure', label: 'Injection Pressure', unit: 'MPa', group: 'Pressure Phase' },
    { key: 'intensificationPressure', label: 'Intensification Pressure', unit: 'MPa', group: 'Pressure Phase' },
    { key: 'intensificationTiming', label: 'Intensification Timing', unit: 'ms', group: 'Pressure Phase' },
    { key: 'dieTemperature', label: 'Die Temperature', unit: '°C', group: 'Thermal Phase' },
    { key: 'meltTemperature', label: 'Melt Temperature', unit: '°C', group: 'Thermal Phase' },
    { key: 'fillingTime', label: 'Filling Time', unit: 'ms', group: 'Timing' },
  ] as const;

  const groups = Array.from(new Set(paramDefinitions.map(p => p.group)));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <span className="cursor-pointer hover:text-slate-900" onClick={() => navigate('/cad-upload')}>Analysis</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium">{isRevised ? 'Revised Recommendations' : 'Initial Recommendations'}</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRevised ? `Iteration ${latestIteration.iterationNumber} Parameters` : 'Initial Parameter Recommendation'}
          </h1>
          <p className="text-slate-600 mt-1">
            Generated for {session.component.name} • {session.component.alloy} • {profile.name}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium">
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => navigate(`/feedback/${session.id}`)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            <Play size={18} /> Record Trial Results
          </button>
        </div>
      </div>



      {isRevised && latestIteration.diagnosticExplanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
            <Info size={18} /> Diagnostic Rationale
          </h3>
          <p className="text-blue-800 text-sm mb-4">{latestIteration.diagnosticExplanation}</p>
          
          <div className="bg-white rounded border border-blue-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-medium">Changed Parameter</th>
                  <th className="px-4 py-2 font-medium">Previous</th>
                  <th className="px-4 py-2 font-medium text-teal-600">Revised</th>
                  <th className="px-4 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestIteration.changesFromPrevious.map(change => {
                  const def = paramDefinitions.find(d => d.key === change.parameter);
                  return (
                    <tr key={change.parameter} className="hover:bg-slate-50 text-slate-700">
                      <td className="px-4 py-3 font-medium text-slate-900">{def?.label}</td>
                      <td className="px-4 py-3 text-slate-500 line-through decoration-slate-300">{change.initialValue} {def?.unit}</td>
                      <td className="px-4 py-3 font-semibold text-teal-700">{change.revisedValue} {def?.unit}</td>
                      <td className="px-4 py-3 text-slate-600">{change.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">{group}</h2>
            </div>
            <div className="p-0">
              {paramDefinitions.filter(p => p.group === group).map(def => {
                const val = params[def.key as keyof typeof params];
                const constraint = profile.constraints[def.key as keyof typeof profile.constraints];
                const isChanged = latestIteration.changesFromPrevious.some(c => c.parameter === def.key);
                
                return (
                  <div key={def.key} className={`px-5 py-4 flex items-center justify-between border-b border-slate-100 last:border-0 ${isChanged ? 'bg-teal-50/30' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{def.label}</span>
                        {isChanged && <span className="bg-teal-100 text-teal-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Updated</span>}
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">Range: {constraint.min} - {constraint.max} {constraint.unit}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-bold ${isChanged ? 'text-teal-700' : 'text-slate-700'}`}>
                        {typeof val === 'number' ? val.toFixed(1) : val}
                      </span>
                      <span className="text-sm text-slate-500">{def.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
