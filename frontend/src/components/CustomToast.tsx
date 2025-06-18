'use client';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const toastStyle = {
  borderRadius: '12px',
  background: '#fff',
  padding: '16px 24px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  fontSize: '15px',
  maxWidth: '500px'
};

export const showSuccessToast = (message) => {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      flex items-start space-x-3 p-4 rounded-xl shadow-lg
      bg-white border-l-4 border-emerald-500`}
      style={{...toastStyle}}
    >
      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
      <div>
        <p className="font-medium text-emerald-800">Success</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  ), { duration: 4000 });
};

export const showErrorToast = (message) => {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      flex items-start space-x-3 p-4 rounded-xl shadow-lg
      bg-white border-l-4 border-rose-500`}
      style={{...toastStyle}}
    >
      <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
      <div>
        <p className="font-medium text-rose-800">Error</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  ), { duration: 4000 });
};

export const showLoadingToast = (message) => {
  return toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}
      flex items-start space-x-3 p-4 rounded-xl shadow-lg
      bg-white border-l-4 border-sky-500`}
      style={{...toastStyle}}
    >
      <Loader2 className="h-5 w-5 text-sky-500 flex-shrink-0 animate-spin" />
      <div>
        <p className="font-medium text-sky-800">Processing</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  ), { duration: Infinity });
};