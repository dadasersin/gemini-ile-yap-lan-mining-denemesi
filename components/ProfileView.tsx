
import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ShieldCheck, Smartphone, Key, Bell, Moon, Globe, DollarSign, HelpCircle, Info, LogOut, ChevronRight } from 'lucide-react';

const ProfileView: React.FC = () => {
  const [toggles, setToggles] = useState({ twoFactor: true, darkTheme: true, notifications: true });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Kullanıcı Bilgisi Başlığı */}
      <div className="flex items-center gap-5 px-1 mb-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#00a3ff] p-1 shadow-[0_0_15px_rgba(0,163,255,0.4)]">
            <img src="https://picsum.photos/200/200" alt="Profil" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-[#0b1118]"></div>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Serkan Örnek</h2>
          <p className="text-[#00a3ff] text-sm font-bold mt-1">@serkanornek</p>
        </div>
      </div>

      {/* Ayarlar Bölümleri */}
      <SettingsSection title="Hesap Bilgileri">
        <SettingsItem icon={<User size={18}/>} label="Kullanıcı Adı" value="@serkanornek" />
        <SettingsItem icon={<Mail size={18}/>} label="E-posta Adresi" value="s***@ornek.com" />
        <SettingsItem icon={<Phone size={18}/>} label="Telefon Numarası" value="*** 555 1234" />
      </SettingsSection>

      <SettingsSection title="Güvenlik">
        <SettingsItem icon={<Lock size={18}/>} label="Şifre Değiştir" />
        <SettingsItem 
          icon={<ShieldCheck size={18}/>} 
          label="İki Faktörlü Doğrulama (2FA)" 
          isToggle 
          toggleState={toggles.twoFactor} 
          onToggle={() => toggle('twoFactor')} 
        />
        <SettingsItem icon={<Smartphone size={18}/>} label="Yetkili Cihazlar" />
        <SettingsItem icon={<Key size={18}/>} label="API Anahtarları" />
      </SettingsSection>

      <SettingsSection title="Uygulama Ayarları">
        <SettingsItem 
          icon={<Bell size={18}/>} 
          label="Bildirimler" 
          isToggle 
          toggleState={toggles.notifications} 
          onToggle={() => toggle('notifications')} 
        />
        <SettingsItem 
          icon={<Moon size={18}/>} 
          label="Karanlık Görünüm" 
          isToggle 
          toggleState={toggles.darkTheme} 
          onToggle={() => toggle('darkTheme')} 
        />
        <SettingsItem icon={<Globe size={18}/>} label="Dil" value="Türkçe" />
        <SettingsItem icon={<DollarSign size={18}/>} label="Para Birimi" value="TRY" />
      </SettingsSection>

      <SettingsSection title="Diğer">
        <SettingsItem icon={<HelpCircle size={18}/>} label="Yardım ve Destek" />
        <SettingsItem icon={<Info size={18}/>} label="Pro Sürüm Hakkında" />
      </SettingsSection>

      {/* Çıkış Butonu */}
      <button className="w-full mt-4 flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-2xl font-bold transition-all border border-red-500/20 group">
        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        Oturumu Kapat
      </button>
    </div>
  );
};

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-black text-[#00a3ff] uppercase tracking-widest px-1">{title}</h3>
    <div className="bg-[#121b26] rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
      {children}
    </div>
  </div>
);

const SettingsItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value?: string; 
  isToggle?: boolean; 
  toggleState?: boolean; 
  onToggle?: () => void 
}> = ({ icon, label, value, isToggle, toggleState, onToggle }) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-all group cursor-pointer" onClick={isToggle ? onToggle : undefined}>
    <div className="flex items-center gap-4">
      <div className="text-gray-500 group-hover:text-[#00a3ff] transition-colors">{icon}</div>
      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-xs font-bold text-gray-500 tracking-tight">{value}</span>}
      {isToggle ? (
        <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${toggleState ? 'bg-[#00a3ff]' : 'bg-[#0b1118] border border-white/10'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${toggleState ? 'right-0.5 bg-white' : 'left-0.5 bg-gray-600'}`}></div>
        </div>
      ) : (
        <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
      )}
    </div>
  </div>
);

export default ProfileView;
