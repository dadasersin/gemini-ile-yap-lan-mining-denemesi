
import React, { useState } from 'react';
import { ArrowLeft, Info, ChevronDown } from 'lucide-react';

const EditBotView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [risk, setRisk] = useState('Orta');

  return (
    <div className="py-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        <span className="font-semibold">Panele Geri Dön</span>
      </button>

      <div className="bg-[#121b26] rounded-3xl p-6 border border-white/5 space-y-6">
        {/* Bot Seçimi */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bot Seçimi</label>
          <div className="relative">
            <select className="w-full bg-[#0b1118] border border-white/10 rounded-2xl p-4 appearance-none focus:ring-2 focus:ring-[#00a3ff] outline-none font-bold text-white">
              <option>Ana Strateji Botu 1</option>
              <option>Scalper Bot 2</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>

        {/* Strateji Seçimi */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            Strateji <Info size={14} className="text-gray-500" />
          </label>
          <div className="relative">
            <select className="w-full bg-[#0b1118] border border-white/10 rounded-2xl p-4 appearance-none focus:ring-2 focus:ring-[#00a3ff] outline-none font-bold text-white">
              <option>Hareketli Ortalama Kesişimi</option>
              <option>RSI Aşırı Alım/Satım</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>

        {/* Risk Toleransı */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            Risk Toleransı <Info size={14} className="text-gray-500" />
          </label>
          <div className="flex bg-[#0b1118] p-1.5 rounded-2xl gap-1">
            {['Düşük', 'Orta', 'Yüksek'].map((level) => (
              <button 
                key={level}
                onClick={() => setRisk(level)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${risk === level ? 'bg-[#1a2531] text-white border border-white/10 shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Yatırım Tutarı */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            Yatırım Tutarı <Info size={14} className="text-gray-500" />
          </label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="0.00 USDT" 
              className="w-full bg-[#0b1118] border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-[#00a3ff] outline-none font-bold text-xl placeholder:text-gray-700 text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00a3ff] font-bold">USDT</span>
          </div>
        </div>

        {/* SL / TP */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              Zarar-Durdur (%) <Info size={12} className="text-gray-600" />
            </label>
            <input 
              type="number" 
              placeholder="5" 
              className="w-full bg-[#0b1118] border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-red-500/50 outline-none font-bold text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              Kar-Al (%) <Info size={12} className="text-gray-600" />
            </label>
            <input 
              type="number" 
              placeholder="10" 
              className="w-full bg-[#0b1118] border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-green-500/50 outline-none font-bold text-white"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button className="w-full bg-[#00a3ff] hover:bg-[#0082cc] py-4 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(0,163,255,0.2)]">
            Değişiklikleri Kaydet
          </button>
          <button className="w-full text-red-500 font-bold text-sm hover:underline py-2">
            Tüm Ayarları Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBotView;
