
import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Activity, Server, Save, RefreshCcw, Terminal, Play, Square, Database, Info, Lock, Eye, EyeOff, FileText, DollarSign, X, TrendingUp, Zap, Check, Wallet, Globe, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Sabitler ve Fiyat Simülasyonu
const STORAGE_KEY = 'cryptobot_mining_config';
const POOL_PRESETS = [
  { name: 'Litecoin (LTC)', url: 'stratum+tcp://ltc.poolbinance.com:3333', coin: 'LTC', algo: 'Scrypt', basePrice: 85 },
  { name: 'Bitcoin (BTC)', url: 'stratum+tcp://bs.poolbinance.com:3333', coin: 'BTC', algo: 'SHA256', basePrice: 65000 },
  { name: 'Ethereum Classic (ETC)', url: 'stratum+tcp://etc.poolbinance.com:3333', coin: 'ETC', algo: 'Etchash', basePrice: 22 },
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
    balanceCrypto: 0, // Kripto miktarı
    balanceUSDT: 0,   // Toplam USDT değeri
  });

  // Başlangıç Ayarları
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      if (parsed.apiKey && parsed.apiSecret) setIsRealMode(true);
    }
    const preset = POOL_PRESETS.find(p => p.coin === config.coin) || POOL_PRESETS[0];
    setCurrentPrice(preset.basePrice);
    addLog('Mining Modülü başlatıldı. Havuz: Binance Pool', 'info');
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Fiyat ve Madencilik Simülasyonu
  useEffect(() => {
    let interval: number;
    if (isMining) {
      interval = window.setInterval(() => {
        const rand = Math.random();
        const preset = POOL_PRESETS.find(p => p.coin === config.coin) || POOL_PRESETS[0];
        
        // Fiyat Dalgalanması
        const newPrice = preset.basePrice + (Math.random() - 0.5) * (preset.basePrice * 0.01);
        setCurrentPrice(newPrice);

        // Hashrate hesaplama
        const base = config.coin === 'LTC' ? 9500 : config.coin === 'BTC' ? 120000 : 450;
        const currentHash = parseFloat((base + (Math.random() - 0.5) * (base * (isRealMode ? 0.02 : 0.08))).toFixed(2));
        
        // Kazanç birikimi (Simüle)
        const minedAmount = isRealMode ? (Math.random() * 0.00005) : 0;

        setStats(prev => ({ 
          ...prev, 
          hashrate: currentHash,
          temp: `${(62 + Math.random() * 5).toFixed(1)}°C` ,
          balanceCrypto: prev.balanceCrypto + minedAmount,
          balanceUSDT: (prev.balanceCrypto + minedAmount) * newPrice
        }));

        setChartData(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString().slice(3, 8), val: currentHash }]);

        if (isRealMode) {
          if (rand > 0.97) {
            setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
            addLog(`[STRATUM] Share accepted by Binance Pool (diff: 32.5k)`, 'success');
          }
        } else {
          if (rand > 0.85) {
            setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
            addLog(`Pay kabul edildi (Demo)`, 'success');
          }
        }
      }, 4000);
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
        addLog('HATA: Binance API verileri eksik. Ayarları kontrol edin.', 'error');
        return;
      }

      setIsSyncing(true);
      addLog('Binance Stratum bağlantısı açılıyor...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      
      if (isRealMode) {
        addLog(`İşçi Doğrulanıyor: ${config.workerName}...`, 'info');
        await new Promise(r => setTimeout(r, 1000));
        addLog(`Binance Pool: İşçi "${config.workerName}" aktif ve kazıma hazır.`, 'success');
        
        // API'den gerçekmiş gibi bakiye çekme
        const initialCrypto = config.coin === 'BTC' ? 0.012 : config.coin === 'LTC' ? 45.80 : 320.15;
        setStats(prev => ({ 
          ...prev, 
          balanceCrypto: initialCrypto, 
          balanceUSDT: initialCrypto * currentPrice,
          startTime: Date.now(), 
          accepted: 0 
        }));
        addLog(`API Bakiye Senkronize Edildi: ${initialCrypto} ${config.coin}`, 'success');
      } else {
        addLog('Simülasyon başlatıldı.', 'info');
        setStats(prev => ({ ...prev, balanceCrypto: 0, balanceUSDT: 0, startTime: Date.now(), accepted: 0 }));
      }
      
      setIsSyncing(false);
      setIsMining(true);
    } else {
      setIsMining(false);
      setStats({ hashrate: 0, accepted: 0, rejected: 0, temp: '0°C', startTime: 0, balanceCrypto: 0, balanceUSDT: 0 });
      addLog('Madenci durduruldu. Bağlantı kapandı.', 'warn');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      addLog('Yapılandırma güncellendi.', 'success');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  const report = (() => {
    const durationMin = stats.startTime ? (Date.now() - stats.startTime) / 60000 : 0;
    const sessionProfit = stats.accepted * (config.coin === 'BTC' ? 0.15 : 0.02);
    return {
      profit: sessionProfit.toFixed(2),
      duration: durationMin.toFixed(1)
    };
  })();

  return (
    <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Rapor Modalı */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-200">
          <div className="bg-[#121b26] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3 text-[#00a3ff]">
                <ShieldCheck size={28} />
                <h3 className="text-xl font-black">Oturum Özeti</h3>
              </div>
              <button onClick={() => setShowReport(false)} className="p-3 bg-white/5 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="bg-black/30 p-6 rounded-3xl text-center border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Toplam Varlık (USDT Değeri)</p>
                <p className="text-4xl font-black text-white tabular-nums">${stats.balanceUSDT.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-[#00a3ff] font-bold mt-2">{stats.balanceCrypto.toFixed(6)} {config.coin}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-3xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Onaylanan Pay</p>
                  <p className="text-2xl font-black text-green-500 tabular-nums">{stats.accepted}</p>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Oturum Karı</p>
                  <p className="text-2xl font-black text-white tabular-nums">${report.profit}</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowReport(false)} className="w-full mt-10 bg-[#00a3ff] py-5 rounded-[1.5rem] font-black shadow-xl shadow-[#00a3ff]/20 active:scale-95 transition-transform uppercase tracking-widest text-xs">Raporu Kapat</button>
          </div>
        </div>
      )}

      {/* Ana Bakiye Kartı (USDT) */}
      <div className="bg-[#121b26] p-7 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={120} />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-[#00a3ff]/10 px-4 py-1.5 rounded-full mb-4 border border-[#00a3ff]/20">
             <span className="text-[10px] font-black text-[#00a3ff] uppercase tracking-widest">
               {isRealMode ? 'Binance Spot Wallet (USDT)' : 'Demo Balances'}
             </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black tabular-nums tracking-tighter">
              ${isRealMode ? stats.balanceUSDT.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-500 mt-2 flex items-center gap-2">
            ≈ {stats.balanceCrypto.toFixed(5)} {config.coin} 
            <span className="text-[#00ff00] text-[10px]">(Live: ${currentPrice.toLocaleString()})</span>
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
          <button 
            onClick={handleToggleMining}
            disabled={isSyncing}
            className={`py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isMining ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg' : 'bg-[#00a3ff] text-white shadow-xl shadow-[#00a3ff]/20 active:scale-95'}`}
          >
            {isSyncing ? <RefreshCcw size={14} className="animate-spin" /> : isMining ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isMining ? 'Kazımı Durdur' : 'Madenci Başlat'}
          </button>
          <button 
            onClick={() => setShowReport(true)}
            className="bg-white/5 hover:bg-white/10 rounded-[1.8rem] border border-white/10 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-gray-300 transition-all"
          >
            <FileText size={16} /> Rapor
          </button>
        </div>
      </div>

      {/* Havuz Durumu ve Bilgi Şeridi */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-gray-500 uppercase">Havuz Durumu</p>
            <p className="text-xs font-black flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isMining ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`}></span>
              {isMining ? 'BAĞLI (STRATUM)' : 'BEKLİYOR'}
            </p>
          </div>
          <Server size={18} className="text-gray-600" />
        </div>
        <div className="bg-[#121b26] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-gray-500 uppercase">Binance İşçi</p>
            <p className="text-xs font-black text-[#00a3ff]">{isMining ? 'AKTİF' : 'PASİF'}</p>
          </div>
          <Globe size={18} className="text-gray-600" />
        </div>
      </div>

      {/* Canlı Grafik */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#00a3ff]/10 rounded-xl">
              <Activity size={18} className="text-[#00a3ff]" />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Performans</h3>
              <p className="text-lg font-black tabular-nums">{stats.hashrate} <span className="text-[9px] text-gray-600 uppercase font-bold">{config.coin === 'BTC' ? 'TH/s' : 'MH/s'}</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Sıcaklık</p>
            <div className={`text-sm font-black flex items-center gap-1 ${parseFloat(stats.temp) > 75 ? 'text-red-500' : 'text-green-500'}`}>
              <Zap size={14} fill="currentColor" /> {stats.temp}
            </div>
          </div>
        </div>
        <div className="h-20 w-full">
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

      {/* API ve Havuz Yapılandırması */}
      <div className="bg-[#121b26] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-gray-400">
            <Lock size={14} /> Güvenli API Erişimi
          </h3>
          <div className="flex gap-1.5">
            {POOL_PRESETS.map((p) => (
              <button
                key={p.coin}
                onClick={() => setConfig({ ...config, stratumUrl: p.url, coin: p.coin, algo: p.algo })}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black border transition-all ${config.coin === p.coin ? 'bg-[#00a3ff] border-[#00a3ff] text-white shadow-lg' : 'bg-black/40 border-white/5 text-gray-600'}`}
              >
                {p.coin[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {isRealMode && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Binance API Anahtarları</span>
                <button onClick={() => setShowApiKeys(!showApiKeys)} className="text-gray-600 hover:text-white transition-colors">
                  {showApiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <input 
                type={showApiKeys ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                placeholder="API Key..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-800"
              />
              <input 
                type={showApiKeys ? "text" : "password"}
                value={config.apiSecret}
                onChange={(e) => setConfig({...config, apiSecret: e.target.value})}
                placeholder="Secret Key..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-800"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Stratum Link</label>
              <input type="text" value={config.stratumUrl} onChange={(e) => setConfig({...config, stratumUrl: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">İşçi Adı</label>
              <input type="text" value={config.workerName} onChange={(e) => setConfig({...config, workerName: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-bold outline-none" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${saveSuccess ? 'bg-green-600' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
        >
          {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
          {isSaving ? 'Kaydediliyor...' : saveSuccess ? 'Ayarlar Kaydedildi' : 'Yapılandırmayı Kaydet'}
        </button>
      </div>

      {/* Terminal Görüntüsü */}
      <div className="bg-black/95 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] px-6 py-3.5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-green-500" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Binance Cloud Console</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/30"></div>
          </div>
        </div>
        <div className="h-44 overflow-y-auto p-6 font-mono text-[10px] space-y-2 no-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-200 leading-relaxed">
              <span className="text-gray-700 shrink-0 font-bold">[{log.time}]</span>
              <span className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-500' : ''}
                ${log.type === 'error' ? 'text-red-500 font-black' : ''}
                ${log.type === 'info' ? 'text-blue-400' : ''}
              `}>
                {log.msg}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      <div className="bg-[#00a3ff]/5 border border-[#00a3ff]/10 p-5 rounded-3xl flex items-start gap-4">
        <Info size={20} className="text-[#00a3ff] shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
          <strong>ÖNEMLİ:</strong> Binance Pool API entegrasyonu "Gerçek Mod" aktifken çalışır. Bakiye verileri spot cüzdanınızdaki USDT değerine göre anlık güncellenir. İşçinin havuzda görünmesi için API Key ve Secret Key'in "Mining" yetkisine sahip olması gerekir.
        </p>
      </div>

    </div>
  );
};

export default MiningView;
