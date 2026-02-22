
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Pickaxe, RefreshCcw, Terminal, Play, Square, FileText, Lock, Globe, ShieldCheck, Zap, Check, Save, Layers, MapPin, Network, Cpu } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { saveMiningLog } from '../supabase';

const STORAGE_KEY = 'cryptobot_mining_config_v2';

const MINING_DATA = [
  {
    id: 'VRSC',
    name: 'VerusCoin',
    algo: 'VerusHash',
    basePrice: 3.48,
    unit: 'MH/s',
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
    unit: 'MH/s',
    providers: [
      {
        id: 'binance',
        name: 'Binance Pool',
        officialUrl: 'pool.binance.com',
        fee: '0.6%',
        servers: [
          { id: 'global', name: 'Global Node', url: 'stratum+tcp://ltc.poolbinance.com:3333', ping: '20ms' }
        ]
      }
    ]
  }
];

const MiningView: React.FC = () => {
  const [isMining, setIsMining] = useState(false);
  const [isRealMode, setIsRealMode] = useState(false);
  const [logs, setLogs] = useState<{ msg: string, time: string, type: 'info' | 'success' | 'warn' | 'error' }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chartData, setChartData] = useState<{ time: string, val: number }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<{ cores: any, memory: any, platform: any, ip: string } | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Başlangıç Ayarları
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      coinId: MINING_DATA[0].id,
      providerId: MINING_DATA[0].providers[0].id,
      serverId: MINING_DATA[0].providers[0].servers[0].id,
      stratumUrl: MINING_DATA[0].providers[0].servers[0].url,
      workerName: 'RTDTYfTX9a8DdAfr9won6DspWxxobgxE21.mobile',
      algo: MINING_DATA[0].algo,
      supabaseUrl: localStorage.getItem('VITE_SUPABASE_URL') || '',
    };
  });

  const [stats, setStats] = useState({
    hashrate: 0,
    accepted: 0,
    temp: '0°C',
    balanceCrypto: 0,
    balanceUSDT: 0,
  });

  // Log Ekleme Fonksiyonu
  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, time, type }]);
  };

  useEffect(() => {
    const coin = MINING_DATA.find(c => c.id === config.coinId) || MINING_DATA[0];
    setCurrentPrice(coin.basePrice);
    if (logs.length === 0) {
      addLog(`Sistem başlatıldı. ${config.coinId} madenciliği için hazır.`, 'info');
    }
  }, [config.coinId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Madencilik Simülasyon Döngüsü (Artık sadece UI değerlerini günceller)
  useEffect(() => {
    let interval: number | null = null;

    if (isMining) {
      interval = window.setInterval(() => {
        // Fiyat Dalgalanması
        setCurrentPrice(prev => prev + (Math.random() - 0.5) * 0.01);

        setStats(prev => ({
          ...prev,
          temp: `${(55 + Math.random() * 12).toFixed(1)}°C`,
          balanceUSDT: prev.balanceCrypto * currentPrice
        }));

        setChartData(prev => [...prev.slice(-19), {
          time: new Date().toLocaleTimeString().slice(3, 8),
          val: stats.hashrate
        }]);
      }, 5000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [isMining, currentPrice, stats.hashrate, stats.balanceCrypto]);

  // Supabase Veri Kaydı
  useEffect(() => {
    let logInterval: any = null;
    if (isMining && isRealMode) {
      logInterval = setInterval(() => {
        saveMiningLog({
          hashrate: stats.hashrate,
          accepted: stats.accepted,
          worker: config.workerName,
          coin: config.coinId
        });
      }, 30000); // 30 saniyede bir logla
    }
    return () => clearInterval(logInterval);
  }, [isMining, isRealMode, stats.hashrate, stats.accepted, config.workerName, config.coinId]);

  const handleToggleMining = async () => {
    const miner = (window as any).VerusMiner;

    if (!isMining) {
      if (miner) {
        addLog("Madenci bileşeni bağlandı, başlatılıyor...", "info");
        miner.onLog = (msg: string, type: any) => addLog(msg, type);
        miner.onStats = (data: { hashrate: number, accepted: number }) => {
          setStats(prev => ({
            ...prev,
            hashrate: data.hashrate,
            accepted: prev.accepted + data.accepted,
            balanceCrypto: prev.balanceCrypto + (data.accepted > 0 ? 0.0001 : 0) // Örnek kazım miktarı
          }));
        };

        setIsSyncing(true);
        miner.log(`${isRealMode ? 'GERÇEK' : 'DEMO'} Madenci Başlatılıyor: ${config.algo}`, 'info');
        const info = await miner.init();
        setDeviceInfo(info);
        await new Promise(r => setTimeout(r, 1000));
        miner.start({ ...config, isRealMode });
        setIsSyncing(false);
        setIsMining(true);
      } else {
        addLog("HATA: Madenci çekirdeği yüklenemedi!", "error");
      }
    } else {
      if (miner) miner.stop();
      setIsMining(false);
    }
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    localStorage.setItem('VITE_SUPABASE_URL', config.supabaseUrl);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog('Yapılandırma başarıyla kaydedildi.', 'success');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  const activeCoin = useMemo(() => MINING_DATA.find(c => c.id === config.coinId) || MINING_DATA[0], [config.coinId]);
  const activeProvider = useMemo(() => activeCoin.providers.find(p => p.id === config.providerId) || activeCoin.providers[0], [activeCoin, config.providerId]);

  return (
    <div className="py-4 space-y-6 animate-in fade-in duration-500">

      {/* MOD SEÇİMİ */}
      <div className="bg-[#121b26] p-1.5 rounded-[2rem] border border-white/5 flex relative overflow-hidden">
        <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r transition-all duration-500 rounded-[1.8rem] z-0 ${isRealMode ? 'translate-x-[calc(100%+6px)] from-orange-500 to-red-600' : 'translate-x-0 from-blue-500 to-indigo-600'}`}></div>
        <button onClick={() => setIsRealMode(false)} className={`relative z-10 flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${!isRealMode ? 'text-white' : 'text-gray-500'}`}>
          <Globe size={14} />
          <span className="text-[8px] font-black uppercase tracking-tighter">Demo Modu</span>
        </button>
        <button onClick={() => setIsRealMode(true)} className={`relative z-10 flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${isRealMode ? 'text-white' : 'text-gray-500'}`}>
          <ShieldCheck size={14} />
          <span className="text-[8px] font-black uppercase tracking-tighter">Gerçek Mod</span>
        </button>
      </div>

      {/* ANA PANEL */}
      <div className="bg-[#121b26] p-8 rounded-[3rem] border border-white/5 shadow-2xl text-center relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00a3ff]/10 rounded-full blur-3xl group-hover:bg-[#00a3ff]/20 transition-all duration-700"></div>

        <div className="relative z-10 space-y-1">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Tahmini Kazanç</p>
          <p className="text-5xl font-black tracking-tighter tabular-nums text-white">
            ${stats.balanceUSDT.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-xs font-bold text-[#00a3ff]">{stats.balanceCrypto.toFixed(8)} {config.coinId}</span>
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Fiyat: ${currentPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
          <button
            onClick={handleToggleMining}
            disabled={isSyncing}
            className={`py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 ${isMining ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#00a3ff] text-white shadow-xl shadow-[#00a3ff]/30'}`}
          >
            {isSyncing ? <RefreshCcw size={18} className="animate-spin" /> : isMining ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {isMining ? 'Durdur' : 'Başlat'}
          </button>
          <button className="bg-white/5 hover:bg-white/10 rounded-[1.8rem] border border-white/10 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-gray-300 transition-all">
            <Cpu size={18} /> Donanım
          </button>
        </div>

        {/* DONANIM VE IP BİLGİSİ */}
        {deviceInfo && (
          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <div className="text-left space-y-1">
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">İşlemci / Bellek</p>
              <p className="text-[10px] font-bold text-gray-300">{deviceInfo.cores} Çekirdek - {deviceInfo.memory}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Ağ Adresi (IP)</p>
              <p className="text-[10px] font-bold text-blue-400">{deviceInfo.ip}</p>
            </div>
          </div>
        )}
      </div>

      {/* COIN SEÇİMİ */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-4 bg-[#00a3ff] rounded-full"></div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Varlık Seçimi</h3>
        </div>
        <div className="flex gap-2.5">
          {MINING_DATA.map((c) => (
            <button
              key={c.id}
              onClick={() => setConfig({ ...config, coinId: c.id, algo: c.algo, providerId: c.providers[0].id, serverId: c.providers[0].servers[0].id, stratumUrl: c.providers[0].servers[0].url })}
              className={`flex-1 py-4 rounded-2xl border transition-all flex flex-col items-center gap-1 ${config.coinId === c.id ? 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-lg shadow-[#00a3ff]/20' : 'bg-black/40 border-white/5 text-gray-600 hover:border-white/10'}`}
            >
              <span className="text-sm font-black">{c.id}</span>
              <span className="text-[8px] font-bold opacity-60 uppercase">{c.algo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* HAVUZ VE BÖLGE */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Havuz Sağlayıcısı</h3>
            <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">Aktif</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {activeCoin.providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setConfig({ ...config, providerId: p.id, serverId: p.servers[0].id, stratumUrl: p.servers[0].url })}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.providerId === p.id ? 'bg-white/5 border-[#00a3ff] text-white shadow-inner' : 'bg-black/20 border-white/5 text-gray-600 hover:bg-white/5'}`}
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
                <span className="text-[9px] font-black text-gray-400">Komisyon: {p.fee}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Sunucu Bölgesi</h3>
          <div className="flex flex-wrap gap-2">
            {activeProvider.servers.map((s) => (
              <button
                key={s.id}
                onClick={() => setConfig({ ...config, serverId: s.id, stratumUrl: s.url })}
                className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${config.serverId === s.id ? 'bg-[#00a3ff]/10 border-[#00a3ff] text-[#00a3ff]' : 'bg-black/40 border-white/5 text-gray-600'}`}
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
      </div>

      {/* FORM AYARLARI */}
      <div className="bg-[#121b26] p-7 rounded-[2.5rem] border border-white/5 space-y-5">
        {/* BİLGİ KUTUSU */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start">
          <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Madenci Bilgisi</p>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Gerçek kazım yapmak için aşağıya geçerli bir <b>{activeCoin.id} cüzdan adresi</b> girin.
              İşçi adını adresin sonuna nokta koyarak ekleyebilirsiniz (örn: <i>Adres.IsciAdi</i>).
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Bağlantı Adresi (Read Only)</label>
          <div className="relative">
            <input type="text" readOnly value={config.stratumUrl} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-gray-500 outline-none" />
            <Lock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Supabase Proje URL</label>
          <input
            type="text"
            placeholder="https://xyz.supabase.co"
            value={config.supabaseUrl}
            onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-bold outline-none focus:border-[#00a3ff] text-white transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Cüzdan Adresi / İşçi Adı</label>
          <input
            type="text"
            value={config.workerName}
            onChange={(e) => setConfig({ ...config, workerName: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-bold outline-none focus:border-[#00a3ff] text-white transition-all"
          />
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 ${saveSuccess ? 'bg-green-600 shadow-xl shadow-green-600/20' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
        >
          {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          {isSaving ? 'Kaydediliyor...' : 'Yapılandırmayı Onayla'}
        </button>
      </div>

      {/* GRAFİK */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Performans</p>
            <p className="text-2xl font-black tabular-nums">{stats.hashrate} <span className="text-[10px] text-gray-600">{activeCoin.unit}</span></p>
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
                  <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00a3ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="#00a3ff" strokeWidth={3} fillOpacity={1} fill="url(#colorHash)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KONSOL */}
      <div className="bg-black/95 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Log Console</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-gray-700'}`}></div>
        </div>
        <div className="h-40 overflow-y-auto p-6 font-mono text-[10px] space-y-2 no-scrollbar bg-black/50">
          {logs.length === 0 ? (
            <div className="text-gray-800 italic">Sistem logları bekleniyor...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-3 animate-in slide-in-from-left-2">
                <span className="text-gray-700 shrink-0">[{log.time}]</span>
                <span className={log.type === 'success' ? 'text-green-400' : log.type === 'warn' ? 'text-yellow-500' : log.type === 'error' ? 'text-red-500' : 'text-blue-400'}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

    </div>
  );
};

export default MiningView;
