import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { ArrowRight, Box, Settings2, Activity, Play, ChevronRight, Download } from 'lucide-react';

const OptimizationHistory: React.FC = () => {
  const navigate = useNavigate();
  const sessions = useAppStore(state => state.sessions);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Optimization History</h1>
          <p className="text-slate-600 mt-1">Review previous parameter analyses and trial outcomes.</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <p>No optimization history available.</p>
          <button 
            onClick={() => navigate('/cad-upload')}
            className="mt-4 text-teal-600 font-medium hover:text-teal-700"
          >
            Start a new analysis
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-slate-900">{session.component.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      session.status === 'Completed' || session.iterations.some(i => i.status === 'Optimized') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {session.iterations.some(i => i.status === 'Optimized') ? 'Optimized' : session.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Alloy: {session.component.alloy} • Started: {format(new Date(session.component.uploadDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => navigate(`/recommendations/${session.id}`)} className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1">
                    View Current Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-10"></div>
                  <div className="flex justify-between">
                    
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm mb-3">1</div>
                      <p className="text-sm font-semibold text-slate-900">CAD Analysis</p>
                      <p className="text-xs text-slate-500 mt-1">{format(new Date(session.component.uploadDate), 'HH:mm')}</p>
                    </div>

                    {session.iterations.map((iteration, index) => (
                      <React.Fragment key={iteration.id}>
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm mb-3">
                            <Settings2 size={18} />
                          </div>
                          <p className="text-sm font-semibold text-slate-900">Iter {iteration.iterationNumber} Params</p>
                          <p className="text-xs text-slate-500 mt-1">{format(new Date(iteration.date), 'HH:mm')}</p>
                        </div>
                        
                        {iteration.feedback && (
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm mb-3 ${
                              iteration.feedback.defects.includes('Good casting / No major defect') 
                                ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                                : 'bg-red-100 text-red-700 border-2 border-red-200'
                            }`}>
                              <Activity size={18} />
                            </div>
                            <p className="text-sm font-semibold text-slate-900">Trial Feedback</p>
                            <p className="text-xs text-slate-500 mt-1 truncate max-w-[120px] text-center" title={iteration.feedback.defects.join(', ')}>
                              {iteration.feedback.defects.join(', ')}
                            </p>
                          </div>
                        )}
                      </React.Fragment>
                    ))}

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizationHistory;
