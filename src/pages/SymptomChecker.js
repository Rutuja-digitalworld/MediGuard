import React, { useState } from 'react';
import { Stethoscope, Search, Loader2, AlertCircle, ShieldAlert, ListChecks, ClipboardCheck, X, Save, Thermometer, Brain, Wind, Frown, HeartPulse, RotateCw, BatteryLow, Activity, Bone, Moon, Droplets, Heart, CircleDot, Flame, Eye, Droplet, Link2, Hand } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Navbar from '../components/Navbar';

function SymptomChecker({ user, navigate }) {
  const [symptoms, setSymptoms] = useState('');
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const { t, lang } = useLanguage();

  const quickSymptoms = [
    { label: t('sym_fever'), value: 'fever', icon: Thermometer },
    { label: t('sym_headache'), value: 'headache', icon: Brain },
    { label: t('sym_cough'), value: 'cough', icon: Wind },
    { label: t('sym_vomiting'), value: 'vomiting', icon: Frown },
    { label: t('sym_chestpain'), value: 'chest pain', icon: HeartPulse },
    { label: t('sym_dizziness'), value: 'dizziness', icon: RotateCw },
    { label: t('sym_weakness'), value: 'weakness', icon: BatteryLow },
    { label: t('sym_breathing'), value: 'breathing difficulty', icon: Activity },
    { label: t('sym_bodypain'), value: 'body pain', icon: Bone },
    { label: t('sym_fatigue'), value: 'fatigue', icon: Moon },
    { label: t('sym_cold'), value: 'cold runny nose', icon: Droplets },
    { label: t('sym_palpitations'), value: 'heart palpitations', icon: Heart },
    { label: t('sym_stomachpain'), value: 'stomach pain', icon: CircleDot },
    { label: t('sym_burning'), value: 'burning sensation', icon: Flame },
    { label: t('sym_jaundice'), value: 'yellow skin yellowing eyes jaundice', icon: Eye },
    { label: t('sym_darkurine'), value: 'dark urine', icon: Droplet },
    { label: t('sym_jointpain'), value: 'joint pain', icon: Link2 },
    { label: t('sym_itchyskin'), value: 'itchy skin rash', icon: Hand },
  ];

  const langNames = {
    en: 'English',
    hi: 'Hindi (Devanagari script, not Hinglish)',
    mr: 'Marathi (Devanagari script)',
  };

  const toggleSymptom = (val) => {
    const newSelected = selected.includes(val)
      ? selected.filter(s => s !== val)
      : [...selected, val];
    setSelected(newSelected);
    setSymptoms(newSelected.join(', '));
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      alert(t('enterSymptoms'));
      return;
    }

    setLoading(true);
    setResult(null);
    setSavedMsg(false);
    setErrorMsg(null);

    try {
      const profile = JSON.parse(localStorage.getItem(`profile_${user?.email}`) || '{}');

      const prompt = `You are a medical triage AI assistant. A patient reports these symptoms: "${symptoms}"

Patient context: Age ${profile?.age || 'unknown'}, Gender: ${profile?.gender || 'unknown'}, Blood Group: ${profile?.bloodGroup || 'unknown'}, Existing Conditions: ${[profile?.diabetes && 'Diabetes', profile?.heartDisease && 'Heart Disease', profile?.asthma && 'Asthma', profile?.bp && 'Blood Pressure', profile?.thyroid && 'Thyroid', profile?.kidney && 'Kidney Disease'].filter(Boolean).join(', ') || 'None'}, Allergies: ${profile?.allergies || 'None known'}

IMPORTANT: Respond entirely in ${langNames[lang]}. All text in "conditions" and "recommendations" arrays must be written in ${langNames[lang]}, not English, not Hinglish (unless language is English).

Respond ONLY with valid JSON in this exact format, no markdown formatting, no backticks, no other text before or after:
{
  "risk": "High Risk",
  "confidence": 85,
  "conditions": ["condition1 in ${langNames[lang]}", "condition2 in ${langNames[lang]}", "condition3 in ${langNames[lang]}", "condition4 in ${langNames[lang]}"],
  "recommendations": ["recommendation1 in ${langNames[lang]}", "recommendation2 in ${langNames[lang]}", "recommendation3 in ${langNames[lang]}", "recommendation4 in ${langNames[lang]}"],
  "isEmergency": false
}

Rules:
- risk field itself must still be exactly "High Risk", "Medium Risk", or "Low Risk" (keep this in English, it's used internally)
- confidence is a number between 70-99
- conditions: 3-4 medically relevant possible conditions based on the EXACT symptoms given, written fully in ${langNames[lang]}
- recommendations: 4-5 specific actionable steps written fully in ${langNames[lang]} (no emojis, plain text)
- isEmergency: true only if symptoms suggest immediate life-threatening danger
- Be medically accurate and specific, not generic`;

      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('REACT_APP_GROQ_API_KEY missing in .env file');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: 'You are a medical triage AI assistant. Always respond with valid JSON only, no markdown, no backticks.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1024,
          temperature: 0.7,
        })
      });

      const data = await response.json();
      console.log('Groq raw response:', data); // temp debug — remove once stable

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }
      if (!data.choices || !data.choices[0]) {
        throw new Error('No response from Groq API');
      }

      const aiText = data.choices[0].message.content;
      const cleanJson = aiText.replace(/```json|```/g, '').trim();
      const aiResult = JSON.parse(cleanJson);

      setResult({
        risk: aiResult.risk,
        isEmergency: aiResult.isEmergency,
        recommendations: aiResult.recommendations,
        conditions: aiResult.conditions,
        symptoms,
        confidence: aiResult.confidence,
        date: new Date().toLocaleDateString('en-IN'),
      });
    } catch (error) {
      console.error('AI Error:', error);
      setErrorMsg(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSaveToRecords = () => {
    const key = `health_history_${user?.email}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.push({
      symptoms: result.symptoms,
      risk: result.risk,
      date: result.date,
      confidence: result.confidence,
      conditions: result.conditions,
      recommendations: result.recommendations,
      isEmergency: result.isEmergency,
    });
    localStorage.setItem(key, JSON.stringify(history));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleClear = () => {
    setResult(null);
    setSymptoms('');
    setSelected([]);
    setSavedMsg(false);
    setErrorMsg(null);
  };

  const riskStyle = {
    'High Risk': { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', badge: 'badge-high' },
    'Medium Risk': { bg: '#fffbeb', border: '#fde68a', text: '#d97706', badge: 'badge-medium' },
    'Low Risk': { bg: '#e6f7f0', border: '#bbf0da', text: '#0f9d6e', badge: 'badge-low' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar navigate={navigate} currentPage="symptoms" />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, var(--primary-bright), var(--primary-dark))',
            borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 12px 26px rgba(15,184,127,0.32)'
          }}>
            <Stethoscope size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
            {t('symptomCheckerTitle')}
          </h1>
          <p style={{ color: 'var(--text-light)', marginTop: '8px', fontSize: '0.95rem' }}>
            {t('symptomCheckerSubtitle')}
          </p>
        </div>

        {!result && (
          <>
            <div className="card fade-in" style={{ marginBottom: '16px' }}>
              <h3 style={{
                color: 'var(--text-dark)', marginBottom: '16px', fontSize: '1rem', fontWeight: '800',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{
                  width: '26px', height: '26px', borderRadius: '8px',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Activity size={14} color="var(--primary)" />
                </span>
                {t('quickSelect')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {quickSymptoms.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = selected.includes(s.value);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleSymptom(s.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '9px',
                        padding: '11px 14px', borderRadius: '14px',
                        border: isActive ? '1.5px solid transparent' : '1.5px solid #e2e8f0',
                        background: isActive
                          ? 'linear-gradient(135deg, var(--primary-bright), var(--primary-dark))'
                          : 'white',
                        color: isActive ? 'white' : '#475569',
                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                        transition: 'all 0.2s cubic-bezier(.2,.8,.2,1)', fontFamily: 'Inter, sans-serif',
                        boxShadow: isActive ? '0 8px 18px rgba(15,184,127,0.32)' : 'none',
                        transform: isActive ? 'translateY(-2px)' : 'none'
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <Icon size={16} color={isActive ? 'white' : 'var(--primary)'} style={{ flexShrink: 0 }} />
                      <span style={{ textAlign: 'left' }}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card fade-in" style={{ marginBottom: '16px' }}>
              <h3 style={{ color: 'var(--text-dark)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700' }}>
                {t('writeYourself')}
              </h3>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder={t('symptomsPlaceholder')}
                style={{
                  width: '100%', padding: '14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text-dark)',
                  fontSize: '0.95rem', height: '120px',
                  resize: 'none', fontFamily: 'Inter, sans-serif',
                  outline: 'none'
                }}
              />
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ marginTop: '14px' }}>
                {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
                {loading ? t('analyzing') : t('checkRisk')}
              </button>
              {errorMsg && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}
            </div>
          </>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner"/>
            <p style={{ color: 'var(--text-light)' }}>{t('analyzing')}</p>
          </div>
        )}

        {result && (
          <div className="fade-in">

            {result.isEmergency && (
              <div style={{
                background: '#fef2f2', border: '1.5px solid #fecaca',
                borderRadius: '14px', padding: '22px', textAlign: 'center', marginBottom: '18px'
              }}>
                <ShieldAlert size={32} color="#dc2626" style={{ marginBottom: '10px' }} />
                <h2 style={{ color: '#dc2626', fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
                  {t('emergencyDetected')}
                </h2>
                <p style={{ color: '#991b1b', marginBottom: '14px', fontSize: '0.9rem' }}>{t('seekHelp')}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {[['Ambulance', '108'], ['Police', '100'], ['Emergency', '112']].map(([name, num]) => (
                    <div key={name} style={{ background: 'white', padding: '10px 18px', borderRadius: '10px', minWidth: '95px', border: '1px solid #fecaca' }}>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{name}</p>
                      <p style={{ color: '#dc2626', fontWeight: '800', fontSize: '1.3rem' }}>{num}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '24px', background: riskStyle[result.risk].bg,
                borderBottom: `1px solid ${riskStyle[result.risk].border}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ color: 'var(--text-dark)', fontSize: '1.3rem', fontWeight: '800' }}>{t('analysisResult')}</h2>
                  <span className={`badge ${riskStyle[result.risk].badge}`}>
                    {result.risk.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-medium)', marginTop: '8px', fontSize: '0.85rem' }}>
                  {t('confidenceScore')}: {result.confidence}% &nbsp;•&nbsp; {t('aiPowered')}
                </p>
              </div>

              <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--text-dark)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '700' }}>
                  <ListChecks size={18} color="var(--text-medium)" />
                  {t('possibleConditions')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {result.conditions.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 14px', background: '#f8fafc',
                      borderRadius: '10px', color: 'var(--text-dark)', fontSize: '0.88rem'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}/>
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{ color: 'var(--text-dark)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '700' }}>
                  <ClipboardCheck size={18} color="var(--primary)" />
                  {t('recommendations')}
                </h3>
                {result.recommendations.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                    padding: '12px 14px', background: '#f8fafc',
                    borderRadius: '10px', marginBottom: '8px',
                    color: 'var(--text-dark)', fontSize: '0.9rem'
                  }}>
                    <CheckMark />
                    {r}
                  </div>
                ))}
              </div>

              <div style={{
                padding: '18px 24px', background: '#f8fafc',
                display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap'
              }}>
                <button onClick={handleClear} className="btn-secondary" style={{ width: 'auto' }}>
                  <X size={16} />
                  {t('clear')}
                </button>
                <button onClick={handleSaveToRecords} className="btn-primary" style={{ width: 'auto' }}>
                  <Save size={16} />
                  {t('saveToRecords')}
                </button>
              </div>
            </div>

            {savedMsg && (
              <div className="alert alert-success">
                <ClipboardCheck size={16} />
                {t('recordSaved')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <div style={{
      width: '16px', height: '16px', borderRadius: '50%',
      background: 'var(--primary-light)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
    }}>
      <ClipboardCheck size={10} color="var(--primary)" />
    </div>
  );
}

export default SymptomChecker;