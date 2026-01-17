
import React, { useState, useEffect } from 'react';
import { Pickaxe, Activity, Zap, Users, ExternalLink, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const hashrateData = [
  { time: '00:00', value: 450 },
  { time: '04:00', value: 480 },
  { time: '08:00', value: 440 },
  { time: '12:00', value: 465 },
  { time: '16:00', value: 490 },
  { time: '20:00', value: 475 },
  { time: '23:59', value: 485 },
];

const MiningView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [workers, setWorkers] = useState([
    { id: 'Antminer_S19_1', status: 'Online', hashrate: '110 TH/s', temp: '68°C', uptime: '12g 4s' },
    { id: 'Antminer_S19_2', status: 'Online', hashrate: '108 TH/s', temp: '72°C', uptime: '5g 18s' },
    { id: 'GPU_Rig_V1', status: 'Offline', hashrate: '0 MH/s', temp: '0°C', uptime: '0s' },
  ]);

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Bağlantı Durumu */}
      <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Binance Pool Durumu</p>
            <p className="font-bold text-sm">{isConnected ? 'Bağlantı Başarılı' : 'Bağlantı Kesildi'}</p>
          </div>
        </div>
        <button className="text-[#00a3ff] text-xs font-bold flex items-center gap-1 hover:underline">
          <ExternalLink size={14} /> Gözlemci Paneli
        </button>
      </div>

      {/* Madencilik İstatistikleri */}
      <div className="grid grid-cols-2 gap-4">
        <MiningStatCard 
          title="Güncel Hashrate" 
          value="485.5 TH/s" 
          subtitle="Real-time" 
          icon={<Activity size={20} className="text-[#00a3ff]" />} 
        />
        <MiningStatCard 
          title="Günlük Kazanç" 
          value="0.0045 BTC" 
          subtitle="~ $182.40" 
          icon={<Zap size={20} className="text-yellow-500" />} 
        />
      </div>

      {/* Hashrate Grafiği */}
      <div className="bg-[#121b26] rounded-2xl p-6 border border-white/5">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">24 Saatlik Kazım Gücü</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hashrateData}>
              <defs>
                <linearGradient id="miningGradient" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#miningGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* İşçiler (Workers) */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users size={22} className="text-gray-400" /> Aktif İşçiler
          </h2>
          <span className="text-xs font-bold text-gray-500">2 Çevrimiçi / 3 Toplam</span>
        </div>
        <div className="space-y-3">
          {workers.map((worker) => (
            <div key={worker.id} className="bg-[#121b26] p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-[#1a2531] transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${worker.status === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <Pickaxe size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{worker.id}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${worker.status === 'Online' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {worker.status}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">Sıcaklık: {worker.temp}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm tracking-tight">{worker.hashrate}</p>
                <p className="text-[10px] text-gray-500 font-bold mt-1">Süre: {worker.uptime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hesap Bağlantısı */}
      <div className="bg-[#0d141c] p-6 rounded-3xl border border-[#00a3ff]/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f3ba2f]/10 flex items-center justify-center text-[#f3ba2f]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold">Binance Pool API Bağlantısı</h4>
            <p className="text-xs text-gray-500">İşlemleri anlık takip etmek için API anahtarını bağlayın.</p>
          </div>
        </div>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Binance Madencilik Hesabı (Mining Account)" 
            className="w-full bg-[#121b26] border border-white/5 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#00a3ff] outline-none"
          />
          <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
            Bağlantıyı Güncelle <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Uyarı Mesajı */}
      <div className="flex items-start gap-3 bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
        <AlertCircle className="text-yellow-500 shrink-0" size={18} />
        <p className="text-[11px] text-yellow-500/80 leading-relaxed font-medium">
          Madencilik verileri Binance Pool üzerinden 5 dakikalık gecikme ile senkronize edilmektedir. Hashrate düşüşlerinde bildirim almak için Ayarlar kısmından 'Madenci Bildirimleri'ni aktif edebilirsiniz.
        </p>
      </div>
    </div>
  );
};

const MiningStatCard: React.FC<{ title: string; value: string; subtitle: string; icon: React.ReactNode }> = ({ title, value, subtitle, icon }) => (
  <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 space-y-2">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
      {icon}
    </div>
    <div>
      <h4 className="text-xl font-bold tracking-tight">{value}</h4>
      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{subtitle}</p>
    </div>
  </div>
);

export default MiningView;
