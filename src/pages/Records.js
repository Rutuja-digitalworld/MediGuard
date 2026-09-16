import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, FileSearch, X, ListChecks, ClipboardCheck, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Navbar from '../components/Navbar';
import RiskBarChart from '../components/RiskBarChart';

function Records({ user, navigate }) {
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem(`health_history_${user?.email}`) || '[]');
    setHistory(h.reverse());
  }, [user]);

  const riskStyle = {
    'High Risk': { bg: '#fef2f2', border: '#fecaca', badge: 'badge-high', text: '#dc2626' },
    'Medium Risk': { bg: '#fffbeb', border: '#fde68a', badge: 'badge-medium', text: '#d97706' },
    'Low Risk': { bg: '#e6f7f0', border: '#bbf0da', badge: 'badge-low', text: '#0f9d6e' },
  };

  const hasAnalysis = (h) => Array.isArray(h.conditions) && h.conditions.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar navigate={navigate} currentPage="records" user={user} />

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 40px' }}>
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', background: 'var(--primary-light)',
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px'
          }}>
            <ClipboardList size={26} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>{t('recordsTitle')}</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '6px', fontSize: '0.92rem' }}>{t('recordsSubtitle')}</p>
        </div>

        {history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <FileSearch size={36} color="var(--text-light)" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>{t('noRecords')}</p>
            <button className="btn-primary" onClick={() => navigate('symptoms')} style={{ width: 'auto', padding: '12px 24px' }}>
              {t('firstCheck')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Left: bar chart, sticky */}
            <div style={{ flex: '1.3 1 600px', minWidth: '520px', position: 'sticky', top: '90px' }}>
              <RiskBarChart history={history} />
            </div>

            {/* Right: scrollable, clickable records list */}
            <div style={{
              flex: '1 1 480px', minWidth: '420px',
              maxHeight: 'calc(100vh - 140px)', overflowY: 'auto',
              paddingRight: '6px'
            }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  className="fade-in card"
                  onClick={() => hasAnalysis(h) && setSelectedRecord(h)}
                  style={{
                    background: riskStyle[h.risk]?.bg || 'white',
                    borderColor: riskStyle[h.risk]?.border || 'var(--border)',
                    marginBottom: '12px', padding: '18px',
                    cursor: hasAnalysis(h) ? 'pointer' : 'default'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} /> {h.date}
                    </p>
                    <span className={`badge ${riskStyle[h.risk]?.badge || ''}`}>{h.risk}</span>
                  </div>
                  <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                    <strong>{t('symptoms')}:</strong> {h.symptoms}
                  </p>
                  {hasAnalysis(h) && (
                    <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '8px', fontStyle: 'italic' }}>
                      Tap to view full AI analysis →
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis detail modal */}
        {selectedRecord && (
          <div
            onClick={() => setSelectedRecord(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px', zIndex: 1000
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
                padding: 0, overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '20px 24px', background: riskStyle[selectedRecord.risk]?.bg,
                borderBottom: `1px solid ${riskStyle[selectedRecord.risk]?.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
              }}>
                <div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                    <Calendar size={13} /> {selectedRecord.date}
                  </p>
                  <span className={`badge ${riskStyle[selectedRecord.risk]?.badge}`}>{selectedRecord.risk}</span>
                  {selectedRecord.confidence && (
                    <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-medium)' }}>
                      {selectedRecord.confidence}% confidence
                    </span>
                  )}
                </div>
                <button onClick={() => setSelectedRecord(null)} style={{
                  background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0
                }}>
                  <X size={16} color="var(--text-medium)" />
                </button>
              </div>

              {selectedRecord.isEmergency && (
                <div style={{ padding: '16px 24px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={20} color="#dc2626" />
                  <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.9rem' }}>Emergency was flagged for this check</span>
                </div>
              )}

              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>{t('symptoms')}</p>
                <p style={{ color: 'var(--text-dark)', fontSize: '0.92rem' }}>{selectedRecord.symptoms}</p>
              </div>

              {Array.isArray(selectedRecord.conditions) && selectedRecord.conditions.length > 0 && (
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ color: 'var(--text-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: '700' }}>
                    <ListChecks size={16} color="var(--text-medium)" />
                    {t('possibleConditions')}
                  </h3>
                  {selectedRecord.conditions.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 12px', background: '#f8fafc',
                      borderRadius: '8px', marginBottom: '6px', color: 'var(--text-dark)', fontSize: '0.85rem'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                      {c}
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(selectedRecord.recommendations) && selectedRecord.recommendations.length > 0 && (
                <div style={{ padding: '20px 24px' }}>
                  <h3 style={{ color: 'var(--text-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: '700' }}>
                    <ClipboardCheck size={16} color="var(--primary)" />
                    {t('recommendations')}
                  </h3>
                  {selectedRecord.recommendations.map((r, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', background: '#f8fafc',
                      borderRadius: '8px', marginBottom: '6px', color: 'var(--text-dark)', fontSize: '0.85rem'
                    }}>
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Records;