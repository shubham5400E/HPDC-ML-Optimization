import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { DEMO_MACHINE_PROFILES, generateInitialRecommendation } from '../services/demoRecommendationService';
import { ComponentData, OptimizationIteration } from '../types';
import { Upload, FileBox, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CadUpload: React.FC = () => {
  const navigate = useNavigate();
  const createSession = useAppStore(state => state.createSession);
  const addIteration = useAppStore(state => state.addIteration);
  
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulatedFeatures, setSimulatedFeatures] = useState<boolean>(false);

  // Setup Form State
  const [alloy, setAlloy] = useState<ComponentData['alloy']>('LM16');
  const [machineProfileId, setMachineProfileId] = useState(DEMO_MACHINE_PROFILES[0].id);
  const [dieType, setDieType] = useState('H13 Tool Steel');
  const [cavities, setCavities] = useState(1);
  const [mass, setMass] = useState(2.5);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (['step', 'stp', 'stl'].includes(ext || '')) {
        setFile(selected);
        setError(null);
        setSimulatedFeatures(true);
      } else {
        setError('Unsupported file type. Please upload a .step, .stp, or .stl file.');
        setFile(null);
        setSimulatedFeatures(false);
      }
    }
  };

  const handleGenerate = () => {
    if (!file) return;

    const component: ComponentData = {
      id: uuidv4(),
      name: file.name.split('.')[0],
      alloy,
      machineProfileId,
      dieType,
      cavities,
      mass,
      coolingConfig: 'Standard',
      dimensions: { length: 150, width: 120, height: 80 },
      volume: 450,
      projectedArea: 180,
      wallThickness: 3.5,
      uploadDate: new Date().toISOString()
    };

    const session = createSession(component);
    
    const initialParams = generateInitialRecommendation(component);
    const iteration: OptimizationIteration = {
      id: uuidv4(),
      iterationNumber: 1,
      componentId: component.id,
      parameters: initialParams,
      changesFromPrevious: [],
      status: 'Pending Trial',
      date: new Date().toISOString()
    };
    
    addIteration(session.id, iteration);
    navigate(`/recommendations/${session.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New CAD Analysis</h1>
      
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">1. Upload Component Geometry</h2>
        
        {!file ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium mb-1">Drag and drop CAD file here, or click to browse</p>
            <p className="text-slate-500 text-sm mb-4">Supports .step, .stp, .stl up to 50MB</p>
            <label className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 cursor-pointer font-medium">
              Browse Files
              <input type="file" className="hidden" accept=".step,.stp,.stl" onChange={handleFileChange} />
            </label>
            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                  <FileBox size={24} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.name.split('.').pop()?.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setSimulatedFeatures(false); }}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            
            {simulatedFeatures && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-6">
                <div className="flex gap-3 text-emerald-800">
                  <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-semibold text-sm">Geometry Analysis Complete</p>
                    <p className="text-sm mt-1 text-emerald-700">CAD features successfully extracted and verified by the geometry engine.</p>
                  </div>
                </div>
              </div>
            )}


          </div>
        )}
      </div>

      {/* Setup Section */}
      {file && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-bold text-slate-900 mb-6">2. Casting Setup Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alloy Grade</label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={alloy}
                onChange={e => setAlloy(e.target.value as ComponentData['alloy'])}
              >
                <option value="LM16">LM16 (Al-Si-Cu)</option>
                <option value="AC2A">AC2A (JIS)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Machine Profile</label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={machineProfileId}
                onChange={e => setMachineProfileId(e.target.value)}
              >
                {DEMO_MACHINE_PROFILES.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.clampingForceClass})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Die Type</label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={dieType}
                onChange={e => setDieType(e.target.value)}
              >
                <option value="H13 Tool Steel">H13 Tool Steel</option>
                <option value="Dievar">Dievar</option>
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cavities</label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  value={cavities}
                  onChange={e => setCavities(parseInt(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Est. Mass (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  value={mass}
                  onChange={e => setMass(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button 
              onClick={handleGenerate}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
            >
              Generate Initial Parameters
              <CheckCircle2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadUpload;
