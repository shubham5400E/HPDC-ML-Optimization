import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ArrowRight, Box, Settings2, Activity, Play, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const sessions = useAppStore(state => state.sessions);

  const stats = {
    analyzed: sessions.length,
    trials: sessions.reduce((acc, s) => acc + s.iterations.filter(i => i.feedback).length, 0),
    optimizations: sessions.reduce((acc, s) => acc + (s.iterations.length > 0 ? s.iterations.length - 1 : 0), 0)
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Process Intelligence for High Pressure Die Casting</h1>
            <p className="text-slate-600 max-w-2xl text-lg">
              Optimize casting parameters, analyze trial feedback, and reduce defect rates with data-driven recommendations.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <button 
              onClick={() => navigate('/cad-upload')}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              <PlusCircle size={20} />
              Start New Analysis
            </button>
            <button 
              onClick={() => navigate('/history')}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              View Previous Analyses
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Box size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Components Analyzed</p>
            <p className="text-3xl font-bold text-slate-900">{stats.analyzed}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
          <div className="bg-teal-100 text-teal-600 p-3 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Trial Feedback Recorded</p>
            <p className="text-3xl font-bold text-slate-900">{stats.trials}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
            <Settings2 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Optimization Iterations</p>
            <p className="text-3xl font-bold text-slate-900">{stats.optimizations}</p>
          </div>
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Optimization Workflow</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <div className="flex-1">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mb-3 border-2 border-slate-200">
              <Box size={24} />
            </div>
            <p className="font-semibold text-slate-900">1. CAD Upload</p>
            <p className="text-xs text-slate-500 mt-1">Extract geometry features</p>
          </div>
          <ArrowRight className="text-slate-300 hidden md:block" />
          <div className="flex-1">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mb-3 border-2 border-slate-200">
              <Settings2 size={24} />
            </div>
            <p className="font-semibold text-slate-900">2. Initial Params</p>
            <p className="text-xs text-slate-500 mt-1">Generate starting values</p>
          </div>
          <ArrowRight className="text-slate-300 hidden md:block" />
          <div className="flex-1">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mb-3 border-2 border-slate-200">
              <Play size={24} />
            </div>
            <p className="font-semibold text-slate-900">3. Trial Feedback</p>
            <p className="text-xs text-slate-500 mt-1">Record defects observed</p>
          </div>
          <ArrowRight className="text-slate-300 hidden md:block" />
          <div className="flex-1">
            <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-3 border-2 border-teal-200">
              <Activity size={24} />
            </div>
            <p className="font-semibold text-teal-700">4. Optimization</p>
            <p className="text-xs text-slate-500 mt-1">Get revised recommendations</p>
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Recent Analyses</h2>
          <button onClick={() => navigate('/history')} className="text-teal-600 text-sm font-medium hover:text-teal-700">View All</button>
        </div>
        {sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No analyses found. Start a new CAD analysis to see records here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Component</th>
                <th className="px-6 py-3 font-medium">Alloy</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Iterations</th>
                <th className="px-6 py-3 font-medium">Last Updated</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sessions.slice(0, 5).map(session => (
                <tr key={session.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{session.component.name}</td>
                  <td className="px-6 py-4 text-slate-600">{session.component.alloy}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{session.iterations.length}</td>
                  <td className="px-6 py-4 text-slate-600">{format(new Date(session.lastUpdated), 'MMM d, yyyy HH:mm')}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/recommendations/${session.id}`)}
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Continue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
