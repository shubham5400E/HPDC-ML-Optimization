import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { DEMO_MACHINE_PROFILES } from '../services/demoRecommendationService';
import { ComponentData, OptimizationIteration } from '../types';
import { Upload, FileBox, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { analyzeCadFile } from '../services/api';
import { CadViewer3D } from '../components/CadViewer3D';

const CadUpload: React.FC = () => {
  const navigate = useNavigate();
  const createSession = useAppStore(state => state.createSession);
  const addIteration = useAppStore(state => state.addIteration);
  
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Setup Form State
  const [alloy, setAlloy] = useState<ComponentData['alloy']>('LM16');
  const [machineProfileId, setMachineProfileId] = useState(DEMO_MACHINE_PROFILES[0].id);
  const [dieType, setDieType] = useState('H13 Tool Steel');
  const [cavities, setCavities] = useState(1);

  const [extractedFeatures, setExtractedFeatures] = useState<Record<string, any> | null>(null);
  const [mesh, setMesh] = useState<{ vertices: number[][]; faces: number[][] } | null>(null);
  const [cachedPredictions, setCachedPredictions] = useState<any | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (['step', 'stp'].includes(ext || '')) {
        setFile(selected);
        setError(null);
        setExtractedFeatures(null);
        setMesh(null);
        setCachedPredictions(null);
        
        setIsExtracting(true);
        try {
          const formData = new FormData();
          formData.append('file', selected);
          formData.append('alloy_grade', alloy);
          formData.append('machine_id', machineProfileId);
          formData.append('die_material', dieType);
          formData.append('cavity_count', cavities.toString());

          const response = await analyzeCadFile(formData);
          setExtractedFeatures(response.features);
          if (response.mesh && response.mesh.vertices && response.mesh.faces) {
            setMesh(response.mesh);
          }
          if (response.predictions) {
            setCachedPredictions(response.predictions);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to extract geometry from file.');
        } finally {
          setIsExtracting(false);
        }
      } else {
        setError('Unsupported file type. Please upload a .step or .stp file.');
        setFile(null);
        setExtractedFeatures(null);
        setMesh(null);
        setCachedPredictions(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alloy_grade', alloy);
      formData.append('machine_id', machineProfileId);
      formData.append('die_material', dieType);
      formData.append('cavity_count', cavities.toString());

      const response = await analyzeCadFile(formData);

      const component: ComponentData = {
        id: uuidv4(),
        name: file.name.split('.')[0],
        alloy,
        machineProfileId,
        dieType,
        cavities,
        mass: response.features.estimated_mass_g ? response.features.estimated_mass_g / 1000 : 0,
        coolingConfig: 'Standard',
        extractedFeatures: response.features,
        uploadDate: new Date().toISOString(),
        mesh: response.mesh || mesh || undefined
      };

      const session = createSession(component);
      
      const iteration: OptimizationIteration = {
        id: uuidv4(),
        iterationNumber: 1,
        componentId: component.id,
        parameters: response.predictions || cachedPredictions || {} as any,
        changesFromPrevious: [],
        status: 'Pending Trial',
        date: new Date().toISOString(),
        diagnosticExplanation: response.warnings?.join(' ')
      };
      
      addIteration(session.id, iteration);
      navigate(`/recommendations/${session.id}`);

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-slate-500 text-sm mb-4">Supports .step, .stp up to 50MB</p>
            <label className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 cursor-pointer font-medium">
              Browse Files
              <input type="file" className="hidden" accept=".step,.stp" onChange={handleFileChange} />
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
                onClick={() => { setFile(null); setError(null); }}
                className="text-slate-400 hover:text-red-500"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            {isExtracting && (
              <div className="flex items-center justify-center py-8 text-slate-500 gap-3">
                <Loader2 className="animate-spin" size={24} />
                <span>Extracting CAD geometry...</span>
              </div>
            )}
            
            {!isExtracting && extractedFeatures && (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-emerald-800">
                      <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-semibold text-sm">Geometry Analysis Complete</p>
                        <p className="text-sm mt-0.5 text-emerald-700">CAD features successfully extracted and verified by the geometry engine.</p>
                      </div>
                    </div>
                    {extractedFeatures.component_type && (
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          {extractedFeatures.component_type}
                        </span>
                        {extractedFeatures.geometry_complexity && (
                          <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full font-medium">
                            Complexity: {extractedFeatures.geometry_complexity}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3D CAD Preview */}
                {mesh && mesh.vertices && mesh.vertices.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Interactive 3D Geometry Preview
                      </span>
                      <span className="text-xs text-slate-400">
                        Rotate / Pan / Zoom
                      </span>
                    </div>
                    <CadViewer3D
                      vertices={mesh.vertices}
                      faces={mesh.faces}
                      height={340}
                      componentName={file?.name}
                    />
                  </div>
                )}

                {/* Extracted Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">Bounding Box (L×W×H)</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {extractedFeatures.bbox_length_mm?.toFixed(1) || '?'} × {extractedFeatures.bbox_width_mm?.toFixed(1) || '?'} × {extractedFeatures.bbox_height_mm?.toFixed(1) || '?'} <span className="text-xs font-normal text-slate-500">mm</span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">Component Volume</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {extractedFeatures.component_volume_cm3 !== undefined 
                        ? extractedFeatures.component_volume_cm3.toFixed(1) 
                        : (extractedFeatures.volume_mm3 ? (extractedFeatures.volume_mm3 / 1000).toFixed(1) : '?')}{' '}
                      <span className="text-xs font-normal text-slate-500">cm³</span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">Projected Area</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {extractedFeatures.projected_area_cm2 !== undefined
                        ? extractedFeatures.projected_area_cm2.toFixed(1)
                        : (extractedFeatures.surface_area_mm2 ? (extractedFeatures.surface_area_mm2 / 100).toFixed(1) : '?')}{' '}
                      <span className="text-xs font-normal text-slate-500">cm²</span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">Avg Wall Thickness</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {extractedFeatures.estimated_wall_thickness_mm !== undefined
                        ? extractedFeatures.estimated_wall_thickness_mm.toFixed(2)
                        : '—'}{' '}
                      <span className="text-xs font-normal text-slate-500">mm</span>
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 text-sm p-4 bg-red-50 rounded border border-red-200">
                <AlertCircle size={16} />
                <span>{error}</span>
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                {DEMO_MACHINE_PROFILES.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.clampingForceClass})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Die Material</label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={dieType}
                onChange={e => setDieType(e.target.value)}
                disabled={isLoading}
              >
                <option value="H13 Tool Steel">H13 Tool Steel</option>
                <option value="Dievar">Dievar</option>
                <option value="Unknown">Other / Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cavities</label>
              <input 
                type="number" 
                min="1" 
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={cavities}
                onChange={e => setCavities(parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing CAD & Features...
                </>
              ) : (
                <>
                  Process & Extract Features
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadUpload;
