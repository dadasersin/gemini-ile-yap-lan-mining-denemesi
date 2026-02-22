
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Plus, Edit3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface TradeData {
  pair: string;
  type: string;
  entry: number;
  current: number;
  icon: string;
}

const Dashboard: React.FC<{ onCreateBot: () => void; onSettings: () => void }> = ({ onCreateBot, onSettings }) => {
  // Performans grafiği verisi için state
  const [performanceData, setPerformanceData] = useState([
    { name: '1', value: 4000 },
    { name: '2', value: 3000 },
    { name: '3', value: 4500 },
    { name: '4', value: 2780 },
    { name: '5', value: 3890 },
    { name: '6', value: 4390 },
    { name: '7', value: 5490 },
    { name: '8', value: 4800 },
    { name: '9', value: 6000 },
  ]);

  // Aktif işlemler için state
  const [trades, setTrades] = useState<TradeData[]>([
    {
      pair: "BTC/USDT",
      type: "Alış",
      entry: 42500.00,
      current: 45950.60,
      icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=035"
    },
    {
      pair: "ETH/USDT",
      type: "Satış",
      entry: 4400.00,
      current: 4287.70,
      icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=035"
    }
  ]);

  // Gerçek zamanlı güncellemeleri simüle eden effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Grafik verisini güncelle (en son noktayı biraz değiştir veya kaydır)
      setPerformanceData(prev => {
        const newData = [...prev];
        const lastValue = newData[newData.length - 1].value;
        const change = (Math.random() - 0.5) * 400; // Rastgele değişim
        const newValue = Math.max(1000, lastValue + change);
        
        // Veriyi kaydırarak ilerleme hissi ver
        newData.shift();
        newData.push({ name: Date.now().toString(), value: newValue });
        return newData;
      });

      // 2. İşlem fiyatlarını güncelle
      setTrades(prevTrades => prevTrades.map(trade => {
        const volatility = 0.001; // %0.1 dalgalanma
        const change = 1 + (Math.random() - 0.5) * volatility;
        return {
          ...trade,
          current: trade.current * change
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Kar/Zarar hesaplama yardımcıları
  const calculateProfit = (trade: TradeData) => {
    const diff = trade.type === "Alış" ? trade.current - trade.entry : trade.entry - trade.current;
    const pct = (diff / trade.entry) * 100;
    return {
      amount: diff.toFixed(2),
      percent: pct.toFixed(2),
      isPositive: diff >= 0
    };
  };

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Durum Çubuğu */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
        <span className="text-sm font-medium text-gray-400">Durum: <span className="text-green-500">Canlı Bağlantı Aktif</span></span>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 gap-4">
        <StatCard title="24s K/Z" value="+$1,250" subtitle="+%5.4" trend="up" />
        <StatCard title="Toplam K/Z" value="+$12,890" subtitle="Tüm zamanlar" trend="up" />
        <StatCard title="Kazanma Oranı" value="%82" subtitle="Son 100 işlem" trend="neutral" />
      </div>

      {/* Performans Grafiği */}
      <div className="bg-[#121b26] rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Bot Performansı (Canlı)</h3>
            <p className="text-2xl font-bold mt-1 tabular-nums">
              ${performanceData[performanceData.length - 1].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-green-400 text-sm font-bold flex items-center gap-1">
                <TrendingUp size={14} /> +%7.2
             </span>
             <span className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Geçen Ay</span>
          </div>
        </div>
        
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00a3ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#00a3ff" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grafik Zaman Filtreleri */}
        <div className="flex justify-between mt-6 bg-[#0b1118] p-1 rounded-xl">
          {['24S', '7G', '1A', 'HEPSİ'].map((period) => (
            <button 
              key={period} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${period === '1A' ? 'bg-[#00a3ff] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Aktif İşlemler */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-xl font-bold">Aktif İşlemler</h2>
          <button onClick={onSettings} className="text-[#00a3ff] text-sm font-medium flex items-center gap-1">
            <Edit3 size={14} /> Botu Düzenle
          </button>
        </div>
        <div className="space-y-3">
          {trades.map((trade, idx) => {
            const profit = calculateProfit(trade);
            return (
              <ActiveTradeCard 
                key={idx}
                pair={trade.pair} 
                type={trade.type} 
                entry={trade.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                current={trade.current.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                profit={`${profit.isPositive ? '+' : ''}$${profit.amount}`} 
                profitPct={`${profit.isPositive ? '+' : ''}%${profit.percent}`} 
                isPositive={profit.isPositive}
                icon={trade.icon}
              />
            );
          })}
        </div>
      </div>

      {/* Son Hareketler */}
      <div>
        <h2 className="text-xl font-bold mb-4 px-1">Son Hareketler</h2>
        <div className="bg-[#121b26] rounded-2xl border border-white/5 divide-y divide-white/5">
          <ActivityItem 
            type="Alındı" 
            description="0.1 BTC Satın Alındı" 
            time="2 dk önce" 
            value="$4,595.06" 
            color="bg-green-500/20 text-green-500" 
            icon={<TrendingUp size={18} />}
          />
          <ActivityItem 
            type="Satıldı" 
            description="1.5 ETH Satıldı" 
            time="1 saat önce" 
            value="$6,431.55" 
            color="bg-red-500/20 text-red-500" 
            icon={<TrendingDown size={18} />}
          />
          <ActivityItem 
            type="Strateji" 
            description="Strateji güncellendi" 
            time="3 saat önce" 
            color="bg-[#00a3ff]/20 text-[#00a3ff]" 
            icon={<Edit3 size={18} />}
          />
        </div>
      </div>

      {/* Bot Oluşturma Butonu */}
      <button 
        onClick={onCreateBot}
        className="w-full bg-[#00a3ff] hover:bg-[#0082cc] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,163,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus size={20} />
        Yeni Bot Oluştur
      </button>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; subtitle: string; trend: 'up' | 'down' | 'neutral' }> = ({ title, value, subtitle, trend }) => (
  <div className="bg-[#121b26] p-5 rounded-2xl border border-white/5 hover:border-[#00a3ff]/30 transition-colors group">
    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider group-hover:text-gray-300">{title}</p>
    <div className="flex items-baseline gap-2 mt-2">
      <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
      {trend === 'up' && <ArrowUpRight className="text-green-500" size={18} />}
    </div>
    <p className={`text-sm mt-1 font-medium ${trend === 'up' ? 'text-green-500' : 'text-gray-500'}`}>{subtitle}</p>
  </div>
);

const ActiveTradeCard: React.FC<{ 
  pair: string; 
  type: string; 
  entry: string; 
  current: string; 
  profit: string; 
  profitPct: string; 
  isPositive: boolean;
  icon: string;
}> = ({ pair, type, entry, current, profit, profitPct, isPositive, icon }) => {
  const prevCurrent = useRef(current);
  const [flash, setFlash] = useState<'none' | 'up' | 'down'>('none');

  useEffect(() => {
    if (current > prevCurrent.current) setFlash('up');
    else if (current < prevCurrent.current) setFlash('down');
    
    const timer = setTimeout(() => setFlash('none'), 1000);
    prevCurrent.current = current;
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 hover:bg-[#1a2531] transition-all cursor-pointer overflow-hidden relative">
      {/* Yanıp sönme efekti katmanı */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${flash === 'up' ? 'bg-green-500/5 opacity-100' : flash === 'down' ? 'bg-red-500/5 opacity-100' : 'opacity-0'}`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0b1118] p-1.5 border border-white/10">
            <img src={icon} alt={pair} className="w-full h-full object-contain" />
          </div>
          <div>
            <h5 className="font-bold text-base">{pair}</h5>
            <span className={`text-xs font-bold ${type === 'Alış' ? 'text-green-500' : 'text-red-500'}`}>{type}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold text-base tabular-nums transition-colors duration-500 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {profit}
          </div>
          <div className={`text-xs font-medium tabular-nums ${isPositive ? 'text-green-500/80' : 'text-red-500/80'}`}>
            {profitPct}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs relative z-10">
        <div>
          <p className="text-gray-500 font-medium mb-1">Giriş Fiyatı</p>
          <p className="font-bold text-gray-300">${entry}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 font-medium mb-1">Güncel Fiyat</p>
          <p className={`font-bold tabular-nums transition-colors duration-300 ${flash === 'up' ? 'text-green-400' : flash === 'down' ? 'text-red-400' : 'text-gray-200'}`}>
            ${current}
          </p>
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ type: string; description: string; time: string; value?: string; color: string; icon: React.ReactNode }> = ({ type, description, time, value, color, icon }) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h6 className="font-semibold text-sm">{description}</h6>
        <p className="text-gray-500 text-xs mt-0.5">{time}</p>
      </div>
    </div>
    {value && <div className="font-bold text-sm tracking-tight">{value}</div>}
  </div>
);

export default Dashboard;
