import React, { useState, useEffect } from 'react';

export const DebugPanel: React.FC = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 500);
    window.addEventListener('hashchange', () => forceUpdate(n => n + 1));
    return () => clearInterval(interval);
  }, []);

  const hash = window.location.hash;
  const pathname = window.location.pathname;
  const search = window.location.search;
  const accessToken = localStorage.getItem('dn_access_token');
  const refreshToken = localStorage.getItem('dn_refresh_token');
  const hasAccess = accessToken && accessToken.length > 20 && accessToken !== 'null' && accessToken !== 'undefined' && accessToken !== '';
  const hasRefresh = refreshToken && refreshToken.length > 20 && refreshToken !== 'null' && refreshToken !== 'undefined' && refreshToken !== '';

  const row = (label: string, value: string, good?: boolean) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
      <span style={{ color: '#888', minWidth: 110, fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', paddingTop: 1 }}>{label}</span>
      <span style={{ color: good === true ? '#4ade80' : good === false ? '#f87171' : '#e2e8f0', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{value || '(empty)'}</span>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 99999,
      background: 'rgba(10,10,10,0.92)', border: '1px solid #333',
      borderRadius: 10, padding: '12px 14px', width: 340,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
    }}>
      <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#facc15', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
        🛠 DEBUG PANEL
      </div>
      {row('pathname', pathname)}
      {row('hash', hash || '(no hash)')}
      {row('search', search || '(none)')}
      {row('accessToken', hasAccess ? `✓ ${accessToken!.slice(0, 20)}...` : '✗ MISSING', !!hasAccess)}
      {row('refreshToken', hasRefresh ? `✓ ${refreshToken!.slice(0, 20)}...` : '✗ MISSING', !!hasRefresh)}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #333' }}>
        <div style={{ fontSize: 10, color: '#888', fontFamily: 'monospace', marginBottom: 4 }}>FULL URL</div>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-all' }}>
          {window.location.href}
        </div>
      </div>
    </div>
  );
};
