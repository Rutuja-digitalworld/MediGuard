import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation2, RefreshCw, Phone, Map as MapIcon, AlertCircle, Building2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import Navbar from '../components/Navbar';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="#0f9d6e"/>
      <circle cx="16" cy="16" r="10" fill="white"/>
      <rect x="13" y="9" width="6" height="14" fill="#0f9d6e"/>
      <rect x="9" y="13" width="14" height="6" fill="#0f9d6e"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#1a5f7a" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function Hospitals({ navigate, user }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const { t } = useLanguage();

  const getDefaultHospitals = () => [
    { id: 1, name: 'KEM Hospital', address: 'Parel, Mumbai', phone: '022-2410-7000', emergency: true, lat: 19.0007, lon: 72.8404 },
    { id: 2, name: 'Lilavati Hospital', address: 'Bandra West, Mumbai', phone: '022-2675-1000', emergency: true, lat: 19.0544, lon: 72.8266 },
    { id: 3, name: 'Nanavati Hospital', address: 'Vile Parle, Mumbai', phone: '022-2626-7500', emergency: true, lat: 19.0990, lon: 72.8394 },
    { id: 4, name: 'Hinduja Hospital', address: 'Mahim, Mumbai', phone: '022-2445-2222', emergency: false, lat: 19.0368, lon: 72.8394 },
    { id: 5, name: 'Breach Candy Hospital', address: 'Breach Candy, Mumbai', phone: '022-2367-1888', emergency: true, lat: 18.9719, lon: 72.8085 },
  ];

  const findHospitals = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation support nahi hai!');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLocation({ lat: latitude, lon: longitude });

        const url = 'https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="hospital"](around:5000,' + latitude + ',' + longitude + ');out%2015;';

        fetch(url)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            const results = data.elements
              .filter(function (el) { return el.lat && el.lon; })
              .map(function (el, i) {
                return {
                  id: i,
                  name: el.tags && el.tags.name ? el.tags.name : 'Hospital',
                  address: el.tags && el.tags['addr:street'] ? el.tags['addr:street'] : 'Address unavailable',
                  phone: el.tags && el.tags.phone ? el.tags.phone : 'N/A',
                  emergency: el.tags && el.tags.emergency === 'yes',
                  lat: el.lat,
                  lon: el.lon,
                };
              });
            setHospitals(results.length > 0 ? results : getDefaultHospitals());
            setSearched(true);
            setLoading(false);
          })
          .catch(function () {
            setHospitals(getDefaultHospitals());
            setSearched(true);
            setLoading(false);
          });
      },
      function () {
        setError(t('locationDenied'));
        setLoading(false);
      }
    );
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lat2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Navbar navigate={navigate} currentPage="hospitals" user={user} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', background: 'var(--primary-light)',
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px'
          }}>
            <Building2 size={26} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-dark)' }}>
            {t('hospitalsTitle')}
          </h1>
          <p style={{ color: 'var(--text-light)', marginTop: '6px', fontSize: '0.92rem' }}>{t('hospitalsSubtitle')}</p>
        </div>

        {!searched && (
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <button className="btn-primary" onClick={findHospitals} disabled={loading}
              style={{ width: 'auto', padding: '14px 32px', fontSize: '0.95rem' }}>
              <Navigation2 size={18} />
              {loading ? t('detecting') : t('findHospitals')}
            </button>
            {error && (
              <div className="alert alert-error" style={{ maxWidth: '400px', margin: '15px auto 0' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-light)', marginTop: '10px' }}>{t('searching')}</p>
          </div>
        )}

        {searched && !loading && (
          <div>
            <div style={{
              background: 'var(--primary-light)', border: '1px solid #bbf0da',
              borderRadius: '10px', padding: '12px 18px', marginBottom: '18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <p style={{ color: 'var(--primary-dark)', fontSize: '0.88rem', fontWeight: '600' }}>
                {hospitals.length} {t('hospitalsFound')}
              </p>
              <button onClick={findHospitals} style={{
                background: 'white', border: '1px solid #bbf0da',
                color: 'var(--primary-dark)', padding: '7px 14px', borderRadius: '20px',
                cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600'
              }}>
                <RefreshCw size={14} /> {t('refresh')}
              </button>
            </div>

            {location && (
              <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '18px', border: '1px solid var(--border)', height: '380px' }}>
                <MapContainer center={[location.lat, location.lon]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[location.lat, location.lon]} icon={userIcon}>
                    <Popup>Aap yahan hain</Popup>
                  </Marker>
                  {hospitals.map((h, i) => (
                    h.lat && h.lon && (
                      <Marker key={i} position={[h.lat, h.lon]} icon={hospitalIcon}>
                        <Popup>
                          <strong>{h.name}</strong><br />
                          {h.address}<br />
                          {h.phone !== 'N/A' && <>{h.phone}</>}
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {hospitals.map((h, i) => (
                <div key={i} className="fade-in card" style={{
                  borderLeft: `3px solid ${h.emergency ? '#dc2626' : '#0f9d6e'}`,
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: '700' }}>{h.name}</h3>
                    {h.emergency && (
                      <span style={{
                        background: '#fef2f2', color: '#dc2626',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700'
                      }}>24/7</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginBottom: '6px' }}>{h.address}</p>
                  {h.phone !== 'N/A' && (
                    <p style={{ color: 'var(--primary)', fontSize: '0.82rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={13} /> {h.phone}
                    </p>
                  )}
                  {location && h.lat && (
                    <p style={{ color: 'var(--warning)', fontSize: '0.78rem' }}>
                      {getDistance(location.lat, location.lon, h.lat, h.lon)} {t('away')}
                    </p>
                  )}
                  <a href={'https://www.google.com/maps/search/' + encodeURIComponent(h.name)}
                    target="_blank" rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px',
                      padding: '6px 14px', background: 'var(--primary-light)',
                      color: 'var(--primary-dark)', borderRadius: '20px', fontSize: '0.78rem',
                      textDecoration: 'none', fontWeight: '600'
                    }}>
                    <MapIcon size={13} /> {t('viewOnMaps')}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: '22px', borderColor: '#fecaca', background: '#fef2f2', textAlign: 'center' }}>
          <h3 style={{ color: '#dc2626', marginBottom: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Phone size={17} /> {t('emergencyNumbers')}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {[['Ambulance', '108'], ['Police', '100'], ['Fire', '101'], ['Emergency', '112']].map(([name, num]) => (
              <div key={name} style={{ background: 'white', padding: '10px 18px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{name}</p>
                <p style={{ color: '#dc2626', fontWeight: '800', fontSize: '1.2rem' }}>{num}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hospitals;