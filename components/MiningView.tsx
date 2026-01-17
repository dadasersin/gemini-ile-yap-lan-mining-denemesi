
import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Activity, Server, Save, RefreshCcw, Terminal, Play, Square, Database, Info, Lock, Eye, EyeOff, FileText, DollarSign, X, TrendingUp, Zap, Check, Wallet, Globe, ShieldCheck, AlertCircle, ChevronRight, Cpu, Layers, MapPin } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const STORAGE_KEY = 'cryptobot_mining_config';

// Genişletilmiş Havuz Verileri
const COINS = [
  { 
    id: 'VRSC', 
    name: 'VerusCoin', 
    algo: 'VerusHash', 
    basePrice: 3.45,
    pools: [
      { name: 'LuckPool (Avrupa)', url: 'stratum+tcp://eu.luckpool.net:3956', region: 'EU', fee: '%1' },
      { name: 'LuckPool (K. Amerika)', url: 'stratum+tcp://na.luckpool.net:3956', region: 'NA', fee: '%1' },
      { name: 'LuckPool (Asya)', url: 'stratum+tcp://ap.luckpool.net:3956', region: 'AP', fee: '%1' },
      { name: 'ZergPool', url: 'stratum+tcp://verushash.mine.zergpool.com:3300', region: 'Auto', fee: '%0.5' },
    ]
  },
  { 
    id: 'LTC', 
    name: 'Litecoin', 
    algo: 'Scrypt', 
    basePrice: 89.12,
    pools: [
      { name: 'Binance Pool', url: 'stratum+tcp://ltc.poolbinance.com:3333', region: 'Global', fee: '%0.6' },
      { name: 'F2Pool', url: 'stratum+tcp://ltc.f2pool.com:8888', region: 'Global', fee: '%2' },
      { name: 'LitecoinPool', url: 'stratum+tcp://litecoinpool.org:3333', region: 'Global', fee: '%0' },
    ]
  },
  { 
    id: 'BTC', 
    name: 'Bitcoin', 
    algo: 'SHA256', 
    basePrice: 66840.50,
    pools: [
      { name: 'Binance Pool', url: 'stratum+tcp://bs.poolbinance.com:3333', region: 'Global', fee: '%2.5' },
      { name: 'NiceHash', url: 'stratum+tcp://sha256.eu-west.nicehash.com:3334', region: 'EU', fee: '%2' },
      { name: 'SlushPool', url: 'stratum+tcp://stratum.slushpool.com:3333', region: 'Global', fee: '%2' },
    ]
  }
];

const MiningView: React.FC = () => {
  const [isMining, setIsMining] = useState(false);
  const [isRealMode, setIsRealMode] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success' | 'warn' | 'error'}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chartData, setChartData] = useState<{ time: string, val: number }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState({
    stratumUrl: COINS[0].pools[0].url,
    workerName: 'serkan.mobile',
    password: 'x',
    coin: COINS[0].id,
    algo: COINS[0].algo,
    poolName: COINS[0].pools[0].name,
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
    const coinData = COINS.find(c => c.id === config.coin) || COINS[0];
    setCurrentPrice(coinData.basePrice);
    addLog(`Madencilik kontrol paneli hazır. (${config.coin})`, 'info');
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    let interval: number;
    if (isMining) {
      interval = window.setInterval(() => {
        const rand = Math.random();
        const coinData = COINS.find(c => c.id === config.coin) || COINS[0];
        const newPrice = coinData.basePrice + (Math.random() - 0.5) * (coinData.basePrice * 0.002);
        setCurrentPrice(newPrice);

        let base = config.coin === 'VRSC' ? 4.8 : config.coin === 'BTC' ? 125000 : 9200;
        const currentHash = parseFloat((base + (Math.random() - 0.5) * (base * 0.04)).toFixed(2));
        const minedAmount = isRealMode ? (Math.random() * 0.00002) : (Math.random() * 0.005);

        setStats(prev => ({ 
          ...prev, 
          hashrate: currentHash,
          temp: `${(60 + Math.random() * 10).toFixed(1)}°C` ,
          balanceCrypto: prev.balanceCrypto + minedAmount,
          balanceUSDT: (prev.balanceCrypto + minedAmount) * newPrice
        }));

        setChartData(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString().slice(3, 8), val: currentHash }]);

        if (rand > 0.93) {
          setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
          addLog(`[OK] Share Accepted | ${config.poolName} | Diff: Auto`, 'success');
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isMining, isRealMode, config.coin, config.poolName]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, time, type }]);
  };

  const handleToggleMining = async () => {
    if (!isMining) {
      if (isRealMode && config.coin !== 'VRSC' && (!config.apiKey || !config.apiSecret)) {
        addLog('HATA: Binance API anahtarları gereklidir!', 'error');
        return;
      }
      setIsSyncing(true);
      addLog(`${config.poolName} sunucusuna bağlanılıyor...`, 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog(`Algoritma ${config.algo} doğrulandı.`, 'success');
      addLog(`İşçi ${config.workerName} oturum açtı.`, 'success');
      setIsSyncing(false);
      setIsMining(true);
    } else {
      setIsMining(false);
      addLog('Madenci durduruldu.', 'warn');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog('Yeni havuz yapılandırması kaydedildi.', 'success');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  const selectCoin = (coinId: string) => {
    const coinData = COINS.find(c => c.id === coinId) || COINS[0];
    setConfig({
      ...config,
      coin: coinId,
      algo: coinData.algo,
      stratumUrl: coinData.pools[0].url,
      poolName: coinData.pools[0].name
    });
    setCurrentPrice(coinData.basePrice);
    addLog(`${coinData.name} seçildi. Lütfen bir havuz seçin.`, 'info');
  };

  const selectPool = (pool: any) => {
    setConfig({
      ...config,
      stratumUrl: pool.url,
      poolName: pool.name
    });
    addLog(`${pool.name} havuzu aktif edildi.`, 'success');
  };

  const selectedCoinData = COINS.find(c => c.id === config.coin) || COINS[0];

  return (
    <div className="py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* MOD SEÇİCİ */}
      <div className="bg-[#121b26] p-2 rounded-[2rem] border border-white/5 shadow-2xl flex relative overflow-hidden">
        <div className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r transition-all duration-500 rounded-[1.8rem] z-0 ${isRealMode ? 'translate-x-full from-yellow-500 to-orange-600' : 'translate-x-0 from-[#00a3ff] to-blue-700'}`}></div>
        <button 
          onClick={() => { setIsRealMode(false); setIsMining(false); }}
          className={`relative z-10 flex-1 py-4 flex flex-col items-center gap-1 transition-colors duration-300 ${!isRealMode ? 'text-white' : 'text-gray-500'}`}
        >
          <Globe size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Demo Modu</span>
        </button>
        <button 
          onClick={() => { setIsRealMode(true); setIsMining(false); }}
          className={`relative z-10 flex-1 py-4 flex flex-col items-center gap-1 transition-colors duration-300 ${isRealMode ? 'text-black' : 'text-gray-500'}`}
        >
          <ShieldCheck size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Gerçek Mod</span>
        </button>
      </div>

      {/* Bakiye Kartı */}
      <div className="bg-[#121b26] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-6 opacity-10">
           <Pickaxe size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-5xl font-black tracking-tighter tabular-nums mb-3">
            ${stats.balanceUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-center gap-3">
             <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
               <span className="text-xs font-bold text-[#00a3ff]">{stats.balanceCrypto.toFixed(6)} {config.coin}</span>
             </div>
             <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
             <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Live: ${currentPrice.toLocaleString()}</p>
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
          <button className="bg-white/5 hover:bg-white/10 rounded-[1.8rem] border border-white/10 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-gray-300 transition-all">
            <FileText size={18} /> Veriler
          </button>
        </div>
      </div>

      {/* Coin ve Havuz Seçme Bölümü */}
      <div className="bg-[#121b26] p-7 rounded-[2.5rem] border border-white/5 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">1. Coin Seçimi</h3>
          </div>
          <div className="flex gap-2.5">
            {COINS.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCoin(c.id)}
                className={`flex-1 py-4 flex flex-col items-center gap-2 rounded-2xl border transition-all ${config.coin === c.id ? 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-lg' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/10'}`}
              >
                <span className="text-xs font-black">{c.id}</span>
                <span className="text-[8px] opacity-60 uppercase font-bold tracking-tighter">{c.algo}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">2. Havuz (Pool) Seçimi</h3>
             <span className="text-[9px] font-bold text-[#00a3ff]">{selectedCoinData.pools.length} Seçenek</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {selectedCoinData.pools.map((p, idx) => (
              <button
                key={idx}
                onClick={() => selectPool(p)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.poolName === p.name ? 'bg-white/5 border-[#00a3ff] text-white' : 'bg-black/20 border-white/5 text-gray-500 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.poolName === p.name ? 'bg-[#00a3ff] text-white' : 'bg-white/5'}`}>
                    <Layers size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black">{p.name}</p>
                    <p className="text-[9px] opacity-50 flex items-center gap-1 font-bold"><MapPin size={8}/> {p.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-[#00ff00] bg-green-500/10 px-2 py-0.5 rounded-md">FEE: {p.fee}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-white/5">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Stratum Adresi</label>
              <div className="relative">
                <input type="text" readOnly value={config.stratumUrl} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-gray-400 outline-none" />
                <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">{config.coin === 'VRSC' ? 'Cüzdan Adresi' : 'Worker Name'}</label>
              <input type="text" value={config.workerName} onChange={(e) => setConfig({...config, workerName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-[#00a3ff]/40 text-white" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${saveSuccess ? 'bg-green-600 shadow-xl shadow-green-600/20' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
        >
          {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          {isSaving ? 'Kaydediliyor...' : 'Yapılandırmayı Onayla'}
        </button>
      </div>

      {/* Hashrate Grafik */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hashrate Gücü</p>
            <p className="text-2xl font-black tabular-nums">{stats.hashrate} <span className="text-[10px] text-gray-600">{config.coin === 'VRSC' ? 'MH/s' : config.coin === 'BTC' ? 'TH/s' : 'MH/s'}</span></p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sıcaklık</p>
            <p className={`text-sm font-black flex items-center gap-1 justify-end ${parseFloat(stats.temp) > 72 ? 'text-red-500' : 'text-green-400'}`}>
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

      {/* Terminal */}
      <div className="bg-black/95 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mining Console</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
        </div>
        <div className="h-40 overflow-y-auto p-6 font-mono text-[10px] space-y-2 no-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-200">
              <span className="text-gray-700 shrink-0 font-bold">[{log.time}]</span>
              <span className={log.type === 'success' ? 'text-green-400' : log.type === 'warn' ? 'text-yellow-500' : log.type === 'error' ? 'text-red-500' : 'text-blue-400'}>
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
