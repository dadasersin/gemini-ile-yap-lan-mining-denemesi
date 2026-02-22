
/**
 * Supabase İstemci Yapılandırması
 * Not: Bu dosya index.html'de yüklü olan Supabase CDN'ini kullanır.
 */

// Varsayılan değerler (Kullanıcıdan gelen bilgilere göre)
const DEFAULT_ANON_KEY = 'sbp_v0_a8427122d22c4380ffcb1e0f9b21083bdf1b4767';

export const getSupabaseClient = () => {
    // @ts-ignore - CDN üzerinden gelen global nesne
    const supabase = window.supabase;

    if (!supabase) {
        console.warn("Supabase kütüphanesi henüz yüklenmedi.");
        return null;
    }

    // URL ve Key öncelikle localStorage'dan (ayarlar), yoksa varsayılandan alınır
    const url = localStorage.getItem('VITE_SUPABASE_URL');
    const key = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || DEFAULT_ANON_KEY;

    if (!url) {
        // URL eksikse işlem yapılamaz
        return null;
    }

    try {
        return supabase.createClient(url, key);
    } catch (e) {
        console.error("Supabase client oluşturulurken hata:", e);
        return null;
    }
};

export const saveMiningLog = async (stats: { hashrate: number; accepted: number; worker: string; coin: string }) => {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client.from('mining_logs').insert([
        {
            hashrate: stats.hashrate,
            shares_accepted: stats.accepted,
            worker_name: stats.worker,
            coin_symbol: stats.coin,
            timestamp: new Date().toISOString()
        }
    ]);

    if (error) {
        console.error("Supabase'e veri kaydedilemedi:", error.message);
    }
};
