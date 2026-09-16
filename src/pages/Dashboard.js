import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, CheckCircle2, AlertTriangle, AlertOctagon, ClipboardList, User, Send, Trash2, Loader2, Phone, Camera, X, Calendar } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Navbar from '../components/Navbar';

function Dashboard({ user, navigate, onLogout }) {
  const [stats, setStats] = useState({ total: 0, low: 0, medium: 0, high: 0 });
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isFirstLoad = useRef(true);
  const chatKey = `chat_history_${user?.email}`;

  const langNames = {
    en: 'English',
    hi: 'Hindi (Devanagari script)',
    mr: 'Marathi (Devanagari script)',
  };

  const getProfile = () => JSON.parse(localStorage.getItem(`profile_${user?.email}`) || '{}');

  const DoctorSVG = ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#e6f7f0"/>
      <circle cx="50" cy="34" r="19" fill="#0a7a54"/>
      <ellipse cx="50" cy="83" rx="31" ry="22" fill="#0a7a54"/>
      <circle cx="50" cy="34" r="15" fill="#fde8d8"/>
      <rect x="36" y="56" width="28" height="22" rx="5" fill="white"/>
      <rect x="45" y="52" width="10" height="8" rx="3" fill="#fde8d8"/>
      <line x1="50" y1="62" x2="50" y2="73" stroke="#0f9d6e" strokeWidth="3"/>
      <line x1="44" y1="67" x2="56" y2="67" stroke="#0f9d6e" strokeWidth="3"/>
    </svg>
  );

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem(`health_history_${user?.email}`) || '[]');
    setStats({
      total: h.length,
      low: h.filter(x => x.risk === 'Low Risk').length,
      medium: h.filter(x => x.risk === 'Medium Risk').length,
      high: h.filter(x => x.risk === 'High Risk').length,
    });

    const saved = JSON.parse(localStorage.getItem(chatKey) || '[]');
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        text: t('chatWelcome'),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    isFirstLoad.current = true;
  }, [user]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const saveMessages = (msgs) => {
    localStorage.setItem(chatKey, JSON.stringify(msgs.map(m => ({ ...m, image: null }))));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert('Image 4MB se choti honi chahiye!'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setSelectedImage(reader.result); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg = {
      id: Date.now(), role: 'user',
      text: input.trim() || 'Please analyze this image.',
      image: selectedImage,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const currentInput = input.trim();
    const currentImage = selectedImage;
    setInput(''); setSelectedImage(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);

    try {
      const profile = getProfile();
      const conversationHistory = updatedMessages.slice(-8)
        .map(m => `${m.role === 'user' ? 'Patient' : 'Doctor'}: ${m.text}`).join('\n');

      const prompt = `You are MediGuard AI, a professional medical assistant. You are helpful, empathetic, and medically knowledgeable.

Patient Profile:
- Name: ${profile.name || user?.name || 'Patient'}
- Age: ${profile.age || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}
- Blood Group: ${profile.bloodGroup || 'Unknown'}
- Existing Conditions: ${[profile.diabetes && 'Diabetes', profile.heartDisease && 'Heart Disease', profile.asthma && 'Asthma', profile.bp && 'Blood Pressure', profile.thyroid && 'Thyroid', profile.kidney && 'Kidney Disease'].filter(Boolean).join(', ') || 'None'}
- Allergies: ${profile.allergies || 'None known'}
- Family History: ${[profile.familyDiabetes && 'Diabetes', profile.familyHeartDisease && 'Heart Disease', profile.familyCancer && 'Cancer', profile.familyBP && 'BP'].filter(Boolean).join(', ') || 'None'}

RULES:
1. Respond in ${langNames[lang]} only
2. Be warm, empathetic and clear - use simple language elderly can understand
3. For serious symptoms, recommend doctor visit immediately
4. Never prescribe specific medications or dosages
5. If image provided, analyze it medically
6. Use patient profile when relevant

Recent Conversation:
${conversationHistory}

Patient message: "${currentInput || 'Please analyze this image'}"
${currentImage ? 'Note: Patient shared a medical image for analysis.' : ''}

Respond as MediGuard AI in ${langNames[lang]}:`;

      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('REACT_APP_GROQ_API_KEY missing in .env file');
      }

      const userContent = currentImage
        ? [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: currentImage } }
          ]
        : prompt;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentImage ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: 'You are MediGuard AI, a helpful medical assistant.' },
            { role: 'user', content: userContent }
          ],
          max_tokens: 1024,
          temperature: 0.7,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }
      if (!data.choices || !data.choices[0]) {
        throw new Error('No response from Groq API');
      }

      const aiMsg = {
        id: Date.now() + 1, role: 'assistant',
        text: data.choices[0].message.content,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      saveMessages(finalMessages);

    } catch (error) {
      console.error('Chat error:', error);
      const errMsg = {
        id: Date.now() + 1, role: 'assistant',
        text: `❌ Error: ${error.message}`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      const finalMessages = [...updatedMessages, errMsg];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    }
    setLoading(false);
  };

  const clearChat = () => {
    const welcome = {
      id: Date.now(), role: 'assistant',
      text: t('chatWelcome'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcome]);
    localStorage.removeItem(chatKey);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const profile = getProfile();

  const statCards = [
    { icon: ClipboardList, label: t('totalChecks'), value: stats.total, color: '#1a5f7a', bg: '#eaf4f8' },
    { icon: CheckCircle2, label: t('lowRisk'), value: stats.low, color: '#0f9d6e', bg: '#e6f7f0' },
    { icon: AlertTriangle, label: t('mediumRisk'), value: stats.medium, color: '#d97706', bg: '#fffbeb' },
    { icon: AlertOctagon, label: t('highRisk'), value: stats.high, color: '#dc2626', bg: '#fef2f2' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', overflow: 'hidden' }}>
      <Navbar navigate={navigate} currentPage="dashboard" onLogout={onLogout} user={user} />

      <div style={{ width: '100%', padding: '24px 32px', boxSizing: 'border-box' }}>

        {/* Welcome Banner */}
        <div className="fade-in" style={{
          background: 'linear-gradient(120deg, #0f9d6e, #0a7a54)',
          borderRadius: '18px', padding: '28px 36px',
          marginBottom: '24px', position: 'relative', overflow: 'hidden',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-40px', width: '220px', height: '220px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <div>
            <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>
              {t('welcome')}, {user?.name} 👋
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '8px', fontSize: '1.05rem' }}>
              {t('welcomeMsg')}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              marginTop: '12px', padding: '6px 14px',
              background: 'rgba(255,255,255,0.15)', borderRadius: '20px'
            }}>
              <Calendar size={15} color="white" />
              <span style={{ color: 'white', fontSize: '0.88rem', fontWeight: '600' }}>
                {new Date().toLocaleDateString(
                  lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN',
                  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </span>
            </div>
          </div>
          <button onClick={() => navigate('symptoms')} style={{
            padding: '14px 26px', background: 'white', color: '#0f9d6e',
            border: 'none', borderRadius: '12px', fontWeight: '700',
            cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', gap: '8px',
            whiteSpace: 'nowrap', position: 'relative', flexShrink: 0
          }}>
            <Stethoscope size={18} />
            {t('checkSymptoms')}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card fade-in" style={{ padding: '22px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>{stat.value}</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '4px' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

          {/* Chatbot */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: '18px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            height: '660px'
          }}>

            {/* Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-card)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #bbf0da', background: '#e6f7f0', flexShrink: 0 }}>
                  <DoctorSVG size={56} />
                </div>
                <div>
                  <p style={{ fontWeight: '800', color: 'var(--text-dark)', fontSize: '1.15rem' }}>MediGuard AI</p>
                  <p style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    Available 24/7
                  </p>
                </div>
              </div>
              <button onClick={clearChat} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-light)', padding: '9px 16px', borderRadius: '10px',
                cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)'
              }}>
                <Trash2 size={15} /> {t('chatClear')}
              </button>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} style={{
              flex: 1, overflowY: 'auto', overflowX: 'hidden',
              padding: '22px', display: 'flex', flexDirection: 'column',
              gap: '18px', scrollBehavior: 'smooth'
            }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex', gap: '12px',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    overflow: 'hidden', border: `2px solid ${msg.role === 'user' ? '#bbf0da' : '#bfdbfe'}`,
                    background: msg.role === 'user' ? '#e6f7f0' : '#e8f4fd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {msg.role === 'user'
                      ? (profile.photo
                        ? <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <User size={22} color="var(--primary)" />)
                      : <DoctorSVG size={44} />
                    }
                  </div>

                  <div style={{ maxWidth: '72%' }}>
                    {msg.image && (
                      <img src={msg.image} alt="uploaded" style={{ width: '100%', maxWidth: '240px', borderRadius: '12px', display: 'block', objectFit: 'cover', border: '1px solid var(--border)', marginBottom: '8px' }} />
                    )}
                    <div style={{
                      padding: '14px 18px',
                      background: msg.role === 'user' ? 'var(--primary)' : msg.isError ? '#fef2f2' : '#dbeafe',
                      color: msg.role === 'user' ? 'white' : msg.isError ? '#dc2626' : '#1e3a5f',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      fontSize: '1.02rem', lineHeight: '1.75',
                      border: msg.role === 'user' ? 'none' : `1px solid ${msg.isError ? '#fecaca' : '#93c5fd'}`,
                      whiteSpace: 'pre-wrap', boxShadow: 'var(--shadow-sm)'
                    }}>
                      {msg.text}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '5px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #bfdbfe', flexShrink: 0 }}>
                    <DoctorSVG size={44} />
                  </div>
                  <div style={{ padding: '14px 18px', background: '#dbeafe', borderRadius: '20px 20px 20px 4px', border: '1px solid #93c5fd', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Loader2 size={18} color="#1e3a5f" />
                    <span style={{ color: '#1e3a5f', fontSize: '1rem' }}>{t('chatThinking')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
              {imagePreview && (
                <div style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="preview" style={{ height: '75px', borderRadius: '10px', border: '2px solid var(--border)', objectFit: 'cover' }} />
                  <button onClick={removeImage} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#dc2626', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={13} color="white" />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label htmlFor="chat-image-upload" style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: selectedImage ? 'var(--primary)' : 'var(--primary-light)',
                  border: '1.5px solid #bbf0da',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                }}>
                  <Camera size={22} color={selectedImage ? 'white' : 'var(--primary)'} />
                </label>
                <input ref={fileInputRef} id="chat-image-upload" type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedImage ? 'Image selected! Add message or send...' : t('chatPlaceholder')}
                  disabled={loading}
                  rows={1}
                  style={{
                    flex: 1, padding: '13px 18px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px', fontSize: '1.02rem',
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                    resize: 'none', color: 'var(--text-dark)',
                    lineHeight: '1.5', background: 'var(--bg-card)'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || (!input.trim() && !selectedImage)}
                  style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: (input.trim() || selectedImage) && !loading ? 'var(--primary)' : '#e2e8f0',
                    border: 'none',
                    cursor: (input.trim() || selectedImage) && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', flexShrink: 0
                  }}
                >
                  <Send size={20} color={(input.trim() || selectedImage) && !loading ? 'white' : '#94a3b8'} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '22px' }}>
              <p style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '1rem', marginBottom: '16px' }}>
                Quick Actions
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: Stethoscope, label: t('symptomChecker'), page: 'symptoms', color: '#0f9d6e', bg: '#e6f7f0' },
                  { icon: ClipboardList, label: t('records'), page: 'records', color: '#1a5f7a', bg: '#eaf4f8' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button key={i} onClick={() => navigate(item.page)} style={{
                      width: '100%', padding: '15px 18px',
                      background: item.bg, border: 'none', borderRadius: '12px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
                    }}>
                      <Icon size={20} color={item.color} />
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: item.color }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: '22px', borderColor: '#fecaca', background: '#fef2f2' }}>
              <p style={{ fontWeight: '700', color: '#dc2626', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} /> {t('emergencyNumbers')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: t('ambulance'), number: '108' },
                  { name: t('police'), number: '100' },
                  { name: t('fire'), number: '101' },
                  { name: t('nationalEmergency'), number: '112' },
                ].map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'white', borderRadius: '10px', border: '1px solid #fecaca' }}>
                    <p style={{ color: 'var(--text-medium)', fontSize: '0.92rem' }}>{e.name}</p>
                    <p style={{ color: '#dc2626', fontWeight: '800', fontSize: '1.2rem' }}>{e.number}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;