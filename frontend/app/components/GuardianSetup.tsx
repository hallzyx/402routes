'use client';

import { useState, useEffect } from 'react';

export default function GuardianSetup() {
  const [address, setAddress] = useState<string | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState('100');
  const [warningThreshold, setWarningThreshold] = useState('80');
  const [pauseThreshold, setPauseThreshold] = useState('100');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    setAddress(walletAddress);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Conecta tu wallet primero');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/guardian/budget/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_address: address,
          monthly_limit: parseFloat(monthlyLimit),
          warning_threshold: parseFloat(warningThreshold) / 100,
          pause_threshold: parseFloat(pauseThreshold) / 100,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/guardian';
        }, 2000);
      } else {
        setError(data.error || 'Error al configurar el presupuesto');
      }
    } catch (err) {
      setError('Error de conexión con el Guardian service');
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500">
            Conecta tu wallet para configurar el AI Budget Guardian
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🛡️</span>
          <h1 className="text-2xl font-bold">Activa tu AI Budget Guardian</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Configura tu presupuesto mensual y deja que la IA proteja tus gastos automáticamente
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-500 rounded-lg p-4">
            <p className="text-green-800">
              ✅ ¡Configuración exitosa! Redirigiendo al dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monthly Limit */}
            <div>
              <label className="flex items-center gap-2 font-medium mb-2">
                <span className="text-xl">💵</span>
                Presupuesto Mensual (USD)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="100.00"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Cantidad máxima que deseas gastar en APIs por mes
              </p>
            </div>

            {/* Warning Threshold */}
            <div>
              <label className="flex items-center gap-2 font-medium mb-2">
                <span className="text-xl">🔔</span>
                Alerta de Advertencia (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(e.target.value)}
                placeholder="80"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Te notificaremos cuando alcances este % de tu presupuesto
              </p>
            </div>

            {/* Pause Threshold */}
            <div>
              <label className="flex items-center gap-2 font-medium mb-2">
                <span className="text-xl">⏸️</span>
                Pausa Automática (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={pauseThreshold}
                onChange={(e) => setPauseThreshold(e.target.value)}
                placeholder="100"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Las llamadas a APIs se pausarán automáticamente al alcanzar este %
              </p>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Vista previa de alertas:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⚠️</span>
                  <span>
                    Alerta al {warningThreshold}% (${(parseFloat(monthlyLimit) * parseFloat(warningThreshold) / 100).toFixed(2)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⏸️</span>
                  <span>
                    Pausa al {pauseThreshold}% (${(parseFloat(monthlyLimit) * parseFloat(pauseThreshold) / 100).toFixed(2)})
                  </span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4 border-t">
              <p className="font-medium text-sm">El AI Guardian incluye:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Monitoreo automático 24/7 de todas tus APIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Detección inteligente de patrones inusuales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Sugerencias de optimización con IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Reportes mensuales detallados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Prevención automática de bill shock</span>
                </li>
              </ul>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Configurando...' : '🤖 Activar AI Budget Guardian'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
