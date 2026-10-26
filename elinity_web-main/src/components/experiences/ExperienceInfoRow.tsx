import React from 'react';
import { Calendar, Clock, Hourglass, MapPin, Users } from 'lucide-react';
import { Experience } from './experiencesData';

interface ExperienceInfoRowProps {
  experience: Experience;
}

export const ExperienceInfoRow: React.FC<ExperienceInfoRowProps> = ({ experience }) => {
  const formattedDate = new Date(experience.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const items = [
    {
      icon: <Calendar className="text-orange-400" size={16} />,
      label: 'Date',
      value: formattedDate,
    },
    {
      icon: <Clock className="text-orange-400" size={16} />,
      label: 'Time',
      value: experience.time,
    },
    {
      icon: <Hourglass className="text-orange-400" size={16} />,
      label: 'Duration',
      value: experience.duration,
    },
    {
      icon: <MapPin className="text-orange-400 shrink-0" size={16} />,
      label: 'Venue',
      value: `${experience.venue}, ${experience.city}`,
    },
    {
      icon: <Users className="text-orange-400" size={16} />,
      label: 'Group Size',
      value: `Up to ${experience.capacity} spots (Currently ${experience.filled} booked)`,
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3 text-sm">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 mt-0.5">
            {item.icon}
          </div>
          <div>
            <span className="block text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
              {item.label}
            </span>
            <span className="text-neutral-200 font-medium leading-relaxed">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceInfoRow;
