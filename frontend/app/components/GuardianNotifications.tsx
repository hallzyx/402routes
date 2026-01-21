'use client';

import { useEffect, useState } from 'react';

interface Alert {
  id: number;
  alert_type: string;
  severity: string;
  message: string;
  recommendation?: string;
  created_at: string;
  is_read: boolean;
}

export function GuardianNotifications() {
  const [address, setAddress] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    setAddress(walletAddress);
    
    if (walletAddress) {
      fetchAlerts(walletAddress);
      // Poll for new alerts every 30 seconds
      const interval = setInterval(() => fetchAlerts(walletAddress), 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchAlerts = async (addr: string) => {
    try {
      const response = await fetch(`/api/guardian/alerts/${addr}?unread_only=true&limit=3`);
      const data = await response.json();
      
      if (data.ok) {
        setAlerts(data.data.filter((a: Alert) => !dismissed.has(a.id)));
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const dismissAlert = async (alertId: number) => {
    try {
      await fetch(`/api/guardian/alerts/${alertId}/mark-read`, {
        method: 'POST',
      });
      setDismissed(prev => new Set(prev).add(alertId));
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  if (!address || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            bg-white p-4 rounded-lg shadow-lg border-l-4 animate-slide-in-right
            ${alert.severity === 'critical' ? 'border-red-500' :
              alert.severity === 'warning' ? 'border-yellow-500' :
              'border-blue-500'}
          `}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {alert.alert_type === 'unusual_pattern' ? (
                <span className={`text-2xl ${
                  alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`}>⚠️</span>
              ) : alert.alert_type === 'optimization' ? (
                <span className="text-2xl text-green-600">📉</span>
              ) : (
                <span className="text-2xl text-blue-600">🛡️</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1">
                AI Budget Guardian
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                {alert.message}
              </p>
              
              {alert.recommendation && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  💡 {alert.recommendation}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => window.location.href = '/guardian'}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  Ver Dashboard
                </button>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <button
              onClick={() => dismissAlert(alert.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

