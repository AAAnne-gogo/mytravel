import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Activity, ActivityCategory } from '../types';
import { CATEGORY_CONFIG } from '../types';

interface Props {
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
  onCancel: () => void;
  initial?: Activity;
}

export default function ActivityForm({ onSubmit, onCancel, initial }: Props) {
  const [time, setTime] = useState(initial?.time ?? '09:00');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [cost, setCost] = useState(initial?.cost?.toString() ?? '0');
  const [category, setCategory] = useState<ActivityCategory>(initial?.category ?? 'attraction');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      time,
      title: title.trim(),
      location: location.trim(),
      notes: notes.trim(),
      cost: parseFloat(cost) || 0,
      category,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-5 space-y-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white/80">
          {initial ? '编辑活动' : '添加活动'}
        </h4>
        <button type="button" onClick={onCancel} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-4 h-4 text-white/30" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/30 mb-1.5">时间</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-dark w-full px-3 py-2.5 text-sm rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs text-white/30 mb-1.5">类别</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
            className="input-dark w-full px-3 py-2.5 text-sm rounded-lg"
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/30 mb-1.5">活动名称 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：参观故宫"
          required
          className="input-dark w-full px-3 py-2.5 text-sm rounded-lg"
        />
      </div>

      <div>
        <label className="block text-xs text-white/30 mb-1.5">地点</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例如：北京市东城区"
          className="input-dark w-full px-3 py-2.5 text-sm rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/30 mb-1.5">费用</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            min="0"
            step="0.01"
            className="input-dark w-full px-3 py-2.5 text-sm rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs text-white/30 mb-1.5">备注</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="可选"
            className="input-dark w-full px-3 py-2.5 text-sm rounded-lg"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl">
        <Plus className="w-4 h-4" />
        {initial ? '保存修改' : '添加活动'}
      </button>
    </form>
  );
}
