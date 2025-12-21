import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: number;
  category?: 'mission' | 'task' | 'achievement' | 'purchase' | 'bonus';
}

interface CurrencyState {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Transaction[];
  
  // Actions
  earn: (amount: number, description: string, category?: Transaction['category']) => void;
  spend: (amount: number, description: string, category?: Transaction['category']) => boolean;
  canAfford: (amount: number) => boolean;
  getTransactionHistory: (limit?: number) => Transaction[];
  reset: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      transactions: [],

      earn: (amount: number, description: string, category: Transaction['category'] = 'mission') => {
        if (amount <= 0) return;
        
        const transaction: Transaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'earn',
          amount,
          description,
          timestamp: Date.now(),
          category,
        };

        set((state) => ({
          balance: state.balance + amount,
          totalEarned: state.totalEarned + amount,
          transactions: [transaction, ...state.transactions].slice(0, 1000), // Keep last 1000 transactions
        }));
      },

      spend: (amount: number, description: string, category: Transaction['category'] = 'purchase') => {
        if (amount <= 0) return false;
        if (!get().canAfford(amount)) return false;

        const transaction: Transaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'spend',
          amount,
          description,
          timestamp: Date.now(),
          category,
        };

        set((state) => ({
          balance: state.balance - amount,
          totalSpent: state.totalSpent + amount,
          transactions: [transaction, ...state.transactions].slice(0, 1000),
        }));

        return true;
      },

      canAfford: (amount: number) => {
        return get().balance >= amount;
      },

      getTransactionHistory: (limit: number = 50) => {
        return get().transactions.slice(0, limit);
      },

      reset: () => {
        set({
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          transactions: [],
        });
      },
    }),
    {
      name: 'neoncloud-currency',
      partialize: (state) => ({
        balance: state.balance,
        totalEarned: state.totalEarned,
        totalSpent: state.totalSpent,
        transactions: state.transactions.slice(0, 100), // Persist last 100 transactions
      }),
    }
  )
);

