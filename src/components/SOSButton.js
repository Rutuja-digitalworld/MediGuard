import React, { useState } from 'react';
import { Edit2, Copy, RotateCcw } from 'lucide-react';

function SOSButton({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const profile = JSON.parse(localStorage.getItem(`profile_${user?.email}`) || '{}');

  const defaultMessage = `🚨 EMERGENCY ALERT! 🚨
Mujhe turant madad chahiye!

👤 Naam: ${profile?.name || 'Patient'}
📞 Phone: ${profile?.emergencyPhone || 'N/A'}
🩺 Blood Group: ${profile?.bloodGroup || 'Unknown'}
📍 Location: Meri location share kar rahe hain

Kripaya mujhe madad karo! Yeh medical emergency hai.`;

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        alert('Location access nahi mila!');
      }
    );
  };

  const shareLocationWhatsApp = () => {
    if (!location) {
      getLocation();
      return;
    }
    const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
    // Ab (SAHI)
const messageToSend = customMessage.trim() ? customMessage : defaultMessage;
    const finalMessage = `${messageToSend}\n\n📍 ${mapsLink}`;
    const phone = profile?.emergencyPhone?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(finalMessage)}`, '_blank');
  };

  const callNumber = (number) => {
    window.location.href = `tel:${number}`;
  };

  const copyToClipboard = () => {
    const messageToCopy = isEditingMessage && customMessage ? customMessage : defaultMessage;
    navigator.clipboard.writeText(messageToCopy);
    alert('Message copied! 📋');
  };

  const resetToDefault = () => {
    setCustomMessage('');
    setIsEditingMessage(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d63031, #ff4757)',
          border: 'none',
          color: 'white',
          fontSize: '1.8rem',
          cursor: 'pointer',
          boxShadow: '0 6px 25px rgba(214,48,49,0.5)',
          zIndex: 9999,
          animation: 'sosPulse 2s infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '800'
        }}
      >
        🆘
      </button>

      <style>{`
        @keyframes sosPulse {
          0% { box-shadow: 0 0 0 0 rgba(214,48,49,0.6); }
          70% { box-shadow: 0 0 0 20px rgba(214,48,49,0); }
          100% { box-shadow: 0 0 0 0 rgba(214,48,49,0); }
        }
      `}</style>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000, padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '2px solid #d63031',
              borderRadius: '20px',
              padding: '30px',
              width: '500px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '3rem' }}>🚨</div>
              <h2 style={{ color: '#ff7675', fontSize: '1.6rem', fontWeight: '800' }}>
                Emergency SOS
              </h2>
              <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginTop: '5px' }}>
                Turant madad ke liye neeche se option chuno
              </p>
            </div>

            {/* National Emergency Numbers */}
            <h3 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '12px' }}>
              📞 National Emergency Numbers
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { name: 'Ambulance', number: '108' },
                { name: 'Police', number: '100' },
                { name: 'Fire', number: '101' },
                { name: 'Emergency', number: '112' },
              ].map(e => (
                <button
                  key={e.number}
                  onClick={() => callNumber(e.number)}
                  style={{
                    background: 'rgba(214,48,49,0.15)',
                    border: '1px solid rgba(214,48,49,0.4)',
                    borderRadius: '12px', padding: '14px',
                    cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  <p style={{ color: '#a0a0a0', fontSize: '0.75rem' }}>{e.name}</p>
                  <p style={{ color: '#ff7675', fontWeight: '800', fontSize: '1.4rem' }}>
                    📞 {e.number}
                  </p>
                </button>
              ))}
            </div>

            {/* Personal Emergency Contact */}
            {profile?.emergencyContact && (
              <>
                <h3 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '12px' }}>
                  👤 Apka Emergency Contact
                </h3>
                <div style={{
                  background: 'rgba(0,184,148,0.1)',
                  border: '1px solid rgba(0,184,148,0.3)',
                  borderRadius: '12px', padding: '15px', marginBottom: '15px'
                }}>
                  <p style={{ color: 'white', fontWeight: '600' }}>{profile.emergencyContact}</p>
                  <p style={{ color: '#00b894', fontSize: '0.9rem', marginTop: '3px' }}>
                    📞 {profile.emergencyPhone}
                  </p>

                  {/* Message Section */}
                  <div style={{ marginTop: '15px', borderTop: '1px solid rgba(0,184,148,0.3)', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <p style={{ color: '#00b894', fontWeight: '600', fontSize: '0.9rem' }}>
                        💬 Emergency Message
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setIsEditingMessage(!isEditingMessage);
                            if (!isEditingMessage) setCustomMessage('');
                          }}
                          style={{
                            background: 'rgba(0,184,148,0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            color: '#00b894',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          <Edit2 size={14} /> {isEditingMessage ? 'Done' : 'Edit'}
                        </button>
                        {(isEditingMessage && customMessage) && (
                          <button
                            onClick={resetToDefault}
                            style={{
                              background: 'rgba(253,203,110,0.2)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              color: '#fdcb6e',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontFamily: 'Poppins, sans-serif'
                            }}
                          >
                            <RotateCcw size={14} /> Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditingMessage ? (
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Apna custom message likho..."
                        style={{
                          width: '100%',
                          height: '120px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(0,184,148,0.5)',
                          borderRadius: '8px',
                          padding: '10px',
                          color: '#ffffff',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.85rem',
                          lineHeight: '1.5',
                          resize: 'none',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(0,184,148,0.2)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }}>
                        {customMessage || defaultMessage}
                      </div>
                    )}

                    <button
                      onClick={copyToClipboard}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#a0a0a0',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      <Copy size={14} /> Copy Message
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button
                      onClick={() => callNumber(profile.emergencyPhone)}
                      style={{
                        flex: 1, padding: '10px', background: '#00b894',
                        border: 'none', borderRadius: '10px', color: 'white',
                        fontWeight: '700', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      📞 Call Karo
                    </button>
                    <button
                      onClick={shareLocationWhatsApp}
                      style={{
                        flex: 1, padding: '10px', background: '#25D366',
                        border: 'none', borderRadius: '10px', color: 'white',
                        fontWeight: '700', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      {locLoading ? '📍...' : '💬 Send on WhatsApp'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {!profile?.emergencyContact && (
              <div style={{
                background: 'rgba(253,203,110,0.1)',
                border: '1px solid rgba(253,203,110,0.3)',
                borderRadius: '12px', padding: '15px', marginBottom: '15px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#fdcb6e', fontSize: '0.85rem' }}>
                  ⚠️ Apna emergency contact Profile mein add karo!
                </p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                color: '#a0a0a0', borderRadius: '50px', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif', fontWeight: '600'
              }}
            >
              Band Karo
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SOSButton;
