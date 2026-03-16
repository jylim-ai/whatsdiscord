// src/components/AlertStackWithAlert.jsx
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

// 🟣 Single Alert Component
const Alert = ({ id, type = 'info', message = '', label = 'Info', onClose }) => {
  const typeStyles = {
    info: {
      bg: 'bg-indigo-900',
      labelBg: 'bg-indigo-500',
      border: 'bg-indigo-800',
      text: 'text-indigo-100',
    },
    error: {
      bg: 'bg-red-900',
      labelBg: 'bg-red-500',
      border: 'bg-red-800',
      text: 'text-red-100',
    },
    success: {
      bg: 'bg-green-900',
      labelBg: 'bg-green-500',
      border: 'bg-green-800',
      text: 'text-green-100',
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`alert-animation ${styles.bg} text-center py-4 lg:px-4 mb-2`}>
      <div
        className={`p-2 ${styles.border} items-center ${styles.text} leading-none lg:rounded-full flex lg:inline-flex`}
        role="alert"
      >
        <span className={`flex rounded-full ${styles.labelBg} uppercase px-2 py-1 text-xs font-bold mr-3`}>
          {label}
        </span>
        <span className="font-semibold mr-2 text-left flex-auto">{message}</span>
        <button onClick={() => onClose(id)} className="ml-2 text-white font-bold">×</button>
      </div>
    </div>
  );
};

// 🟢 Alert Stack Manager Component
const AlertStack = forwardRef((props, ref) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((type, label, message) => {
    const newAlert = {
      id: Date.now(),
      type,
      label,
      message,
    };
    setAlerts((prev) => [...prev, newAlert]);
  }, []);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Expose showAlert method to parent via ref
  useImperativeHandle(ref, () => ({
    showAlert,
  }));

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end max-w-sm w-full">
      {alerts.map((alert) => (
        <Alert key={alert.id} {...alert} onClose={() => removeAlert(alert.id)} />
      ))}
    </div>
  );
});

export default AlertStack;
