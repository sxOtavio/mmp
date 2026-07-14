// src/components/delivery/DeliveryMetricCard.jsx
export function DeliveryMetricCard({ icon, label, value, cor }) {
  const cores = {
    gray: 'from-gray-50 to-gray-100',
    amber: 'from-amber-50 to-amber-100',
    blue: 'from-blue-50 to-blue-100',
    purple: 'from-purple-50 to-purple-100',
    emerald: 'from-emerald-50 to-emerald-100',
    red: 'from-red-50 to-red-100'
  };

  return (
    <div className={`bg-gradient-to-br ${cores[cor]} rounded-xl p-4 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold text-black`}>{value || 0}</p>
          <p className={`text-xs font-medium text-black`}>{label}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}