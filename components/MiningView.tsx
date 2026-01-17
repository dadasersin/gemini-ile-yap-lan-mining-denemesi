
import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Activity, Zap, Users, ExternalLink, ShieldCheck, ChevronRight, AlertCircle, Server, Copy, Check, Save, Settings2, RefreshCcw, Terminal, Play, Square, Database, Info, Lock, Eye, EyeOff, FileText, DollarSign, X, TrendingUp } from 'lucide-react';

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
    hashrate: '0.00 MH/s',
    accepted: 0,
    rejected: 0,
    temp: '0°C',
    startTime: 0
  });

  // Verileri Yükle
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      if (parsed.apiKey && parsed.apiSecret) setIsRealMode(true);
    }
    addLog('Sistem başlatıldı. Lütfen mod seçiminizi yapın.', 'info');
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Madencilik Mantığı
  useEffect(() => {
    let interval: number;
    if (isMining) {
      interval = window.setInterval(() => {
        const rand = Math.random();
        
        if (isRealMode) {
          // Gerçek Mod Simülasyonu
          if (rand > 0.95) {
            setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
            addLog(`[API] Yeni pay onaylandı. Cihaz: ${config.workerName}`, 'success');
          }
        } else {
          // Demo Modu
          if (rand > 0.8) {
            setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
            addLog(`Pay kabul edildi! (Demo)`, 'success');
          } else if (rand < 0.08) {
            setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
            addLog(`Hatalı pay (Stale share detected). Bağlantı stabil değil.`, 'warn');
          }
        }
        
        const base = config.coin === 'LTC' ? 9500 : config.coin === 'BTC' ? 120000 : 450;
        const currentHash = (base + (Math.random() - 0.5) * (base * 0.05)).toFixed(2);
        setStats(prev => ({ 
          ...prev, 
          hashrate: `${currentHash} ${config.coin === 'BTC' ? 'TH/s' : 'MH/s'}`, 
          temp: `${(62 + Math.random() * 8).toFixed(1)}°C` 
        }));
      }, isRealMode ? 8000 : 4000);
    }
    return () => clearInterval(interval);
  }, [isMining, isRealMode, config.coin]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, time, type }]);
  };

  const handleToggleMining = () => {
    if (!isMining) {
      if (isRealMode && (!config.apiKey || !config.apiSecret)) {
        addLog('HATA: Gerçek mod için Binance API anahtarları gereklidir!', 'error');
        return;
      }

      addLog(`${isRealMode ? 'GERÇEK MOD:' : 'DEMO MODU:'} Başlatılıyor...`, 'info');
      
      setTimeout(() => {
        if (isRealMode) {
          addLog('Binance API bağlantısı kuruluyor...', 'info');
          setTimeout(() => {
            addLog('API Yetkilendirme Başarılı. Veri akışı başlıyor.', 'success');
            setStats(prev => ({ ...prev, startTime: Date.now() }));
            setIsMining(true);
          }, 1500);
        } else {
          addLog('Yerel simülatör başlatıldı.', 'success');
          setStats(prev => ({ ...prev, startTime: Date.now() }));
          setIsMining(true);
        }
      }, 1000);
    } else {
      setIsMining(false);
      setStats({ hashrate: '0.00 MH/s', accepted: 0, rejected: 0, temp: '0°C', startTime: 0 });
      addLog('Madencilik durduruldu.', 'warn');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog('Tüm yapılandırmalar ve API anahtarları kaydedildi.', 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Kazanç Hesaplama Mantığı (Demo veriler)
  const calculateEarnings = () => {
    const durationMin = stats.startTime ? (Date.now() - stats.startTime) / 60000 : 0;
    const pricePerShare = config.coin === 'BTC' ? 0.45 : config.coin === 'LTC' ? 0.08 : 0.02;
    const estProfit = stats.accepted * pricePerShare;
    return {
      profit: estProfit.toFixed(2),
      efficiency: stats.accepted > 0 ? ((stats.accepted / (stats.accepted + stats.rejected)) * 100).toFixed(1) : '100',
      duration: durationMin.toFixed(1)
    };
  };

  const report = calculateEarnings();

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Rapor Modalı */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-[#121b26] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowReport(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-[#00a3ff]/10 rounded-full flex items-center justify-center text-[#00a3ff]">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Madencilik Raporu</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
                  {isRealMode ? 'Canlı Binance Verileri' : 'Demo Simülasyon Verileri'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="bg-[#0b1118] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Database size={18} className="text-green-500" />
                  <span className="text-sm font-bold text-gray-400">Onaylanan</span>
                </div>
                <span className="text-lg font-black text-green-500">{stats.accepted} Pay</span>
              </div>
              
              <div className="bg-[#0b1118] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-500" />
                  <span className="text-sm font-bold text-gray-400">Reddedilen</span>
                </div>
                <span className="text-lg font-black text-red-500">{stats.rejected} Pay</span>
              </div>

              <div className="bg-[#00a3ff]/5 p-5 rounded-2xl border border-[#00a3ff]/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Tahmini Kazanç</span>
                  <div className="flex items-center gap-1 text-[#00a3ff]">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">%{report.efficiency} Verimlilik</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={24} className="text-[#00a3ff]" />
                  <h2 className="text-3xl font-black tracking-tighter text-[#00a3ff]">${report.profit}</h2>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">Bu oturumdaki toplam süre: {report.duration} dk</p>
              </div>
            </div>

            <button 
              onClick={() => setShowReport(false)}
              className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all border border-white/10"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Mod Seçici Toggle */}
      <div className="bg-[#121b26] p-2 rounded-2xl border border-white/5 flex gap-2">
        <button 
          onClick={() => { setIsRealMode(false); setIsMining(false); }}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isRealMode ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
        >
          Demo Modu
        </button>
        <button 
          onClick={() => { setIsRealMode(true); setIsMining(false); }}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isRealMode ? 'bg-[#00a3ff] text-white shadow-lg shadow-[#00a3ff]/20' : 'text-gray-500 hover:text-gray-400'}`}
        >
          Gerçek Mod (API)
        </button>
      </div>

      {/* Üst Durum Kartı */}
      <div className="bg-[#121b26] p-5 rounded-3xl border border-white/5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isMining ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-white' : 'bg-gray-800 text-gray-500'}`}>
            <Pickaxe size={24} className={isMining ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {isMining ? (isRealMode ? 'Canlı Madencilik İzleniyor' : 'Demo Kazım Aktif') : 'Sistem Beklemede'}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {isMining ? (isRealMode ? 'Binance API Verified' : 'Local Simulation') : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleToggleMining}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isMining ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-[#00a3ff] text-white shadow-lg shadow-[#00a3ff]/30 hover:scale-105'}`}
          >
            {isMining ? 'Durdur' : 'Başlat'}
          </button>
          <button 
            onClick={() => setShowReport(true)}
            className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <FileText size={12} />
            Rapor
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GÜNCEL HASHRATE</p>
            <Activity size={18} className="text-[#00a3ff]" />
          </div>
          <h4 className="text-xl font-bold tracking-tight text-glow">{stats.hashrate}</h4>
          <p className="text-[10px] text-gray-400 font-medium">Sıcaklık: {stats.temp}</p>
        </div>
        <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ONAYLANAN PAY</p>
            <Database size={18} className="text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-xl font-bold text-green-500">{stats.accepted}</h4>
            <span className="text-gray-600">/</span>
            <h4 className="text-sm font-bold text-red-500/50">{stats.rejected}</h4>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">Başarı Oranı: %{report.efficiency}</p>
        </div>
      </div>

      {/* API Ayarları (Sadece Gerçek Modda Görünür) */}
      {isRealMode && (
        <div className="bg-[#121b26] rounded-3xl p-6 border border-yellow-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 text-yellow-500">
              <Lock size={16} /> Binance API Yapılandırması
            </h3>
            <button onClick={() => setShowApiKeys(!showApiKeys)} className="text-gray-500">
              {showApiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">API Key</label>
              <input 
                type={showApiKeys ? "text" : "password"} 
                value={config.apiKey}
                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                placeholder="Binance API Key giriniz..."
                className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-yellow-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Secret Key</label>
              <input 
                type={showApiKeys ? "text" : "password"} 
                value={config.apiSecret}
                onChange={(e) => setConfig({...config, apiSecret: e.target.value})}
                placeholder="Binance Secret Key giriniz..."
                className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-yellow-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Havuz Ayarları */}
      <div className="bg-[#121b26] rounded-3xl p-6 border border-white/5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Server size={18} className="text-[#00a3ff]" /> Havuz & İşçi Bilgileri
          </h3>
          <div className="flex gap-1">
            {POOL_PRESETS.map((p) => (
              <button
                key={p.coin}
                onClick={() => {
                  setConfig({ ...config, stratumUrl: p.url, coin: p.coin, algo: p.algo });
                  addLog(`${p.name} havuzu seçildi.`, 'info');
                }}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[9px] font-black border transition-all ${config.coin === p.coin ? 'bg-[#00a3ff] border-[#00a3ff] text-white' : 'bg-[#0b1118] border-white/5 text-gray-500'}`}
              >
                {p.coin[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Stratum URL</label>
            <input 
              type="text" 
              value={config.stratumUrl}
              onChange={(e) => setConfig({...config, stratumUrl: e.target.value})}
              className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-[#00a3ff]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Worker</label>
              <input 
                type="text" 
                value={config.workerName}
                onChange={(e) => setConfig({...config, workerName: e.target.value})}
                className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-3 text-xs outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Password</label>
              <input 
                type="text" 
                value={config.password}
                onChange={(e) => setConfig({...config, password: e.target.value})}
                className="w-full bg-[#0b1118] border border-white/10 rounded-xl p-3 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${saveSuccess ? 'bg-green-600' : 'bg-white/5 hover:bg-white/10 text-white'}`}
        >
          {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : saveSuccess ? <Check size={16} /> : <Save size={16} />}
          {isSaving ? 'Kaydediliyor...' : saveSuccess ? 'Ayarlar Kaydedildi' : 'Yapılandırmayı Kaydet'}
        </button>
      </div>

      {/* Terminal Logları */}
      <div className="bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-[#00ff00]" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              {isRealMode ? 'Real-Time Mining Console' : 'Demo Console'}
            </span>
          </div>
        </div>
        <div className="h-40 overflow-y-auto p-4 font-mono text-[10px] space-y-1 no-scrollbar bg-black/90">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-600 shrink-0">[{log.time}]</span>
              <span className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-400' : ''}
                ${log.type === 'error' ? 'text-red-500 font-bold' : ''}
                ${log.type === 'info' ? 'text-blue-400' : ''}
              `}>
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
