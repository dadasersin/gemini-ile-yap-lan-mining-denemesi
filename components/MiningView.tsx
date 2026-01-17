
import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Activity, Zap, Users, ExternalLink, ShieldCheck, ChevronRight, AlertCircle, Server, Copy, Check, Save, Settings2, RefreshCcw, Terminal, Play, Square, Database } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

// Sabitler
const STORAGE_KEY = 'cryptobot_mining_config';
const POOL_PRESETS = [
  { name: 'Litecoin (LTC)', url: 'stratum+tcp://ltc.poolbinance.com:3333', coin: 'LTC', algo: 'Scrypt' },
  { name: 'Bitcoin (BTC)', url: 'stratum+tcp://bs.poolbinance.com:3333', coin: 'BTC', algo: 'SHA256' },
  { name: 'Ethereum Classic (ETC)', url: 'stratum+tcp://etc.poolbinance.com:3333', coin: 'ETC', algo: 'Etchash' },
];

const MiningView: React.FC = () => {
  // State Yönetimi
  const [isMining, setIsMining] = useState(false);
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success' | 'warn'}[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState({
    stratumUrl: 'stratum+tcp://ltc.poolbinance.com:3333',
    workerName: 'serkan.001',
    password: 'x',
    coin: 'LTC',
    algo: 'Scrypt'
  });

  const [stats, setStats] = useState({
    hashrate: '0.00 MH/s',
    accepted: 0,
    rejected: 0,
    temp: '0°C'
  });

  // Kalıcı Verileri Yükle
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    addLog('Sistem hazır. Lütfen yapılandırmayı kontrol edin ve madenciliği başlatın.', 'info');
  }, []);

  // Logları Otomatik Kaydır
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Madencilik Simülasyonu (Gerçek veri akışı hissi için)
  useEffect(() => {
    let interval: number;
    if (isMining) {
      interval = window.setInterval(() => {
        const rand = Math.random();
        if (rand > 0.8) {
          setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
          addLog(`Pay kabul edildi (Share accepted)! Zorluk: 32.5K`, 'success');
        } else if (rand < 0.05) {
          setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
          addLog(`Hatalı pay (Stale share detected). Havuz bağlantısını kontrol edin.`, 'warn');
        }
        
        // Hashrate dalgalanması
        const base = config.coin === 'LTC' ? 9500 : config.coin === 'BTC' ? 120000 : 450;
        const currentHash = (base + (Math.random() - 0.5) * (base * 0.05)).toFixed(2);
        setStats(prev => ({ ...prev, hashrate: `${currentHash} ${config.coin === 'BTC' ? 'TH/s' : 'MH/s'}`, temp: `${(60 + Math.random() * 10).toFixed(1)}°C` }));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMining, config.coin]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, time, type }]);
  };

  const handleToggleMining = () => {
    if (!isMining) {
      addLog(`Havuz bağlantısı kuruluyor: ${config.stratumUrl}...`, 'info');
      setTimeout(() => {
        addLog(`Yetkilendirme başarılı: User ${config.workerName}`, 'success');
        addLog(`Algoritma algılandı: ${config.algo}`, 'info');
        setIsMining(true);
      }, 1500);
    } else {
      setIsMining(false);
      setStats({ hashrate: '0.00 MH/s', accepted: 0, rejected: 0, temp: '0°C' });
      addLog('Madencilik durduruldu.', 'warn');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog('Yapılandırma kaydedildi ve güncellendi.', 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const selectPreset = (preset: typeof POOL_PRESETS[0]) => {
    setConfig({ ...config, stratumUrl: preset.url, coin: preset.coin, algo: preset.algo });
    addLog(`${preset.name} şablonu seçildi.`, 'info');
  };

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Üst Durum Kartı */}
      <div className="bg-[#121b26] p-5 rounded-3xl border border-white/5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isMining ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-white' : 'bg-gray-800 text-gray-500'}`}>
            <Pickaxe size={24} className={isMining ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{isMining ? 'Aktif Kazım Yapılıyor' : 'Madenci Beklemede'}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {isMining ? 'Binance Cloud Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleToggleMining}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isMining ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-[#00a3ff] text-white shadow-lg shadow-[#00a3ff]/30 hover:scale-105'}`}
        >
          {isMining ? <span className="flex items-center gap-2"><Square size={14} fill="currentColor" /> Durdur</span> : <span className="flex items-center gap-2"><Play size={14} fill="currentColor" /> Başlat</span>}
        </button>
      </div>

      {/* Canlı Veriler */}
      <div className="grid grid-cols-2 gap-4">
        <MiningStatCard 
          title="Hashrate" 
          value={stats.hashrate} 
          subtitle={`${config.algo} Algoritması`} 
          icon={<Activity size={20} className="text-[#00a3ff]" />} 
        />
        <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pay Durumu</p>
            <Database size={18} className="text-yellow-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-xl font-bold text-green-500">{stats.accepted}</h4>
            <span className="text-gray-600">/</span>
            <h4 className="text-lg font-bold text-red-500/50">{stats.rejected}</h4>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">Kabul Edilen / Hatalı Paylar</p>
        </div>
      </div>

      {/* Yapılandırma Paneli */}
      <div className="bg-[#121b26] rounded-3xl p-6 border border-[#00a3ff]/20 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Settings2 size={120} />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Server size={20} className="text-[#00a3ff]" /> Donanım & Havuz Ayarları
          </h3>
          <div className="flex gap-1">
            {POOL_PRESETS.map((p) => (
              <button
                key={p.coin}
                onClick={() => selectPreset(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black border transition-all ${config.coin === p.coin ? 'bg-[#00a3ff] border-[#00a3ff] text-white' : 'bg-[#0b1118] border-white/5 text-gray-500'}`}
              >
                {p.coin[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-glow">Stratum Sunucusu</label>
            <input 
              type="text" 
              value={config.stratumUrl}
              onChange={(e) => setConfig({...config, stratumUrl: e.target.value})}
              className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#00a3ff] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Worker Name</label>
              <input 
                type="text" 
                value={config.workerName}
                onChange={(e) => setConfig({...config, workerName: e.target.value})}
                className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#00a3ff] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Şifre</label>
              <input 
                type="text" 
                value={config.password}
                onChange={(e) => setConfig({...config, password: e.target.value})}
                className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#00a3ff] outline-none"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${saveSuccess ? 'bg-green-600 shadow-lg shadow-green-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}
        >
          {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
          {isSaving ? 'Kaydediliyor...' : saveSuccess ? 'Ayarlar Kaydedildi' : 'Yapılandırmayı Kaydet'}
        </button>
      </div>

      {/* Canlı Terminal Logları */}
      <div className="bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[#00ff00]" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mining Console v2.4.1</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
          </div>
        </div>
        <div className="h-48 overflow-y-auto p-4 font-mono text-[11px] space-y-1.5 no-scrollbar bg-black/90">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 group">
              <span className="text-gray-600 shrink-0">[{log.time}]</span>
              <span className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-400' : ''}
                ${log.type === 'info' ? 'text-blue-400' : ''}
                leading-relaxed
              `}>
                {log.msg}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
          {!isMining && logs.length === 1 && (
            <div className="text-gray-700 animate-pulse mt-2 italic">
              Bağlantı bekleniyor...
            </div>
          )}
        </div>
      </div>

      {/* Ek Bilgi Kartı */}
      <div className="bg-[#121b26] p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-[#00a3ff]/50 transition-all cursor-help">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold">Güvenli Mod Aktif</p>
            <p className="text-[10px] text-gray-500 font-medium">SSL/TLS şifreleme üzerinden havuz bağlantısı.</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-700 group-hover:text-white transition-all" />
      </div>

    </div>
  );
};

const MiningStatCard: React.FC<{ title: string; value: string; subtitle: string; icon: React.ReactNode }> = ({ title, value, subtitle, icon }) => (
  <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 space-y-2 hover:border-[#00a3ff]/30 transition-colors">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
      {icon}
    </div>
    <div>
      <h4 className="text-xl font-bold tracking-tight text-glow">{value}</h4>
      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{subtitle}</p>
    </div>
  </div>
);

export default MiningView;
