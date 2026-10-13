import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { DEMO_MACHINE_PROFILES } from '../services/demoRecommendationService';
import { Settings2, AlertTriangle, ChevronRight, Save, Download, Play, Info, CheckCircle2, Box } from 'lucide-react';
import { CadViewer3D } from '../components/CadViewer3D';

const Recommendations: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const session = useAppStore(state => state.sessions.find(s => s.id === sessionId));
  
  if (!session) {
    return <div className="p-8 text-center text-slate-500">Session not found.</div>;
  }

  const latestIteration = session.iterations[session.iterations.length - 1];
  const profile = DEMO_MACHINE_PROFILES.find(p => p.id === session.component.machineProfileId) || DEMO_MACHINE_PROFILES[0];
  const hasPredictions = latestIteration.parameters && Object.keys(latestIteration.parameters).length > 0;
  
  const isRevised = session.iterations.length > 1;
  const params = latestIteration.parameters || {};
  
  const paramDefinitions = [
    { key: 'injectionSpeed', label: 'Injection Speed', unit: 'm/s', group: 'Velocity Phase' },
    { key: 'firstStageVelocity', label: '1st Stage Velocity', unit: 'm/s', group: 'Velocity Phase' },
    { key: 'secondStageVelocity', label: '2nd Stage Velocity', unit: 'm/s', group: 'Velocity Phase' },
    { key: 'velocityTransitionPoint', label: 'Velocity Transition', unit: 'mm', group: 'Velocity Phase' },
    { key: 'fillingTime', label: 'Filling Time', unit: 'ms', group: 'Velocity Phase' },
    
    { key: 'injectionPressure', label: 'Injection Pressure', unit: 'MPa', group: 'Pressure Phase' },
    { key: 'intensificationPressure', label: 'Intensification Pressure', unit: 'MPa', group: 'Pressure Phase' },
    { key: 'intensificationTiming', label: 'Intensification Timing', unit: 'ms', group: 'Pressure Phase' },
    
    { key: 'dieTemperature', label: 'Die Temperature', unit: '°C', group: 'Thermal Phase' },
    { key: 'meltTemperature', label: 'Melt Temperature', unit: '°C', group: 'Thermal Phase' },
  ];

  const groups = Array.from(new Set(paramDefinitions.map(p => p.group)));

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session.component.extractedFeatures, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", session.component.name + "_features.json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCsv = () => {
    const features = session.component.extractedFeatures;
    const header = Object.keys(features).join(",");
    const row = Object.values(features).join(",");
    const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + row;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", session.component.name + "_features.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <span className="cursor-pointer hover:text-slate-900" onClick={() => navigate('/cad-upload')}>Analysis</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium">CAD Extraction & Recommendations</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Analysis Results</h1>
            {params.modelSource && (
              <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {params.modelSource}
              </span>
            )}
          </div>
          <p className="text-slate-600 mt-1">
            Component: <span className="font-semibold text-slate-800">{session.component.name}</span>
            {session.component.extractedFeatures?.component_type && (
              <span className="ml-2 text-slate-500">• {session.component.extractedFeatures.component_type}</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium">
            <Settings2 size={18} /> Edit Parameters
          </button>
          <button className="flex items-center gap-2 text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium">
            <Save size={18} /> Save
          </button>
          <button onClick={downloadCsv} className="flex items-center gap-2 text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium">
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => navigate(`/feedback/${session.id}`)}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 font-medium transition-colors shadow-sm"
          >
            <Play size={18} className="fill-current" />
            Record Trial Results
          </button>
        </div>
      </div>

      {isRevised && latestIteration.diagnosticExplanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
            <Info size={18} /> Diagnostic Rationale
          </h3>
          <p className="text-blue-800 text-sm mb-0">{latestIteration.diagnosticExplanation}</p>
        </div>
      )}

      {/* D: Recommendations (If available) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recommended Process Parameters</h2>
          {params.recommendedAlloy && (
            <span className="text-xs text-slate-500">
              Optimal Alloy: <strong className="text-slate-800">{params.recommendedAlloy}</strong>
            </span>
          )}
        </div>
        {!hasPredictions ? (
           <div className="p-12 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-500">
             <Settings2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
             <p className="font-medium text-slate-700">No predictions available.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {groups.map(group => (
              <div key={group} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-white px-5 py-3 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800">{group}</h3>
                </div>
                <div className="p-0">
                  {paramDefinitions.filter(p => p.group === group).map(def => {
                    const val = params[def.key as keyof typeof params];
                    const constraint = profile.constraints ? profile.constraints[def.key as keyof typeof profile.constraints] : null;
                    const isChanged = latestIteration.changesFromPrevious.some(c => c.parameter === def.key);
                    
                    return (
                      <div key={def.key} className={`px-5 py-4 flex items-center justify-between border-b border-slate-100 last:border-0 ${isChanged ? 'bg-teal-50/30' : ''}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{def.label}</span>
                            {isChanged && <span className="bg-teal-100 text-teal-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Updated</span>}
                          </div>
                          {constraint && (
                            <span className="text-xs text-slate-500 mt-0.5 block">
                              Range: {constraint.min} - {constraint.max} {constraint.unit}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl font-bold ${isChanged ? 'text-teal-700' : 'text-slate-700'}`}>
                            {typeof val === 'number' ? val.toFixed(2) : val}
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
        )}

        {/* Process Intelligence Highlights (Sizing & Vacuum) */}
        {hasPredictions && (params.clampingForceEst || params.coolingTime || params.vacuumPressure) && (
          <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Boolean(params.clampingForceEst && params.clampingForceEst > 0) && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Est. Clamping Force</span>
                <span className="text-lg font-bold text-slate-800">{params.clampingForceEst} <span className="text-xs font-normal">tonnes</span></span>
              </div>
            )}
            {params.coolingTime !== undefined && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Est. Cooling Time</span>
                <span className="text-lg font-bold text-slate-800">{params.coolingTime} <span className="text-xs font-normal">s</span></span>
              </div>
            )}
            {params.vacuumPressure !== undefined && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Vacuum Level</span>
                <span className="text-lg font-bold text-slate-800">{params.vacuumPressure} <span className="text-xs font-normal">bar</span></span>
              </div>
            )}
            {Boolean(params.gateVelocityEst && params.gateVelocityEst > 0) && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Est. Gate Velocity</span>
                <span className="text-lg font-bold text-slate-800">{params.gateVelocityEst} <span className="text-xs font-normal">m/s</span></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3D Model Section if Mesh Available */}
      {session.component.mesh && session.component.mesh.vertices && session.component.mesh.vertices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Box className="text-teal-600" size={20} />
              Component 3D CAD Geometry
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {session.component.mesh.faces.length.toLocaleString()} polygons
            </span>
          </div>
          <CadViewer3D
            vertices={session.component.mesh.vertices}
            faces={session.component.mesh.faces}
            height={320}
            componentName={session.component.name}
          />
        </div>
      )}

      {/* A & C: Overview & Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={20} /> Component Overview
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">File Name</span>
              <span className="font-medium text-slate-900">{session.component.name}</span>
            </div>
            {session.component.extractedFeatures?.component_type && (
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Component Type</span>
                <span className="font-medium text-slate-900">{session.component.extractedFeatures.component_type}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Bounding Box (L x W x H)</span>
              <span className="font-medium text-slate-900">
                {session.component.extractedFeatures?.bbox_length_mm?.toFixed(1) || '?'} x {session.component.extractedFeatures?.bbox_width_mm?.toFixed(1) || '?'} x {session.component.extractedFeatures?.bbox_height_mm?.toFixed(1) || '?'} mm
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Component Volume</span>
              <span className="font-medium text-slate-900">
                {session.component.extractedFeatures?.component_volume_cm3 !== undefined 
                  ? `${session.component.extractedFeatures.component_volume_cm3.toFixed(1)} cm³`
                  : `${(session.component.extractedFeatures?.volume_mm3 ? session.component.extractedFeatures.volume_mm3 / 1000 : 0).toFixed(1)} cm³`}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Projected Area</span>
              <span className="font-medium text-slate-900">
                {session.component.extractedFeatures?.projected_area_cm2 !== undefined 
                  ? `${session.component.extractedFeatures.projected_area_cm2.toFixed(1)} cm²`
                  : `${(session.component.extractedFeatures?.surface_area_mm2 ? session.component.extractedFeatures.surface_area_mm2 / 100 : 0).toFixed(1)} cm²`}
              </span>
            </div>
            {session.component.extractedFeatures?.estimated_wall_thickness_mm !== undefined && (
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Avg Wall Thickness</span>
                <span className="font-medium text-slate-900">
                  {session.component.extractedFeatures.estimated_wall_thickness_mm.toFixed(2)} mm
                </span>
              </div>
            )}
            {session.component.extractedFeatures?.geometry_complexity && (
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Complexity</span>
                <span className="font-medium text-slate-900">{session.component.extractedFeatures.geometry_complexity}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Mass</span>
              <span className="font-medium text-slate-900">{session.component.extractedFeatures?.estimated_mass_g?.toFixed(1) || '?'} g</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">HPDC Setup</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Alloy Grade</span>
              <span className="font-medium text-slate-900">{session.component.alloy}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Machine Profile</span>
              <span className="font-medium text-slate-900">{profile.name} ({profile.clampingForceClass})</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Die Material</span>
              <span className="font-medium text-slate-900">{session.component.dieType}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Cavities</span>
              <span className="font-medium text-slate-900">{session.component.cavities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max Injection Pressure</span>
              <span className="font-medium text-slate-900">{profile.maxInjectionPressure} MPa</span>
            </div>
          </div>
        </div>
      </div>

      {/* B: Detailed CAD Features */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Detailed CAD Features</h2>
        <div className="overflow-y-auto max-h-64 border border-slate-200 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium">Feature Key</th>
                <th className="px-4 py-3 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(session.component.extractedFeatures || {}).map(([key, val]) => (
                <tr key={key} className="hover:bg-slate-50 bg-white">
                  <td className="px-4 py-2 text-slate-700 font-mono text-xs">{key}</td>
                  <td className="px-4 py-2 font-medium text-slate-900 text-right">
                    {val === null || val === undefined ? (
                      <span className="text-slate-400 italic">Not available</span>
                    ) : typeof val === 'number' ? (
                      val.toFixed(4)
                    ) : (
                      String(val)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Recommendations;
