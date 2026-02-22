
/**
 * VerusHash Tarayıcı Madencisi (Gerçek Entegrasyon)
 * Bu dosya pangz-lab VerusHash WASM kütüphanesini kullanarak gerçek kazım yapar.
 */
class VerusMinerWrapper {
    constructor() {
        this.worker = null;
        this.isMining = false;
        this.onLog = null;
        this.onStats = null;
        this.realMiner = null;
    }

    async init() {
        // Cihaz ve IP bilgilerini topla
        const ipInfo = await fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ ip: 'Bilinmiyor' }));
        const hardwareInfo = {
            cores: navigator.hardwareConcurrency || 'Bilinmiyor',
            memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Bilinmiyor',
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            ip: ipInfo.ip
        };
        this.deviceInfo = hardwareInfo;
        console.log("VerusMiner başlatılıyor...", hardwareInfo);
        return hardwareInfo;
    }

    start(config) {
        if (this.isMining) return;
        this.isMining = true;

        const { stratumUrl, workerName, algo, isRealMode } = config;
        
        if (!isRealMode) {
            this.log("DEMO Modu Başlatıldı. Gerçek kazım yapılmıyor.", 'info');
            this.startSimulation(config);
            return;
        }

        this.log(`GERÇEK Madencilik Başlatılıyor: ${stratumUrl}`, 'info');
        this.log(`Cüzdan/İşçi: ${workerName}`, 'info');

        // pangz-lab verushash.js genellikle 'VerusHash' global'ini sağlar
        try {
            if (typeof VerusHash !== 'undefined') {
                this.realMiner = new VerusHash();
                
                this.realMiner.on('hashrate', (h) => {
                    if (this.onStats) {
                        this.onStats({
                            hashrate: parseFloat(h),
                            accepted: 0
                        });
                    }
                });

                this.realMiner.on('share', () => {
                    if (this.onStats) {
                        this.onStats({
                            hashrate: 0,
                            accepted: 1
                        });
                    }
                    this.log(`[OK] Pay Kabul Edildi | ${algo} | ${workerName}`, 'success');
                });

                this.realMiner.on('error', (err) => {
                    this.log(`HATA: ${err}`, 'error');
                });

                this.realMiner.start(stratumUrl, workerName, 'x');
                this.log("VerusHash WASM Modülü Yüklendi ve Başlatıldı.", "success");
            } else {
                this.log("HATA: VerusHash kütüphanesi yüklenemedi. Simülasyona geçiliyor.", "error");
                this.startSimulation(config);
            }
        } catch (e) {
            this.log(`HATA: ${e.message}`, "error");
            this.startSimulation(config);
        }
    }

    startSimulation(config) {
        const { algo, workerName } = config;
        this.timer = window.setInterval(() => {
            if (!this.isMining) return;

            const hashrate = (5.0 + Math.random() * 0.5).toFixed(2);
            const accepted = Math.random() > 0.95 ? 1 : 0;

            if (this.onStats) {
                this.onStats({
                    hashrate: parseFloat(hashrate),
                    accepted: accepted
                });
            }

            if (accepted > 0) {
                this.log(`[SIM] Pay Kabul Edildi | ${algo} | ${workerName}`, 'success');
            }
        }, 2000);
    }

    stop() {
        this.isMining = false;
        if (this.timer) clearInterval(this.timer);
        if (this.realMiner) {
            try {
                this.realMiner.stop();
            } catch (e) {
                console.error("Miner durdurulurken hata:", e);
            }
        }
        this.log("Madencilik durduruldu.", 'warn');
    }

    log(msg, type = 'info') {
        if (this.onLog) this.onLog(msg, type);
    }
}

// Global nesne ismini MiningView.tsx ile uyumlu tutuyoruz
window.VerusMiner = new VerusMinerWrapper();
