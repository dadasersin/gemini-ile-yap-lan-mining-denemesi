
import React, { useState } from 'react';
import { LayoutGrid, History, Wallet, User, Pickaxe, Settings, Menu, Bell } from 'lucide-react';
import { AppTab } from './types';
import Dashboard from './components/Dashboard';
import TradeHistory from './components/TradeHistory';
import WalletView from './components/WalletView';
import ProfileView from './components/ProfileView';
import CreateBotView from './components/CreateBotView';
import EditBotView from './components/EditBotView';
import MiningView from './components/MiningView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard onCreateBot={() => setActiveTab(AppTab.CREATE_BOT)} onSettings={() => setActiveTab(AppTab.EDIT_BOT)} />;
      case AppTab.HISTORY:
        return <TradeHistory />;
      case AppTab.WALLET:
        return <WalletView />;
      case AppTab.MINING:
        return <MiningView />;
      case AppTab.PROFILE:
        return <ProfileView />;
      case AppTab.CREATE_BOT:
        return <CreateBotView onBack={() => setActiveTab(AppTab.DASHBOARD)} />;
      case AppTab.EDIT_BOT:
        return <EditBotView onBack={() => setActiveTab(AppTab.DASHBOARD)} />;
      default:
        return <Dashboard onCreateBot={() => setActiveTab(AppTab.CREATE_BOT)} onSettings={() => setActiveTab(AppTab.EDIT_BOT)} />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return 'Bot Paneli';
      case AppTab.HISTORY: return 'İşlem Geçmişi';
      case AppTab.WALLET: return 'Cüzdanım';
      case AppTab.MINING: return 'Binance Madencilik';
      case AppTab.PROFILE: return 'Ayarlar';
      case AppTab.CREATE_BOT: return 'Yeni Bot Oluştur';
      case AppTab.EDIT_BOT: return 'Bot Yapılandırma';
      default: return 'CryptoBot Pro';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1118] text-white">
      {/* Üst Başlık */}
      <header className="sticky top-0 z-50 bg-[#0b1118]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">{getHeaderTitle()}</h1>
        <div className="flex items-center gap-2">
          {activeTab === AppTab.WALLET || activeTab === AppTab.MINING ? (
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell size={22} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
          ) : (
            <button onClick={() => setActiveTab(AppTab.PROFILE)} className="p-2 hover:bg-white/5 rounded-full">
              <Settings size={22} />
            </button>
          )}
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="flex-1 pb-24 overflow-y-auto max-w-2xl mx-auto w-full px-4">
        {renderContent()}
      </main>

      {/* Alt Navigasyon */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d141c] border-t border-white/5 py-2 px-6 flex justify-between items-center z-50 shadow-2xl safe-area-bottom">
        <NavItem 
          active={activeTab === AppTab.DASHBOARD} 
          icon={<LayoutGrid size={24} />} 
          label="Panel" 
          onClick={() => setActiveTab(AppTab.DASHBOARD)} 
        />
        <NavItem 
          active={activeTab === AppTab.MINING} 
          icon={<Pickaxe size={24} />} 
          label="Madenci" 
          onClick={() => setActiveTab(AppTab.MINING)} 
        />
        <NavItem 
          active={activeTab === AppTab.WALLET} 
          icon={<Wallet size={24} />} 
          label="Cüzdan" 
          onClick={() => setActiveTab(AppTab.WALLET)} 
        />
        <NavItem 
          active={activeTab === AppTab.HISTORY} 
          icon={<History size={24} />} 
          label="Geçmiş" 
          onClick={() => setActiveTab(AppTab.HISTORY)} 
        />
        <NavItem 
          active={activeTab === AppTab.PROFILE} 
          icon={<User size={24} />} 
          label="Profil" 
          onClick={() => setActiveTab(AppTab.PROFILE)} 
        />
      </nav>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? 'text-[#00a3ff]' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <div className={`p-1 rounded-lg ${active ? 'bg-[#00a3ff]/10' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
