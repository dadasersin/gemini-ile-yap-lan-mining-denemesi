
import React, { useState } from 'react';
import { ArrowLeft, Info, Check, ChevronDown } from 'lucide-react';

const CreateBotView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('Momentum');
  const [indicators, setIndicators] = useState({ rsi: true, macd: true, bb: false });

  return (
    <div className="py-4 space-y-6 animate-in slide-in-from-right-8 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        <span className="font-semibold">Panele Geri Dön</span>
      </button>

      {/* Temel Bilgiler */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">Bot Adı</label>
          <input 
            type="text" 
            placeholder="Botunuza bir isim verin..." 
            className="w-full bg-[#121b26] border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-[#00a3ff] outline-none font-medium text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">Kripto Varlık</label>
          <div className="relative">
            <select className="w-full bg-[#121b26] border border-white/10 rounded-2xl p-4 appearance-none focus:ring-2 focus:ring-[#00a3ff] outline-none font-medium text-white">
              <option>Bir işlem çifti seçin</option>
              <option>BTC/USDT</option>
              <option>ETH/USDT</option>
              <option>SOL/USDT</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* Popüler Şablonlar */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          Popüler Strateji Şablonları
          <Info size={16} className="text-gray-500" />
        </h3>
        <p className="text-xs text-gray-500 mb-4">Hızlı bir başlangıç şablonu seçin veya kendinizinkini sıfırdan oluşturun.</p>
        <div className="grid grid-cols-2 gap-3">
          <StrategyCard 
            title="Momentum Takipçisi" 
            desc="RSI ve MACD göstergelerini kullanarak trendleri yakalayın." 
            active={selectedStrategy === 'Momentum'} 
            onClick={() => setSelectedStrategy('Momentum')}
          />
          <StrategyCard 
            title="Volatilite Oyunu" 
            desc="Bollinger Bantları ile fiyat dalgalanmalarından kar edin." 
            active={selectedStrategy === 'Volatility'} 
            onClick={() => setSelectedStrategy('Volatility')}
          />
          <StrategyCard 
            title="Trend Kırılımı" 
            desc="Destek/direnç seviyelerine göre işlem yapın." 
            active={selectedStrategy === 'Trend'} 
            onClick={() => setSelectedStrategy('Trend')}
          />
          <StrategyCard 
            title="Özel Strateji" 
            desc="Kendi göstergelerinizi ve kurallarınızı belirleyin." 
            active={selectedStrategy === 'Custom'} 
            onClick={() => setSelectedStrategy('Custom')}
          />
        </div>
      </div>

      {/* Göstergeler */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Göstergeler (İndikatörler)</h3>
        
        <div className="space-y-6 bg-[#121b26] p-6 rounded-3xl border border-white/5">
          {/* RSI */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={indicators.rsi} 
                onChange={() => setIndicators(prev => ({...prev, rsi: !prev.rsi}))}
                className="w-5 h-5 rounded bg-[#0b1118] border-white/10 text-[#00a3ff] focus:ring-0"
              />
              <span className="font-bold">RSI</span>
            </label>
            {indicators.rsi && (
              <div className="pl-8 space-y-2">
                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>Periyot</span>
                  <span>14</span>
                </div>
                <input type="range" className="w-full h-1.5 bg-[#0b1118] rounded-lg appearance-none cursor-pointer accent-[#00a3ff]" />
              </div>
            )}
          </div>

          {/* MACD */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={indicators.macd} 
                onChange={() => setIndicators(prev => ({...prev, macd: !prev.macd}))}
                className="w-5 h-5 rounded bg-[#0b1118] border-white/10 text-[#00a3ff] focus:ring-0"
              />
              <span className="font-bold">MACD</span>
            </label>
            {indicators.macd && (
              <div className="pl-8 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>Hızlı Periyot</span>
                    <span>12</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-[#0b1118] rounded-lg appearance-none cursor-pointer accent-[#00a3ff]" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>Yavaş Periyot</span>
                    <span>26</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-[#0b1118] rounded-lg appearance-none cursor-pointer accent-[#00a3ff]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Özet */}
      <div className="bg-[#121b26] p-6 rounded-3xl border border-white/5 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Özet</h4>
        <div className="space-y-1 text-sm font-medium">
          <p><span className="text-gray-500">Bot Adı:</span> <span className="text-white">Yeni Strateji Botu</span></p>
          <p><span className="text-gray-500">İşlem Çifti:</span> <span className="text-white">BTC/USDT</span></p>
          <p><span className="text-gray-500">Göstergeler:</span> <span className="text-white">RSI, MACD</span></p>
          <p><span className="text-gray-500">Strateji:</span> <span className="text-white">Al/Sat Kesişimi</span></p>
        </div>
      </div>

      <button className="w-full bg-[#00a3ff] hover:bg-[#0082cc] py-4 rounded-2xl font-bold transition-all shadow-xl">
        Botu Oluştur
      </button>
    </div>
  );
};

const StrategyCard: React.FC<{ title: string; desc: string; active: boolean; onClick: () => void }> = ({ title, desc, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border text-left transition-all ${active ? 'bg-[#00a3ff]/10 border-[#00a3ff]' : 'bg-[#121b26] border-white/5 hover:border-white/10'}`}
  >
    <div className="flex justify-between items-start mb-2">
      <h5 className={`font-bold text-sm ${active ? 'text-[#00a3ff]' : 'text-white'}`}>{title}</h5>
      {active && <div className="bg-[#00a3ff] rounded-full p-0.5"><Check size={10} className="text-white" /></div>}
    </div>
    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{desc}</p>
  </button>
);

export default CreateBotView;
