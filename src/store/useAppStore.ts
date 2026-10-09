import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisSession, ComponentData, OptimizationIteration } from '../types';

interface AppState {
  sessions: AnalysisSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  createSession: (component: ComponentData) => AnalysisSession;
  addIteration: (sessionId: string, iteration: OptimizationIteration) => void;
  updateIteration: (sessionId: string, iterationId: string, updates: Partial<OptimizationIteration>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      createSession: (component) => {
        const newSession: AnalysisSession = {
          id: `session_${Date.now()}`,
          component,
          iterations: [],
          status: 'In Progress',
          lastUpdated: new Date().toISOString()
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id
        }));
        return newSession;
      },
      addIteration: (sessionId, iteration) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, iterations: [...session.iterations, iteration], lastUpdated: new Date().toISOString() }
              : session
          )
        }));
      },
      updateIteration: (sessionId, iterationId, updates) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { 
                  ...session, 
                  iterations: session.iterations.map(it => it.id === iterationId ? { ...it, ...updates } : it),
                  lastUpdated: new Date().toISOString()
                }
              : session
          )
        }));
      }
    }),
    {
      name: 'castpilot-storage',
    }
  )
);
