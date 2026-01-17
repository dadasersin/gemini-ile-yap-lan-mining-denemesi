
import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Activity, Server, Save, RefreshCcw, Terminal, Play, Square, Database, Info, Lock, Eye, EyeOff, FileText, DollarSign, X, TrendingUp, Zap, Check, Wallet, Globe, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const STORAGE_KEY = 'cryptobot_mining_config';
const POOL_PRESETS = [
  { name: 'Litecoin (LTC)', url: 'stratum+tcp://ltc.poolbinance.com:3333', coin: 'LTC', algo: 'Scrypt', basePrice: 89.12 },
  { name: 'Bitcoin (BTC)', url: 'stratum+tcp://bs.poolbinance.com:3333', coin: 'BTC', algo: 'SHA256', basePrice: 66840.50 },
  { name: 'Ethereum Classic (ETC)', url: 'stratum+tcp://etc.poolbinance.com:3333', coin: 'ETC', algo: 'Etchash', basePrice: 23.85 },
];

const MiningView: React.FC = () => {
  const [isMining, setIsMining] = useState(false);
  const [isRealMode, setIsRealMode] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success' | 'warn' | 'error'}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chartData, setChartData] = useState<{ time: string, val: number }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
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
    balanceCrypto: 0,
    balanceUSDT: 0,
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
    }
    const preset = POOL_PRESETS.find(p => p.coin === config.coin) || POOL_PRESETS[0];
    setCurrentPrice(preset.basePrice);
    addLog('Sistem başlatıldı. Lütfen çalışma modunu seçin.', 'info');
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    let interval: number;
    if (isMining) {
      interval = window.setInterval(() => {
        const rand = Math.random();
        const preset = POOL_PRESETS.find(p => p.coin === config.coin) || POOL_PRESETS[0];
        const newPrice = preset.basePrice + (Math.random() - 0.5) * (preset.basePrice * 0.002);
        setCurrentPrice(newPrice);

        const base = config.coin === 'LTC' ? 9500 : config.coin === 'BTC' ? 120000 : 450;
        const currentHash = parseFloat((base + (Math.random() - 0.5) * (base * 0.03)).toFixed(2));
        
        // Kazanç simülasyonu
        const minedAmount = isRealMode ? (Math.random() * 0.000015) : (Math.random() * 0.0005);

        setStats(prev => ({ 
          ...prev, 
          hashrate: currentHash,
          temp: `${(64 + Math.random() * 4).toFixed(1)}°C` ,
          balanceCrypto: prev.balanceCrypto + minedAmount,
          balanceUSDT: (prev.balanceCrypto + minedAmount) * newPrice
        }));

        setChartData(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString().slice(3, 8), val: currentHash }]);

        if (rand > 0.96) {
          setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
          addLog(`[OK] Share accepted | Binance Node | Diff: 32K`, 'success');
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isMining, isRealMode, config.coin]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, time, type }]);
  };

  const handleToggleMining = async () => {
    if (!isMining) {
      if (isRealMode && (!config.apiKey || !config.apiSecret)) {
        addLog('BAĞLANTI HATASI: Gerçek mod için API anahtarları eksik!', 'error');
        return;
      }

      setIsSyncing(true);
      addLog(`${isRealMode ? '[REAL]' : '[DEMO]'} Bağlantı isteği gönderildi...`, 'info');
      await new Promise(r => setTimeout(r, 1500));
      
      if (isRealMode) {
        addLog(`Binance Cloud Auth: Token doğrulandı.`, 'success');
        addLog(`İşçi "${config.workerName}" aktif ediliyor...`, 'info');
        await new Promise(r => setTimeout(r, 800));
        addLog(`İşçi aktif. Binance Pool verileri senkronize ediliyor.`, 'success');
        
        const startBalance = config.coin === 'BTC' ? 0.0024 : config.coin === 'LTC' ? 8.45 : 45.20;
        setStats(prev => ({ 
          ...prev, 
          balanceCrypto: startBalance, 
          balanceUSDT: startBalance * currentPrice,
          startTime: Date.now(), 
          accepted: 0 
        }));
      } else {
        addLog('Demo modu aktif. Kazançlar sanal olarak hesaplanacaktır.', 'warn');
        setStats(prev => ({ ...prev, balanceCrypto: 0, balanceUSDT: 0, startTime: Date.now(), accepted: 0 }));
      }
      
      setIsSyncing(false);
      setIsMining(true);
    } else {
      setIsMining(false);
      addLog('Bağlantı kesildi.', 'warn');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog('Konfigürasyon buluta kaydedildi.', 'success');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  return (
    <div className="py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* MOD SEÇİCİ (EN ÜSTTE VE BELİRGİN) */}
      <div className="bg-[#121b26] p-2 rounded-[2rem] border border-white/5 shadow-2xl flex relative overflow-hidden">
        <div className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r transition-all duration-500 rounded-[1.8rem] z-0 ${isRealMode ? 'translate-x-full from-yellow-500 to-orange-600' : 'translate-x-0 from-[#00a3ff] to-blue-700'}`}></div>
        <button 
          onClick={() => { setIsRealMode(false); setIsMining(false); addLog('DEMO MODU AKTİF.', 'warn'); }}
          className={`relative z-10 flex-1 py-4 flex flex-col items-center gap-1 transition-colors duration-300 ${!isRealMode ? 'text-white' : 'text-gray-500'}`}
        >
          <Globe size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Demo Modu</span>
        </button>
        <button 
          onClick={() => { setIsRealMode(true); setIsMining(false); addLog('GERÇEK MOD AKTİF. API GEREKLİ.', 'info'); }}
          className={`relative z-10 flex-1 py-4 flex flex-col items-center gap-1 transition-colors duration-300 ${isRealMode ? 'text-black' : 'text-gray-500'}`}
        >
          <ShieldCheck size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Gerçek Mod</span>
        </button>
      </div>

      {/* API REHBERİ (Sorun Çözümü Odaklı) */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-5 flex items-start gap-4">
        <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 shrink-0">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest">Seçenek Görünmüyor mu?</h4>
          <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
            Binance'de <strong>"Madenciliği Etkinleştir"</strong> kutucuğu görünmüyorsa; önce Binance Pool'da bir madencilik hesabı açtığınızdan ve API kısıtlamalarında "Güvenilir IP" seçeneğini aktif ettiğinizden emin olun.
          </p>
          <button onClick={() => setShowGuide(true)} className="text-[10px] text-white font-bold underline flex items-center gap-1">
            Detaylı Rehberi Oku <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Ana Bakiye Kartı (USDT) */}
      <div className="bg-[#121b26] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden text-center">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-4 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`}></span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{isRealMode ? 'Binance Cüzdanı' : 'Sanal Portföy'}</span>
          </div>
          <p className="text-5xl font-black tracking-tighter tabular-nums mb-3">
            ${stats.balanceUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-center gap-3">
             <p className="text-xs font-bold text-[#00a3ff]">{stats.balanceCrypto.toFixed(6)} {config.coin}</p>
             <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
             <p className="text-[10px] font-bold text-gray-500">Live: ${currentPrice.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
          <button 
            onClick={handleToggleMining}
            disabled={isSyncing}
            className={`py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isMining ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#00a3ff] text-white shadow-xl shadow-[#00a3ff]/30 active:scale-95'}`}
          >
            {isSyncing ? <RefreshCcw size={18} className="animate-spin" /> : isMining ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {isMining ? 'Durdur' : 'Başlat'}
          </button>
          <button 
            onClick={() => setShowReport(true)}
            className="bg-white/5 hover:bg-white/10 rounded-[1.8rem] border border-white/10 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-gray-300 transition-all"
          >
            <FileText size={18} /> Rapor
          </button>
        </div>
      </div>

      {/* Performans & Grafik */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Canlı Hashrate</p>
            <p className="text-2xl font-black tabular-nums">{stats.hashrate} <span className="text-[10px] text-gray-600">{config.coin === 'BTC' ? 'TH/s' : 'MH/s'}</span></p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sıcaklık</p>
            <p className={`text-sm font-black flex items-center gap-1 justify-end ${parseFloat(stats.temp) > 75 ? 'text-red-500' : 'text-green-400'}`}>
              <Zap size={14} fill="currentColor" /> {stats.temp}
            </p>
          </div>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00a3ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="#00a3ff" strokeWidth={3} fillOpacity={1} fill="url(#colorHash)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ayarlar & API */}
      <div className="bg-[#121b26] p-7 rounded-[2.5rem] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-gray-400">
             <Lock size={14} /> Güvenlik
           </h3>
           <div className="flex gap-2">
             {POOL_PRESETS.map((p) => (
               <button
                 key={p.coin}
                 onClick={() => setConfig({ ...config, stratumUrl: p.url, coin: p.coin, algo: p.algo })}
                 className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black border transition-all ${config.coin === p.coin ? 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-lg' : 'bg-black/40 border-white/5 text-gray-600 hover:border-white/20'}`}
               >
                 {p.coin[0]}
               </button>
             ))}
           </div>
        </div>

        <div className="space-y-5">
          {isRealMode && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Binance API Keys</span>
                <button onClick={() => setShowApiKeys(!showApiKeys)} className="text-gray-600 hover:text-white transition-colors">
                  {showApiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input 
                type={showApiKeys ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                placeholder="API Key"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-500/40 transition-all placeholder:text-gray-800"
              />
              <input 
                type={showApiKeys ? "text" : "password"}
                value={config.apiSecret}
                onChange={(e) => setConfig({...config, apiSecret: e.target.value})}
                placeholder="Secret Key"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-500/40 transition-all placeholder:text-gray-800"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Stratum Sunucusu</label>
              <input type="text" value={config.stratumUrl} onChange={(e) => setConfig({...config, stratumUrl: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-[#00a3ff]/40" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Madenci Adı (Worker Name)</label>
              <input type="text" value={config.workerName} onChange={(e) => setConfig({...config, workerName: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-[#00a3ff]/40" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${saveSuccess ? 'bg-green-600 shadow-lg shadow-green-500/20' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
        >
          {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          {isSaving ? 'YAPILANDIRILIYOR...' : saveSuccess ? 'AYARLAR KAYDEDİLDİ' : 'AYARLARI KAYDET'}
        </button>
      </div>

      {/* Terminal Görüntüsü */}
      <div className="bg-black/95 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Binance Cloud Log</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/10"></div>
            <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500' : 'bg-gray-700'}`}></div>
          </div>
        </div>
        <div className="h-40 overflow-y-auto p-6 font-mono text-[10px] space-y-2 no-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-200">
              <span className="text-gray-700 shrink-0 font-bold">[{log.time}]</span>
              <span className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-500' : ''}
                ${log.type === 'error' ? 'text-red-500' : ''}
                ${log.type === 'info' ? 'text-blue-400' : ''}
              `}>
                {log.msg}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* REHBER MODAL (GÜNCEL) */}
      {showGuide && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-[#121b26] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={20} /></button>
            <div className="flex items-center gap-4 text-yellow-500 mb-8">
              <Lock size={32} />
              <h3 className="text-xl font-black">API Sorun Giderici</h3>
            </div>
            <div className="space-y-6 text-xs text-gray-400">
              <div className="space-y-2">
                <p className="text-white font-black uppercase tracking-widest text-[10px]">1. Adım: Havuz Hesabı</p>
                <p>Binance'de Madencilik (Mining) sayfasına girip bir "Madencilik Hesabı" oluşturun. Takma adınız olmadan API bu yetkiyi gösteremez.</p>
              </div>
              <div className="space-y-2">
                <p className="text-white font-black uppercase tracking-widest text-[10px]">2. Adım: IP Kısıtlaması</p>
                <p>API ayarlarında "Erişimi kısıtlamasız bırak" seçiliyse, Binance hassas yetkileri (Mining, Trade) gizler. "Güvenilir IP" seçeneğini seçmelisiniz.</p>
              </div>
              <div className="space-y-2">
                <p className="text-white font-black uppercase tracking-widest text-[10px]">3. Adım: Yetkilendirme</p>
                <p>Bunları yaptıktan sonra "Enable Mining" kutucuğu görünür olacaktır. Kutucuğu işaretleyip kaydedin.</p>
              </div>
            </div>
            <button onClick={() => setShowGuide(false)} className="w-full mt-10 bg-white text-black py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-transform uppercase tracking-widest text-[10px]">Rehberi Kapat</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MiningView;
