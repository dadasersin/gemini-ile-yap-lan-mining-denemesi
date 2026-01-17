
import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Activity, Server, Save, RefreshCcw, Terminal, Play, Square, Database, Info, Lock, Eye, EyeOff, FileText, DollarSign, X, TrendingUp, Zap, Check, Wallet, Globe, ShieldCheck, AlertCircle, ChevronRight, Cpu, Layers, MapPin, Network } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const STORAGE_KEY = 'cryptobot_mining_config';

// Havuz ve Sunucu Veri Yapısı
const MINING_DATA = [
  { 
    id: 'VRSC', 
    name: 'VerusCoin', 
    algo: 'VerusHash', 
    basePrice: 3.48,
    providers: [
      {
        id: 'luckpool',
        name: 'LuckPool',
        officialUrl: 'luckpool.net',
        fee: '1%',
        servers: [
          { id: 'eu', name: 'Avrupa', url: 'stratum+tcp://eu.luckpool.net:3956', ping: '45ms' },
          { id: 'na', name: 'K. Amerika', url: 'stratum+tcp://na.luckpool.net:3956', ping: '120ms' },
          { id: 'ap', name: 'Asya', url: 'stratum+tcp://ap.luckpool.net:3956', ping: '240ms' }
        ]
      },
      {
        id: 'zergpool',
        name: 'ZergPool',
        officialUrl: 'zergpool.com',
        fee: '0.5%',
        servers: [
          { id: 'auto', name: 'Otomatik (Global)', url: 'stratum+tcp://verushash.mine.zergpool.com:3300', ping: 'Auto' }
        ]
      }
    ]
  },
  { 
    id: 'LTC', 
    name: 'Litecoin', 
    algo: 'Scrypt', 
    basePrice: 88.40,
    providers: [
      {
        id: 'binance',
        name: 'Binance Pool',
        officialUrl: 'pool.binance.com',
        fee: '0.6%',
        servers: [
          { id: 'global', name: 'Global Node', url: 'stratum+tcp://ltc.poolbinance.com:3333', ping: '20ms' }
        ]
      },
      {
        id: 'f2pool',
        name: 'F2Pool',
        officialUrl: 'f2pool.com',
        fee: '2%',
        servers: [
          { id: 'eu', name: 'EU Server', url: 'stratum+tcp://ltc.f2pool.com:8888', ping: '35ms' }
        ]
      }
    ]
  }
];

const MiningView: React.FC = () => {
  const [isMining, setIsMining] = useState(false);
  const [isRealMode, setIsRealMode] = useState(false);
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success' | 'warn' | 'error'}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chartData, setChartData] = useState<{ time: string, val: number }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Gelişmiş Konfigürasyon State
  const [config, setConfig] = useState({
    coinId: MINING_DATA[0].id,
    providerId: MINING_DATA[0].providers[0].id,
    serverId: MINING_DATA[0].providers[0].servers[0].id,
    stratumUrl: MINING_DATA[0].providers[0].servers[0].url,
    workerName: 'serkan.mobile',
    algo: MINING_DATA[0].algo,
  });

  const [stats, setStats] = useState({
    hashrate: 0,
    accepted: 0,
    temp: '0°C',
    balanceCrypto: 0,
    balanceUSDT: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setConfig(parsed);
    }
    const coin = MINING_DATA.find(c => c.id === config.coinId) || MINING_DATA[0];
    setCurrentPrice(coin.basePrice);
    addLog(`Sistem Hazır. Havuz: ${config.providerId.toUpperCase()}`, 'info');
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Madencilik Simülasyonu
  useEffect(() => {
    let interval: number;
    if (isMining) {
      interval = window.setInterval(() => {
        const coin = MINING_DATA.find(c => c.id === config.coinId) || MINING_DATA[0];
        const newPrice = coin.basePrice + (Math.random() - 0.5) * 0.05;
        setCurrentPrice(newPrice);

        let baseHash = config.coinId === 'VRSC' ? 5.2 : 9800;
        const currentHash = parseFloat((baseHash + (Math.random() - 0.5) * 0.5).toFixed(2));
        const mined = isRealMode ? (Math.random() * 0.00005) : (Math.random() * 0.01);

        setStats(prev => ({ 
          ...prev, 
          hashrate: currentHash,
          temp: `${(62 + Math.random() * 5).toFixed(1)}°C` ,
          balanceCrypto: prev.balanceCrypto + mined,
          balanceUSDT: (prev.balanceCrypto + mined) * newPrice
        }));

        setChartData(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString().slice(3, 8), val: currentHash }]);

        if (Math.random() > 0.95) {
          setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
          addLog(`[PAY] Kabul Edildi: ${config.stratumUrl.split('//')[1]}`, 'success');
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isMining, config, isRealMode]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, time, type }]);
  };

  const handleToggleMining = async () => {
    if (!isMining) {
      setIsSyncing(true);
      addLog(`${config.coinId} için ${config.providerId} havuzuna bağlanılıyor...`, 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog(`Bölge: ${config.serverId.toUpperCase()} sunucusu aktif.`, 'success');
      setIsSyncing(false);
      setIsMining(true);
    } else {
      setIsMining(false);
      addLog('Madenci durduruldu.', 'warn');
    }
  };

  const updateCoin = (coinId: string) => {
    const coin = MINING_DATA.find(c => c.id === coinId)!;
    const provider = coin.providers[0];
    const server = provider.servers[0];
    setConfig({
      ...config,
      coinId,
      algo: coin.algo,
      providerId: provider.id,
      serverId: server.id,
      stratumUrl: server.url
    });
    setCurrentPrice(coin.basePrice);
    addLog(`${coin.name} seçildi.`, 'info');
  };

  const updateProvider = (providerId: string) => {
    const coin = MINING_DATA.find(c => c.id === config.coinId)!;
    const provider = coin.providers.find(p => p.id === providerId)!;
    const server = provider.servers[0];
    setConfig({
      ...config,
      providerId,
      serverId: server.id,
      stratumUrl: server.url
    });
    addLog(`Havuz değiştirildi: ${provider.name}`, 'info');
  };

  const updateServer = (serverId: string) => {
    const coin = MINING_DATA.find(c => c.id === config.coinId)!;
    const provider = coin.providers.find(p => p.id === config.providerId)!;
    const server = provider.servers.find(s => s.id === serverId)!;
    setConfig({ ...config, serverId, stratumUrl: server.url });
    addLog(`Sunucu/Bölge güncellendi: ${server.name}`, 'info');
  };

  const activeCoin = MINING_DATA.find(c => c.id === config.coinId)!;
  const activeProvider = activeCoin.providers.find(p => p.id === config.providerId)!;

  return (
    <div className="py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Demo/Gerçek Şalteri */}
      <div className="bg-[#121b26] p-1.5 rounded-[2rem] border border-white/5 shadow-2xl flex relative overflow-hidden">
        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r transition-all duration-500 rounded-[1.8rem] z-0 ${isRealMode ? 'translate-x-[calc(100%+6px)] from-yellow-500 to-orange-600' : 'translate-x-0 from-[#00a3ff] to-blue-700'}`}></div>
        <button onClick={() => setIsRealMode(false)} className={`relative z-10 flex-1 py-3.5 flex flex-col items-center gap-1 transition-colors ${!isRealMode ? 'text-white' : 'text-gray-500'}`}>
          <Globe size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Demo Modu</span>
        </button>
        <button onClick={() => setIsRealMode(true)} className={`relative z-10 flex-1 py-3.5 flex flex-col items-center gap-1 transition-colors ${isRealMode ? 'text-black' : 'text-gray-500'}`}>
          <ShieldCheck size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Gerçek Mod</span>
        </button>
      </div>

      {/* Ana Bakiye Kartı */}
      <div className="bg-[#121b26] p-8 rounded-[3rem] border border-white/5 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00a3ff]/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-5xl font-black tracking-tighter tabular-nums mb-3">
            ${stats.balanceUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-center gap-2">
             <span className="text-xs font-bold text-[#00a3ff]">{stats.balanceCrypto.toFixed(6)} {config.coinId}</span>
             <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market: ${currentPrice.toFixed(2)}</span>
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
            <FileText size={18} /> Rapor
          </button>
        </div>
      </div>

      {/* ADIM 1: COIN SEÇİMİ */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">1. Madencilik Varılğı</h3>
        <div className="flex gap-2.5">
          {MINING_DATA.map((c) => (
            <button
              key={c.id}
              onClick={() => updateCoin(c.id)}
              className={`flex-1 py-4 rounded-2xl border transition-all flex flex-col items-center gap-1 ${config.coinId === c.id ? 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-lg shadow-[#00a3ff]/20' : 'bg-black/40 border-white/5 text-gray-500'}`}
            >
              <span className="text-sm font-black">{c.id}</span>
              <span className="text-[8px] font-bold opacity-60 uppercase">{c.algo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ADIM 2: HAVUZ (POOL) SAĞLAYICISI */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">2. Havuz Sağlayıcısı</h3>
          <span className="text-[9px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">Resmi Destek</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {activeCoin.providers.map((p) => (
            <button
              key={p.id}
              onClick={() => updateProvider(p.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.providerId === p.id ? 'bg-white/5 border-[#00a3ff] text-white shadow-inner' : 'bg-black/20 border-white/5 text-gray-500 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${config.providerId === p.id ? 'bg-[#00a3ff] text-white' : 'bg-white/5'}`}>
                  <Layers size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black">{p.name}</p>
                  <p className="text-[9px] opacity-50 font-bold">{p.officialUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">FEE: {p.fee}</span>
                {config.providerId === p.id && <Check size={14} className="text-[#00a3ff]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ADIM 3: BÖLGE VE SUNUCU SEÇİMİ */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">3. Sunucu Bölgesi</h3>
          <div className="flex items-center gap-1 text-[9px] text-gray-600 font-bold">
            <Network size={10} /> Latency (Gecikme)
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeProvider.servers.map((s) => (
            <button
              key={s.id}
              onClick={() => updateServer(s.id)}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${config.serverId === s.id ? 'bg-[#00a3ff]/10 border-[#00a3ff] text-[#00a3ff]' : 'bg-black/40 border-white/5 text-gray-600 hover:border-white/10'}`}
            >
              <MapPin size={12} />
              <div className="text-left">
                <p className="text-[10px] font-black">{s.name}</p>
                <p className="text-[8px] font-bold opacity-60 uppercase">{s.ping}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Yapılandırma Formu */}
      <div className="bg-[#121b26] p-7 rounded-[2.5rem] border border-white/5 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Stratum Bağlantısı</label>
          <div className="relative group">
            <input 
              type="text" 
              readOnly 
              value={config.stratumUrl} 
              className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-gray-400 outline-none" 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-[8px] font-black text-gray-700 group-hover:text-gray-500 transition-colors uppercase">ReadOnly</span>
              <Lock size={12} className="text-gray-700" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
            {config.coinId === 'VRSC' ? 'Cüzdan Adresi (LuckPool)' : 'İşçi Adı (Worker)'}
          </label>
          <input 
            type="text" 
            value={config.workerName} 
            onChange={(e) => setConfig({...config, workerName: e.target.value})} 
            placeholder="Adresinizi buraya girin..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-[#00a3ff]/40 text-white placeholder:text-gray-800 transition-all" 
          />
        </div>

        <button 
          onClick={() => {
            setIsSaving(true);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            setTimeout(() => { setIsSaving(false); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000); }, 1000);
          }}
          className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${saveSuccess ? 'bg-green-600 shadow-xl shadow-green-600/20' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
        >
          {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          {isSaving ? 'Yükleniyor...' : 'Ayarları Kaydet'}
        </button>
      </div>

      {/* Konsol / Log Ekranı */}
      <div className="bg-black/95 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mining Console</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`}></div>
        </div>
        <div className="h-40 overflow-y-auto p-6 font-mono text-[10px] space-y-2 no-scrollbar bg-black/50">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in slide-in-from-left-2">
              <span className="text-gray-700 shrink-0">[{log.time}]</span>
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
