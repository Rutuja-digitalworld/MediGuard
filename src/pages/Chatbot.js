import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User, Loader2, Image as ImageIcon, Camera, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Navbar from '../components/Navbar';

function Chatbot({ user, navigate }) {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const messagesEndRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatKey = `chat_history_${user?.email}`;

  const langNames = {
    en: 'English',
    hi: 'Hindi (Devanagari script)',
    mr: 'Marathi (Devanagari script)',
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(chatKey) || '[]');
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      const welcome = {
        id: Date.now(),
        role: 'assistant',
        text: t('chatWelcome'),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcome]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (msgs) => {
    // Don't persist base64 images to localStorage long-term (size); keep text only
    const msgsToSave = msgs.map(m => ({ ...m, image: m.image ? '[image]' : null }));
    localStorage.setItem(chatKey, JSON.stringify(msgsToSave));
  };

  const getProfile = () => {
    return JSON.parse(localStorage.getItem(`profile_${user?.email}`) || '{}');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 640;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        setPendingImage({ dataUrl: compressed, mimeType: 'image/jpeg' });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removePendingImage = () => setPendingImage(null);

  const sendMessage = async () => {
    if ((!input.trim() && !pendingImage) || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: input.trim(),
      image: pendingImage ? pendingImage.dataUrl : null,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const currentInput = input.trim();
    const currentImage = pendingImage; // capture before clearing
    setInput('');
    setPendingImage(null);
    setLoading(true);

    try {
      const profile = getProfile();

      const conversationHistory = updatedMessages
        .slice(-10)
        .map(m => `${m.role === 'user' ? 'Patient' : 'Doctor'}: ${m.text || (m.image ? '[sent a photo]' : '')}`)
        .join('\n');

      const imageInstruction = currentImage
        ? `\n\nThe patient has attached a photo (e.g. of a cut, wound, rash, or skin condition). Look carefully at the image and:
- Describe what you observe in plain, reassuring language
- Give general first-aid / care guidance appropriate to what's visible
- Flag any signs needing urgent in-person medical attention (heavy bleeding, deep wound, infection signs, etc.)
- Never give a definitive diagnosis from a photo alone — recommend an in-person doctor visit for anything beyond minor care`
        : '';

      const prompt = `You are a professional AI medical assistant called MediGuard AI. You are helpful, empathetic, and medically knowledgeable.

Patient Profile:
- Name: ${profile.name || user?.name || 'Patient'}
- Age: ${profile.age || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}
- Blood Group: ${profile.bloodGroup || 'Unknown'}
- Existing Conditions: ${[
  profile.diabetes && 'Diabetes',
  profile.heartDisease && 'Heart Disease',
  profile.asthma && 'Asthma',
  profile.bp && 'Blood Pressure',
  profile.thyroid && 'Thyroid',
  profile.kidney && 'Kidney Disease'
].filter(Boolean).join(', ') || 'None'}
- Allergies: ${profile.allergies || 'None known'}

IMPORTANT RULES:
1. Always respond in ${langNames[lang]} language only
2. Be empathetic, professional, and clear
3. For serious symptoms, always recommend seeing a doctor immediately
4. Never prescribe specific medications or dosages
5. Keep responses concise but complete (3-5 sentences max)
6. Use patient's profile context when relevant${imageInstruction}

Recent Conversation:
${conversationHistory}

Patient's latest message: "${currentInput || '(see attached photo)'}"

Respond as a helpful medical assistant in ${langNames[lang]}:`;

      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('🔑 REACT_APP_GROQ_API_KEY missing in .env file');
      }

      // Vision-capable model is required when an image is attached.
      // Text-only models (like gpt-oss-120b) silently ignore images.
      const model = currentImage
        ? 'meta-llama/llama-4-scout-17b-16e-instruct'
        : 'openai/gpt-oss-120b';

      const userContent = currentImage
        ? [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: currentImage.dataUrl } }
          ]
        : prompt;

      console.log('📡 Calling Groq API with model:', model);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful medical assistant.' },
            { role: 'user', content: userContent }
          ],
          max_tokens: 1024,
          temperature: 0.7,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Groq API Error:', data);
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      if (!data.choices || !data.choices[0]) {
        throw new Error('No response from Groq API');
      }

      const aiText = data.choices[0].message.content;

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: aiText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      saveMessages(finalMessages);

    } catch (error) {
      console.error('❌ Chat error:', error);
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `❌ Error: ${error.message}. Please try again.`,
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
      id: Date.now(),
      role: 'assistant',
      text: t('chatWelcome'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcome]);
    localStorage.removeItem(chatKey);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      <Navbar navigate={navigate} currentPage="chatbot" user={user} />

      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '24px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>

        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '52px', height: '52px', background: 'var(--primary-light)',
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Bot size={26} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)' }}>{t('chatbot')}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: '4px' }}>{t('chatbotSubtitle')}</p>
        </div>

        <div style={{
          flex: 1, background: 'white', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          minHeight: '500px', maxHeight: '600px'
        }}>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex', gap: '10px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--primary-light)' : '#e8f4fd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${msg.role === 'user' ? '#bbf0da' : '#bfdbfe'}`
                }}>
                  {msg.role === 'user'
                    ? <User size={18} color="var(--primary)" />
                    : <Bot size={18} color="#1a5f7a" />
                  }
                </div>

                <div style={{ maxWidth: '72%' }}>
                  {msg.image && msg.image !== '[image]' && (
                    <img
                      src={msg.image}
                      alt="attached"
                      style={{ width: '100%', maxWidth: '240px', borderRadius: '12px', marginBottom: '8px', display: 'block', border: '1px solid var(--border)' }}
                    />
                  )}
                  <div style={{
                    padding: '12px 16px',
                    background: msg.role === 'user' ? 'var(--primary)' : msg.isError ? '#fef2f2' : '#eaf4ff',
                    color: msg.role === 'user' ? 'white' : msg.isError ? '#dc2626' : '#1e3a5f',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: '0.9rem', lineHeight: '1.6',
                    border: msg.role === 'user' ? 'none' : `1px solid ${msg.isError ? '#fecaca' : '#bfdbfe'}`,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                  <p style={{
                    fontSize: '0.72rem', color: 'var(--text-light)',
                    marginTop: '4px',
                    textAlign: msg.role === 'user' ? 'right' : 'left'
                  }}>{msg.time}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #bfdbfe', flexShrink: 0
                }}>
                  <Bot size={18} color="#1a5f7a" />
                </div>
                <div style={{
                  padding: '12px 16px', background: '#eaf4ff',
                  borderRadius: '18px 18px 18px 4px', border: '1px solid #bfdbfe',
                  display: 'flex', gap: '6px', alignItems: 'center'
                }}>
                  <Loader2 size={16} color="#1e3a5f" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ color: '#1e3a5f', fontSize: '0.88rem' }}>{t('chatThinking')}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {pendingImage && (
            <div style={{
              padding: '10px 20px', borderTop: '1px solid var(--border)',
              background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={pendingImage.dataUrl}
                  alt="preview"
                  style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid var(--border)' }}
                />
                <button
                  onClick={removePendingImage}
                  style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#dc2626', border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0
                  }}
                >
                  <X size={11} color="white" />
                </button>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-medium)' }}>
                Photo ready — will use vision model to analyze
              </span>
            </div>
          )}

          <div style={{
            padding: '16px 20px', borderTop: pendingImage ? 'none' : '1px solid var(--border)',
            background: 'white', display: 'flex', gap: '8px', alignItems: 'flex-end'
          }}>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            <button
              onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
              style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#f1f5f9', border: '1.5px solid var(--border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s'
              }}
            >
              <ImageIcon size={19} color="var(--text-medium)" />
            </button>

            <button
              onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
              style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#f1f5f9', border: '1.5px solid var(--border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s'
              }}
            >
              <Camera size={19} color="var(--text-medium)" />
            </button>

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatPlaceholder')}
              disabled={loading}
              rows={1}
              style={{
                flex: 1, padding: '12px 16px', border: '1.5px solid var(--border)',
                borderRadius: '12px', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif',
                outline: 'none', resize: 'none', maxHeight: '120px', overflowY: 'auto',
                color: 'var(--text-dark)', lineHeight: '1.5'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !pendingImage)}
              style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: (input.trim() || pendingImage) && !loading ? 'var(--primary)' : '#e2e8f0',
                border: 'none', cursor: (input.trim() || pendingImage) && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0
              }}
            >
              <Send size={18} color={(input.trim() || pendingImage) && !loading ? 'white' : '#94a3b8'} />
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
          <button onClick={clearChat} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-light)', padding: '8px 18px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Trash2 size={14} /> {t('chatClear')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;