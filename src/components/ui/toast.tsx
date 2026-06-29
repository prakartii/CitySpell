'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';

const ICONS = {
  success: <CheckCircle2 size={16} className="text-[#7A9E6E]" />,
  error: <XCircle size={16} className="text-[#D4726A]" />,
  info: <Info size={16} className="text-[#5E9E9E]" />,
  warning: <AlertTriangle size={16} className="text-[#C8A87A]" />,
};

const BARS = {
  success: 'bg-[#7A9E6E]',
  error: 'bg-[#D4726A]',
  info: 'bg-[#5E9E9E]',
  warning: 'bg-[#C8A87A]',
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-start gap-3 bg-white border border-[#E4E2DC] rounded-2xl shadow-lg shadow-black/8 px-4 py-3 min-w-[280px] max-w-[360px] relative overflow-hidden"
          >
            <span className="mt-0.5 flex-shrink-0">{ICONS[t.type]}</span>
            <p className="text-sm text-[#1A1A1C] font-medium leading-snug flex-1 pr-4">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute top-2.5 right-2.5 text-[#9A9AA4] hover:text-[#5A5A62] transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
            {/* progress bar */}
            <motion.div
              className={`absolute bottom-0 left-0 h-[2px] ${BARS[t.type]}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: t.duration / 1000, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
