
import React from 'react';
import { TrendingUp, TrendingDown, ChevronDown, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'BTC', value: 40, color: '#f7931a' },
  { name: 'ETH', value: 35, color: '#00a3ff' },
  { name: 'USDT', value: 25, color: '#26a17b' },
];

const assets = [
  { name: 'Bitcoin', symbol: '0.5 BTC', balance: '60.000,00 ₺', change: '+%2.5', isPositive: true, icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=035' },
  { name: 'Ethereum', symbol: '1.5 ETH', balance: '52.500,00 ₺', change: '-%1.2', isPositive: false, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=035' },
  { name: 'Tether', symbol: '37,500 USDT', balance: '37.500,00 ₺', change: '+%0.1', isPositive: true, icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=035' },
];

const WalletView: React.FC = () => {
  return (
    <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-1">
        <h2 className="text-3xl font-extrabold tracking-tight">Toplam Değer</h2>
        <p className="text-2xl text-gray-300 font-bold mt-2">150.000,00 ₺</p>
      </div>

      {/* Varlık Dağılımı */}
      <div className="bg-[#121b26] rounded-3xl p-6 border border-white/5 relative">
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Varlık Dağılımı</h3>
        
        <div className="relative h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black">150K ₺</span>
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Toplam Varlık</span>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs font-bold text-gray-400">{item.name} %{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 px-1 overflow-x-auto no-scrollbar">
        <button className="bg-[#1a2531] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/5 whitespace-nowrap">
          Değere Göre <ChevronDown size={14} />
        </button>
        <button className="bg-[#1a2531] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/5 whitespace-nowrap">
          Miktara Göre <ChevronDown size={14} />
        </button>
        <button className="bg-[#1a2531] text-gray-400 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap">
          İsme Göre
        </button>
      </div>

      {/* Varlık Listesi */}
      <div className="space-y-4">
        {assets.map((asset) => (
          <div key={asset.name} className="bg-[#121b26] p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-[#1a2531] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0b1118] p-2 border border-white/10">
                <img src={asset.icon} alt={asset.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="font-bold text-base">{asset.name}</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{asset.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-base tracking-tight">{asset.balance}</p>
              <div className={`flex items-center justify-end gap-1 text-xs font-bold mt-1 ${asset.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {asset.change} {asset.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletView;
