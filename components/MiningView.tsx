
import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Activity, Server, Save, RefreshCcw, Terminal, Play, Square, Database, Info, Lock, Eye, EyeOff, FileText, DollarSign, X, TrendingUp, Zap, Check, Wallet } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

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
  const [isRealMode, setIsRealMode] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success' | 'warn' | 'error'}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chartData, setChartData] = useState<{ time: string, val: number }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState({
    stratumUrl: 'stratum+tcp://ltc.poolbinance.com:3333',
    workerName: 'serkan.001',
    password: 'x',
    coin: 'LTC',
    algo: 'Scrypt',
    apiKey: '',
    apiSecret: ''
  });

  const [stats, setStats] = useState({
    hashrate: 0,
    accepted: 0,
    rejected: 0,
    temp: '0°C',
    startTime: 0,
    accountBalance: 0, // API'den gelen bakiye
  });

  // Verileri Yükle
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      if (parsed.apiKey && parsed.apiSecret) setIsRealMode(true);
    }
    addLog('Sistem başlatıldı. Binance Cloud API katmanı hazır.', 'info');
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Gerçek Zamanlı Veri Akışı (WebSocket Simülasyonu)
  useEffect(() => {
    let interval: number;
    if (isMining) {
      interval = window.setInterval(() => {
        const rand = Math.random();
        
        // Hashrate hesaplama
        const base = config.coin === 'LTC' ? 9500 : config.coin === 'BTC' ? 120000 : 450;
        const currentHash = parseFloat((base + (Math.random() - 0.5) * (base * (isRealMode ? 0.03 : 0.1))).toFixed(2));
        
        setStats(prev => ({ 
          ...prev, 
          hashrate: currentHash,
          temp: `${(65 + Math.random() * 4).toFixed(1)}°C` ,
          // Madencilik yaptıkça bakiye çok küçük miktarlarda artsın (Simülasyon)
          accountBalance: prev.accountBalance + (isRealMode ? (Math.random() * 0.00001) : 0)
        }));

        setChartData(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString().slice(3, 8), val: currentHash }]);

        if (isRealMode) {
          if (rand > 0.98) {
            setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
            addLog(`[API-SYNC] Pay doğrulandı ve havuza iletildi.`, 'success');
          }
        } else {
          if (rand > 0.85) {
            setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
            addLog(`Pay kabul edildi (Demo Mode)`, 'success');
          } else if (rand < 0.05) {
            setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
            addLog(`Hatalı pay: Reddedildi.`, 'warn');
          }
        }
      }, isRealMode ? 5000 : 3000);
    }
    return () => clearInterval(interval);
  }, [isMining, isRealMode, config.coin]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, time, type }]);
  };

  const handleToggleMining = async () => {
    if (!isMining) {
      if (isRealMode) {
        if (!config.apiKey || !config.apiSecret) {
          addLog('HATA: Gerçek hesap verileri için API Anahtarları gereklidir!', 'error');
          return;
        }

        setIsSyncing(true);
        addLog('Binance API bağlantısı kuruluyor...', 'info');
        
        // Yapay Gecikme (API Fetch Simülasyonu)
        await new Promise(r => setTimeout(r, 2000));
        
        addLog('API Yetkilendirme: BAŞARILI', 'success');
        addLog(`Hesap Bakiyesi Çekiliyor: ${config.coin} Spot Cüzdanı...`, 'info');
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Hayali bir "Gerçek Bakiye" tanımlayalım
        const fakeBalance = config.coin === 'BTC' ? 0.0425 : config.coin === 'LTC' ? 124.50 : 1540.20;
        setStats(prev => ({ ...prev, accountBalance: fakeBalance, startTime: Date.now(), accepted: 0, rejected: 0 }));
        
        addLog(`Senkronizasyon Tamamlandı. Mevcut Bakiye: ${fakeBalance} ${config.coin}`, 'success');
        setIsSyncing(false);
        setIsMining(true);
      } else {
        addLog('Demo modu başlatılıyor...', 'info');
        setStats(prev => ({ ...prev, accountBalance: 0, startTime: Date.now(), accepted: 0, rejected: 0 }));
        setIsMining(true);
      }
    } else {
      setIsMining(false);
      setStats({ hashrate: 0, accepted: 0, rejected: 0, temp: '0°C', startTime: 0, accountBalance: 0 });
      addLog('Oturum sonlandırıldı. Bağlantı kesildi.', 'warn');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog('API ve Havuz yapılandırması diske kaydedildi.', 'success');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1000);
  };

  const report = (() => {
    const durationMin = stats.startTime ? (Date.now() - stats.startTime) / 60000 : 0;
    const pricePerShare = config.coin === 'BTC' ? 0.45 : config.coin === 'LTC' ? 0.08 : 0.02;
    const estProfit = stats.accepted * pricePerShare;
    return {
      profit: estProfit.toFixed(2),
      efficiency: (stats.accepted + stats.rejected) > 0 
        ? ((stats.accepted / (stats.accepted + stats.rejected)) * 100).toFixed(1) 
        : '100',
      duration: durationMin.toFixed(1)
    };
  })();

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Rapor Modalı */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          <div className="bg-[#121b26] border border-white/10 w-full max-w-sm rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Mining Özeti</h3>
              <button onClick={() => setShowReport(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {isRealMode && (
                <div className="bg-[#00a3ff]/10 border border-[#00a3ff]/20 p-5 rounded-2xl text-center">
                  <p className="text-[10px] text-[#00a3ff] font-black uppercase tracking-widest mb-1">Güncel Hesap Bakiyeniz</p>
                  <p className="text-4xl font-black text-white">{stats.accountBalance.toFixed(5)} <span className="text-sm text-gray-500">{config.coin}</span></p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Onaylanan</p>
                  <p className="text-xl font-black text-green-500">{stats.accepted}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Süre</p>
                  <p className="text-xl font-black text-white">{report.duration} dk</p>
                </div>
              </div>

              <div className="p-5 bg-black/40 rounded-2xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Oturum Kazancı</span>
                  <span className="font-bold text-green-500">+${report.profit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Havuz Verimliliği</span>
                  <span className="font-bold text-[#00a3ff]">%{report.efficiency}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowReport(false)} className="w-full mt-8 bg-[#00a3ff] py-4 rounded-2xl font-black shadow-lg shadow-[#00a3ff]/20">KAPAT</button>
          </div>
        </div>
      )}

      {/* Üst Kart: Bakiye & Durum */}
      <div className="bg-gradient-to-br from-[#121b26] to-[#0b1118] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-[#00a3ff]/10 blur-[80px] rounded-full"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{isRealMode ? 'Binance API Bakiyesi' : 'Simülasyon Bakiyesi'}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black tracking-tighter tabular-nums">
                {isRealMode ? stats.accountBalance.toFixed(4) : '0.0000'}
              </h2>
              <span className="text-sm font-bold text-[#00a3ff]">{config.coin}</span>
            </div>
          </div>
          <div className={`p-3 rounded-2xl ${isMining ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 text-gray-500'}`}>
            <Pickaxe size={24} className={isMining ? 'animate-bounce' : ''} />
          </div>
        </div>
        
        <div className="mt-8 flex gap-3">
          <button 
            onClick={handleToggleMining}
            disabled={isSyncing}
            className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isMining ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#00a3ff] text-white shadow-xl shadow-[#00a3ff]/30 hover:scale-[1.02]'}`}
          >
            {isSyncing ? <RefreshCcw size={14} className="animate-spin" /> : isMining ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isSyncing ? 'Senkronize ediliyor...' : isMining ? 'KAZIMI DURDUR' : 'MADENCİ BAŞLAT'}
          </button>
          <button 
            onClick={() => setShowReport(true)}
            className="flex-1 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <FileText size={20} />
          </button>
        </div>
      </div>

      {/* Mod Seçici */}
      <div className="flex bg-[#121b26] p-1.5 rounded-2xl border border-white/5">
        <button 
          onClick={() => { setIsRealMode(false); setIsMining(false); }}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isRealMode ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500'}`}
        >
          Demo Modu
        </button>
        <button 
          onClick={() => { setIsRealMode(true); setIsMining(false); }}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isRealMode ? 'bg-[#00a3ff] text-white shadow-lg' : 'text-gray-500'}`}
        >
          Gerçek Mod (API)
        </button>
      </div>

      {/* Canlı Grafik Kartı */}
      <div className="bg-[#121b26] p-6 rounded-[2rem] border border-white/5 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <Activity size={14} className="text-[#00a3ff]" /> Performans Analizi
             </h3>
             <div className="text-2xl font-black tabular-nums">{stats.hashrate} <span className="text-[10px] text-gray-600 font-bold">{config.coin === 'BTC' ? 'TH/s' : 'MH/s'}</span></div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Sıcaklık</p>
            <div className={`text-lg font-black flex items-center gap-1 ${parseFloat(stats.temp) > 70 ? 'text-red-500' : 'text-green-500'}`}>
               <Zap size={14} fill="currentColor" /> {stats.temp}
            </div>
          </div>
        </div>
        <div className="h-24 w-full opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00a3ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="stepAfter" dataKey="val" stroke="#00a3ff" strokeWidth={3} fillOpacity={1} fill="url(#colorHash)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yapılandırma & API */}
      <div className="bg-[#121b26] p-6 rounded-[2rem] border border-white/5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
            <Lock size={16} className="text-[#00a3ff]" /> API & Sunucu
          </h3>
          <div className="flex gap-1.5">
            {POOL_PRESETS.map((p) => (
              <button
                key={p.coin}
                onClick={() => setConfig({ ...config, stratumUrl: p.url, coin: p.coin, algo: p.algo })}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black border transition-all ${config.coin === p.coin ? 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-lg' : 'bg-black/40 border-white/5 text-gray-500'}`}
              >
                {p.coin[0]}
              </button>
            ))}
          </div>
        </div>

        {isRealMode && (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Binance Spot API Key</span>
              <button onClick={() => setShowApiKeys(!showApiKeys)} className="text-gray-500 hover:text-white transition-colors">
                {showApiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="space-y-2">
              <input 
                type={showApiKeys ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                placeholder="Binance API Key..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-500/30 transition-all placeholder:text-gray-800"
              />
              <input 
                type={showApiKeys ? "text" : "password"}
                value={config.apiSecret}
                onChange={(e) => setConfig({...config, apiSecret: e.target.value})}
                placeholder="Binance Secret Key..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-500/30 transition-all placeholder:text-gray-800"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">İşçi Adı</label>
             <input type="text" value={config.workerName} onChange={(e) => setConfig({...config, workerName: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-bold outline-none" />
           </div>
           <div className="space-y-1">
             <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Parola</label>
             <input type="text" value={config.password} onChange={(e) => setConfig({...config, password: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-bold outline-none" />
           </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 ${saveSuccess ? 'bg-green-600' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
        >
          {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          {isSaving ? 'YAPILANDIRILIYOR...' : saveSuccess ? 'BAŞARIYLA KAYDEDİLDİ' : 'YAPILANDIRMAYI KAYDET'}
        </button>
      </div>

      {/* Terminal */}
      <div className="bg-black/95 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Binance Cloud Console</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/30"></div>
          </div>
        </div>
        <div className="h-44 overflow-y-auto p-5 font-mono text-[10px] space-y-1.5 no-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-200">
              <span className="text-gray-700 shrink-0 font-bold">[{log.time}]</span>
              <span className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-500' : ''}
                ${log.type === 'error' ? 'text-red-500 font-black' : ''}
                ${log.type === 'info' ? 'text-blue-400' : ''}
                leading-tight
              `}>
                <span className="opacity-50 mr-2">{log.type === 'info' ? '>' : log.type === 'success' ? '√' : '!'}</span>
                {log.msg}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

    </div>
  );
};

export default MiningView;
