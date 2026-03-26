import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { COVER_IMAGES } from '../types';

export default function CreateTrip() {
  const navigate = useNavigate();
  const addTrip = useTripStore((s) => s.addTrip);

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('5000');
  const [currency, setCurrency] = useState('¥');
  const [notes, setNotes] = useState('');
  const [coverIndex, setCoverIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || !startDate || !endDate) return;
    const id = addTrip({
      title: title.trim(),
      destination: destination.trim(),
      coverImage: COVER_IMAGES[coverIndex],
      startDate,
      endDate,
      budget: parseFloat(budget) || 0,
      currency,
      notes: notes.trim(),
    });
    navigate(`/trip/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="glass-card rounded-3xl overflow-hidden animate-scale-in">
        {/* Cover Preview */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={COVER_IMAGES[coverIndex]}
            alt="封面"
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/30 to-transparent" />
          <div className="absolute bottom-5 left-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warm-400" />
            <h2 className="text-white text-xl font-bold drop-shadow-lg">创建新旅行</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Cover Selection */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">选择封面</label>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {COVER_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCoverIndex(i)}
                  className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    i === coverIndex
                      ? 'border-primary-400 shadow-lg shadow-primary-500/30 scale-105'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {i === coverIndex && (
                    <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2">旅行名称 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：东京五日游"
                required
                className="input-dark w-full px-4 py-3 text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-2">目的地 *</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例如：日本东京"
                required
                className="input-dark w-full px-4 py-3 text-sm rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2">出发日期 *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="input-dark w-full px-4 py-3 text-sm rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2">返回日期 *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  required
                  className="input-dark w-full px-4 py-3 text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2">币种</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-dark w-full px-4 py-3 text-sm rounded-xl"
                >
                  <option value="¥">¥ 人民币</option>
                  <option value="$">$ 美元</option>
                  <option value="€">€ 欧元</option>
                  <option value="£">£ 英镑</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-white/40 mb-2">总预算</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="0"
                  step="100"
                  className="input-dark w-full px-4 py-3 text-sm rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-2">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="旅行的特别安排或注意事项..."
                rows={3}
                className="input-dark w-full px-4 py-3 text-sm rounded-xl resize-none"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 rounded-xl text-sm">
              创建旅行计划
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
