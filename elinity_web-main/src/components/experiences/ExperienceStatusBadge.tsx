import React from 'react';
import { ExperienceStatus } from './experiencesData';
import { CheckCircle, AlertTriangle, Flame, Users, XCircle } from 'lucide-react';

interface ExperienceStatusBadgeProps {
  status: ExperienceStatus;
}

export const ExperienceStatusBadge: React.FC<ExperienceStatusBadgeProps> = ({ status }) => {
  const config = {
    confirmed: {
      label: 'Confirmed',
      icon: <CheckCircle size={12} />,
      style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    'almost-full': {
      label: 'Almost Full',
      icon: <Flame size={12} />,
      style: 'bg-orange-500/15 text-orange-400 border-orange-500/30 animate-pulse'
    },
    'filling-fast': {
      label: 'Filling Fast',
      icon: <Users size={12} />,
      style: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    'few-spots-left': {
      label: 'Few Spots Left',
      icon: <AlertTriangle size={12} />,
      style: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    },
    'sold-out': {
      label: 'Sold Out',
      icon: <XCircle size={12} />,
      style: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30'
    }
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${current.style}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};

export default ExperienceStatusBadge;
