
export enum AppTab {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  WALLET = 'wallet',
  PROFILE = 'profile',
  CREATE_BOT = 'create_bot',
  EDIT_BOT = 'edit_bot',
  MINING = 'mining'
}

export interface Trade {
  id: string;
  pair: string;
  type: 'Buy' | 'Sell';
  entryPrice: number;
  currentPrice: number;
  profitAmount: number;
  profitPercentage: number;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: 'Bought' | 'Sold' | 'Strategy' | 'Alert';
  description: string;
  value?: string;
  timeAgo: string;
}

export interface Asset {
  name: string;
  symbol: string;
  balance: number;
  valueFiat: number;
  change: number;
  icon: string;
}
