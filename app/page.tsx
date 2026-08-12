'use client';

import React, { useState } from 'react';
import { generateLessonAction } from '@/app/actions/lessons';
import { submitQuizAction, explainMisconceptionAction } from '@/app/actions/quiz';
import { getUserProfileAction, getLeaderboardAction, verifyPenaltyAction } from '@/app/actions/hunter';
import { getMapNodesAction } from '@/app/actions/map';

export default function BackendDashboardPage() {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'tester'>('endpoints');
  const [topicInput, setTopicInput] = useState('React Hooks');
  const [rankInput, setRankInput] = useState('E');
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<string>('Select an action to test the Next.js System Backend...');

  const handleGenerateLesson = async () => {
    setLoading(true);
    setResponseLog('Generating LLM Lesson & Quiz...');
    try {
      const res = await generateLessonAction({ topic: topicInput, gateRank: rankInput as any });
      setResponseLog(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResponseLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProfile = async () => {
    setLoading(true);
    setResponseLog('Fetching Hunter Profile...');
    try {
      const res = await getUserProfileAction('usr_12345');
      setResponseLog(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResponseLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLeaderboard = async () => {
    setLoading(true);
    setResponseLog('Fetching Hunter Association Leaderboard...');
    try {
      const res = await getLeaderboardAction('weekly', 5);
      setResponseLog(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResponseLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMap = async () => {
    setLoading(true);
    setResponseLog('Fetching Map Nodes & Gates...');
    try {
      const res = await getMapNodesAction();
      setResponseLog(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResponseLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPenalty = async () => {
    setLoading(true);
    setResponseLog('Testing Penalty Zone Verification...');
    try {
      const res = await verifyPenaltyAction({
        hunterId: 'usr_12345',
        score: 4,
        totalQuestions: 5,
        timeTakenSeconds: 45,
      });
      setResponseLog(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResponseLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <header
        style={{
          borderBottom: '2px solid #00e5ff',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ color: '#00e5ff', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            System Status: ONLINE
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#ffffff', textShadow: '0 0 15px rgba(0, 229, 255, 0.4)' }}>
            LEVELUP SYSTEM BACKEND
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
            Next.js App Router • Supabase Database • LLM Engine • Gamification Server Actions
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid #00e5ff',
              color: '#00e5ff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            v1.0.0 Ready
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Control Panel */}
        <section
          style={{
            background: '#0d131f',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 style={{ color: '#00e5ff', fontSize: '1.2rem', marginBottom: '1rem' }}>
            SYSTEM SERVER ACTIONS & API CONTROLS
          </h2>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('endpoints')}
              style={{
                flex: 1,
                padding: '0.6rem',
                background: activeTab === 'endpoints' ? '#00e5ff' : '#1e293b',
                color: activeTab === 'endpoints' ? '#06080d' : '#94a3b8',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Endpoints & Specs
            </button>
            <button
              onClick={() => setActiveTab('tester')}
              style={{
                flex: 1,
                padding: '0.6rem',
                background: activeTab === 'tester' ? '#00e5ff' : '#1e293b',
                color: activeTab === 'tester' ? '#06080d' : '#94a3b8',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Live Action Tester
            </button>
          </div>

          {activeTab === 'tester' ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Target Topic / Gate:
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: '#06080d',
                    border: '1px solid #334155',
                    color: '#fff',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Gate Rank (Difficulty):
                </label>
                <select
                  value={rankInput}
                  onChange={(e) => setRankInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: '#06080d',
                    border: '1px solid #334155',
                    color: '#fff',
                    borderRadius: '4px',
                  }}
                >
                  <option value="E">E-Rank (Beginner)</option>
                  <option value="D">D-Rank (Elementary)</option>
                  <option value="C">C-Rank (Intermediate)</option>
                  <option value="B">B-Rank (Advanced)</option>
                  <option value="A">A-Rank (Expert)</option>
                  <option value="S">S-Rank (Supreme)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={handleGenerateLesson}
                  disabled={loading}
                  style={{
                    padding: '0.75rem',
                    background: '#00e5ff',
                    color: '#06080d',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Generate Lesson
                </button>

                <button
                  onClick={handleFetchProfile}
                  disabled={loading}
                  style={{
                    padding: '0.75rem',
                    background: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  👤 Hunter Profile
                </button>

                <button
                  onClick={handleFetchLeaderboard}
                  disabled={loading}
                  style={{
                    padding: '0.75rem',
                    background: '#8b5cf6',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  🏆 Leaderboard
                </button>

                <button
                  onClick={handleFetchMap}
                  disabled={loading}
                  style={{
                    padding: '0.75rem',
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  🗺️ Map Nodes
                </button>

                <button
                  onClick={handleTestPenalty}
                  disabled={loading}
                  style={{
                    padding: '0.75rem',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    gridColumn: 'span 2',
                  }}
                >
                  ⚠️ Test Penalty Zone Quiz
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1rem' }}>Available REST API Routes & Server Actions:</p>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <code style={{ color: '#00e5ff' }}>POST /api/lessons/generate</code> - LLM Lesson & 5 MCQs
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <code style={{ color: '#00e5ff' }}>POST /api/quiz/submit</code> - Validation & Mana XP
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <code style={{ color: '#00e5ff' }}>POST /api/quiz/explain</code> - Misconception Analysis
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <code style={{ color: '#00e5ff' }}>GET /api/users/profile</code> - Hunter Stats & Badges
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <code style={{ color: '#00e5ff' }}>GET /api/leaderboard</code> - Hunter Association Ranks
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <code style={{ color: '#00e5ff' }}>POST /api/penalty/verify</code> - Penalty Zone Quiz
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <code style={{ color: '#00e5ff' }}>GET /api/map/nodes</code> - City Map Fog & Nodes
                </li>
              </ul>
            </div>
          )}
        </section>

        {/* Response Viewer */}
        <section
          style={{
            background: '#0a0d14',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              SYSTEM OUTPUT TERMINAL
            </h3>
            {loading && <span style={{ color: '#00e5ff', fontSize: '0.85rem' }}>Executing Action...</span>}
          </div>

          <pre
            style={{
              flex: 1,
              background: '#030508',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              padding: '1rem',
              color: '#38bdf8',
              fontSize: '0.85rem',
              overflow: 'auto',
              maxHeight: '500px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}
          >
            {responseLog}
          </pre>
        </section>
      </div>
    </main>
  );
}
