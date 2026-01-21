'use client';

import { useEffect, useState } from 'react';

interface BudgetStatus {
  user_address: string;
  monthly_limit: number;
  current_spend: number;
  remaining_budget: number;
  percentage_used: number;
  days_remaining: number;
  is_paused: boolean;
  recent_alerts: any[];
  optimizations_available: any[];
}

interface Props {
  walletAddress: string;
}

export function BudgetGuardianDashboard({ walletAddress }: Props) {
  const [status, setStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchBudgetStatus(walletAddress);
    }
  }, [walletAddress]);

  const fetchBudgetStatus = async (addr: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guardian/budget/status/${addr}`);
      const data = await response.json();
      
      if (data.ok) {
        setStatus(data.data);
      } else {
        setError(data.error || 'Failed to load budget status');
      }
    } catch (err) {
      setError('Failed to connect to Guardian service');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!walletAddress) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500">
            Conecta tu wallet para ver el AI Budget Guardian
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={() => walletAddress && fetchBudgetStatus(walletAddress)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">🤖 Activa tu AI Budget Guardian</h2>
          <p className="text-gray-600 mb-4">
            Configura un presupuesto mensual y deja que la IA monitoree tus gastos
          </p>
          <a
            href="/guardian/setup"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Configurar Presupuesto
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🛡️ AI Budget Guardian
          </h1>
          <p className="text-gray-500 mt-1">
            Protegiendo tu presupuesto de forma inteligente
          </p>
        </div>
        <button
          onClick={() => walletAddress && fetchBudgetStatus(walletAddress)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Actualizar
        </button>
      </div>

      {/* Main Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Estado del Presupuesto</h2>
            <p className="text-gray-500">Mes actual</p>
          </div>
          {status.percentage_used >= 95 ? (
            <span className="text-red-500 text-2xl">⚠️</span>
          ) : status.percentage_used >= 80 ? (
            <span className="text-yellow-500 text-2xl">⚠️</span>
          ) : (
            <span className="text-green-500 text-2xl">✓</span>
          )}
        </div>

        {/* Budget Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              ${status.current_spend.toFixed(2)} de ${status.monthly_limit.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {status.percentage_used.toFixed(1)}% usado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor(status.percentage_used)}`}
              style={{ width: `${Math.min(status.percentage_used, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💵</span>
              <span className="text-sm text-gray-500">Restante</span>
            </div>
            <p className="text-2xl font-bold">
              ${status.remaining_budget.toFixed(2)}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <span className="text-sm text-gray-500">Días restantes</span>
            </div>
            <p className="text-2xl font-bold">
              {status.days_remaining}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm text-gray-500">Optimizaciones</span>
            </div>
            <p className="text-2xl font-bold">
              {status.optimizations_available.length}
            </p>
          </div>
        </div>

        {/* Pause Warning */}
        {status.is_paused && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>⚠️ PAUSADO:</strong> Has alcanzado el 100% de tu presupuesto. 
              Las llamadas a APIs están bloqueadas temporalmente.
            </p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {status.recent_alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Alertas Recientes</h2>
          <p className="text-sm text-gray-500 mb-4">
            {status.recent_alerts.filter(a => !a.is_read).length} sin leer
          </p>
          <div className="space-y-3">
            {status.recent_alerts.slice(0, 5).map((alert: any, index: number) => (
              <div 
                key={index}
                className={`border-l-4 p-3 rounded ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <p className="font-medium">{alert.message}</p>
                {alert.recommendation && (
                  <p className="text-sm text-gray-600 mt-1">
                    💡 {alert.recommendation}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.created_at).toLocaleString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimizations */}
      {status.optimizations_available.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">💡 Optimizaciones Sugeridas</h2>
          <p className="text-sm text-gray-500 mb-4">
            La IA detectó oportunidades de ahorro
          </p>
          <div className="space-y-4">
            {status.optimizations_available.map((opt: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium mb-2">📉 {opt.description}</p>
                    <div className="text-sm text-gray-600">
                      <p>De: <strong>{opt.current_api}</strong></p>
                      {opt.suggested_api && (
                        <p>A: <strong>{opt.suggested_api}</strong></p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-green-600 mt-2">
                      Ahorro estimado: ${opt.estimated_savings.toFixed(2)}/mes
                    </p>
                  </div>
                  <button className="ml-4 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Aplicar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          Ver Reporte Mensual
        </button>
        <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          Análisis Detallado
        </button>
        <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          Configuración
        </button>
      </div>
    </div>
  );
}
