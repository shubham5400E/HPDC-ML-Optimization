import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { DEMO_MACHINE_PROFILES } from '../services/demoRecommendationService';
import { optimizeParameters } from '../services/demoOptimizationService';
import { DefectType, DefectSeverity, DefectLocation, TrialFeedback, OptimizationIteration } from '../types';
import { ChevronRight, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const DEFECT_OPTIONS: DefectType[] = [
  'Good casting / No major defect',
  'Porosity',
  'Incomplete filling',
  'Cold shut',
  'Flash',
  'Surface defects',
  'Other defect'
];

const Feedback: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const session = useAppStore(state => state.sessions.find(s => s.id === sessionId));
  const addIteration = useAppStore(state => state.addIteration);
  const updateIteration = useAppStore(state => state.updateIteration);

  const [selectedDefects, setSelectedDefects] = useState<DefectType[]>([]);
  const [severity, setSeverity] = useState<DefectSeverity>('Medium');
  const [location, setLocation] = useState<DefectLocation>('Unknown');
  const [inspected, setInspected] = useState(10);
  const [rejected, setRejected] = useState(0);
  const [comments, setComments] = useState('');

  if (!session) return <div className="p-8 text-center">Session not found.</div>;

  const currentIteration = session.iterations[session.iterations.length - 1];

  const handleDefectToggle = (defect: DefectType) => {
    if (defect === 'Good casting / No major defect') {
      setSelectedDefects(['Good casting / No major defect']);
      return;
    }
    
    setSelectedDefects(prev => {
      const filtered = prev.filter(d => d !== 'Good casting / No major defect');
      if (filtered.includes(defect)) {
        return filtered.filter(d => d !== defect);
      } else {
        return [...filtered, defect];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedDefects.length === 0) {
      alert('Please select at least one outcome/defect.');
      return;
    }

    const feedback: TrialFeedback = {
      id: uuidv4(),
      defects: selectedDefects,
      severity,
      location,
      inspectedCount: inspected,
      rejectedCount: rejected,
      comments,
      date: new Date().toISOString()
    };

    // Update current iteration with feedback
    updateIteration(session.id, currentIteration.id, { 
      feedback, 
      status: 'Trial Recorded' 
    });

    if (selectedDefects.includes('Good casting / No major defect')) {
      // If good, no need to optimize further right now
      updateIteration(session.id, currentIteration.id, { status: 'Optimized' });
      navigate(`/history`);
      return;
    }

    // Generate next iteration
    const profile = DEMO_MACHINE_PROFILES.find(p => p.id === session.component.machineProfileId) || DEMO_MACHINE_PROFILES[0];
    const optimizationResult = optimizeParameters(currentIteration.parameters, feedback, profile);

    const newIteration: OptimizationIteration = {
      id: uuidv4(),
      iterationNumber: currentIteration.iterationNumber + 1,
      componentId: session.component.id,
      previousRecommendationId: currentIteration.id,
      parameters: optimizationResult.revisedParams,
      changesFromPrevious: optimizationResult.changes,
      diagnosticExplanation: optimizationResult.explanation,
      status: 'Pending Trial',
      date: new Date().toISOString()
    };

    addIteration(session.id, newIteration);
    navigate(`/recommendations/${session.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <span className="cursor-pointer hover:text-slate-900" onClick={() => navigate('/cad-upload')}>Analysis</span>
        <ChevronRight size={14} />
        <span className="cursor-pointer hover:text-slate-900" onClick={() => navigate(`/recommendations/${session.id}`)}>Recommendations</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium">Trial Feedback</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Trial Results</h1>
        <p className="text-slate-600 mt-1">Provide feedback from the casting trial using Iteration {currentIteration.iterationNumber} parameters.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">1. Observed Casting Quality</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {DEFECT_OPTIONS.map(defect => {
            const isSelected = selectedDefects.includes(defect);
            const isGood = defect === 'Good casting / No major defect';
            return (
              <div 
                key={defect}
                onClick={() => handleDefectToggle(defect)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected 
                    ? isGood ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected 
                    ? isGood ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'
                    : 'border-slate-300'
                }`}>
                  {isSelected && <CheckCircle size={12} className="text-white" />}
                </div>
                <span className={`font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{defect}</span>
              </div>
            );
          })}
        </div>

        {!selectedDefects.includes('Good casting / No major defect') && selectedDefects.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">2. Defect Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                <select 
                  className="w-full border border-slate-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  value={severity}
                  onChange={e => setSeverity(e.target.value as DefectSeverity)}
                >
                  <option value="Low">Low (Minor/Acceptable)</option>
                  <option value="Medium">Medium (Rework required)</option>
                  <option value="High">High (Scrap)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location on Component</label>
                <select 
                  className="w-full border border-slate-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  value={location}
                  onChange={e => setLocation(e.target.value as DefectLocation)}
                >
                  <option value="Thin wall">Thin wall</option>
                  <option value="Thick section">Thick section</option>
                  <option value="Gate area">Gate area</option>
                  <option value="End of fill">End of fill</option>
                  <option value="Unknown">Unknown / Global</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Castings Inspected</label>
                <input 
                  type="number" min="1"
                  className="w-full border border-slate-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  value={inspected}
                  onChange={e => setInspected(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Castings Rejected</label>
                <input 
                  type="number" min="0"
                  className="w-full border border-slate-300 rounded-md p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  value={rejected}
                  onChange={e => setRejected(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Engineer's Comments (Optional)</label>
              <textarea 
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                placeholder="Note any specific observations from the machine readings or die condition..."
                value={comments}
                onChange={e => setComments(e.target.value)}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
               <AlertCircle className="shrink-0 mt-0.5" size={16} />
               <p>Submitting this feedback will trigger the diagnostic engine to identify plausible causes and generate a revised parameter recommendation.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-8 pt-6 border-t border-slate-200">
          <button 
            onClick={handleSubmit}
            disabled={selectedDefects.length === 0}
            className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedDefects.includes('Good casting / No major defect') ? 'Mark as Optimized' : 'Analyze Trial Feedback'}
            {!selectedDefects.includes('Good casting / No major defect') && <Search size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
