
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';

const historyData = [
  { date: 'Bugün', trades: [
    { id: '1', pair: 'BTC/USDT', time: '14:32', type: 'Alış', amount: '0.05 BTC', profit: '+$12.45', isPositive: true },
    { id: '2', pair: 'ETH/USDT', time: '12:15', type: 'Satış', amount: '0.1 ETH', profit: '-$8.20', isPositive: false },
  ]},
  { date: 'Dün', trades: [
    { id: '3', pair: 'BTC/USDT', time: '21:55', type: 'Alış', amount: '0.02 BTC', profit: '+$5.60', isPositive: true },
    { id: '4', pair: 'SOL/USDT', time: '18:10', type: 'Alış', amount: '10 SOL', profit: '+$22.10', isPositive: true },
  ]}
];

const TradeHistory: React.FC = () => {
  const [filter, setFilter] = useState('Hepsi');

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold">Geçmiş</h2>
        <button className="p-2 bg-white/5 rounded-lg border border-white/5 text-gray-400">
          <Filter size={20} />
        </button>
      </div>

      {/* Filtre Çipleri */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
        {['Hepsi', 'Alış', 'Satış', 'BTC', 'ETH', 'SOL'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border ${filter === f ? 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-lg shadow-[#00a3ff]/20' : 'bg-[#121b26] border-white/5 text-gray-400 hover:border-white/10'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Geçmiş Zaman Çizelgesi */}
      <div className="space-y-8">
        {historyData.map((section) => (
          <div key={section.date}>
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">{section.date}</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>
            <div className="space-y-3">
              {section.trades.map((trade) => (
                <div key={trade.id} className="bg-[#121b26] p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-[#1a2531] transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-full ${trade.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} flex items-center justify-center border border-current/10`}>
                      {trade.isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{trade.pair}</h4>
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-gray-500 uppercase tracking-widest">{trade.type}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-1">15.10.2023 {trade.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-base tracking-tight ${trade.isPositive ? 'text-green-500' : 'text-red-500'}`}>{trade.profit}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{trade.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Boş Durum Gösterimi */}
      <div className="py-20 flex flex-col items-center justify-center text-center px-10">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-6">
           <Calendar size={32} />
        </div>
        <p className="text-gray-400 font-bold mb-2">Başka işlem bulunamadı</p>
        <p className="text-xs text-gray-500 font-medium">Filtreleri değiştirmeyi deneyin veya yeni bir bot oluşturarak işleme başlayın.</p>
      </div>
    </div>
  );
};

export default TradeHistory;
