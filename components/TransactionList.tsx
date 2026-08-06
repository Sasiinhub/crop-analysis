
import React from 'react';
import { Trash2, TrendingUp, TrendingDown, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Transaction, CropProfile } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  crops: CropProfile[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, crops, onDelete }) => {
  const { t } = useLanguage();

  const getCropName = (id: string) => crops.find(c => c.id === id)?.name || 'Unknown';

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-100 text-center text-slate-500">
        <p>{t('noTransactions')}</p>
      </div>
    );
  }

  // Sort by date desc
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const TransactionIcon = ({ type, category }: { type: string, category: string }) => {
    if (type === 'INCOME') {
      if (category === 'own_use') {
        return <Home className="w-4 h-4 text-emerald-500" />;
      }
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">{t('recentTransactions')}</h3>
      </div>
      
      {/* MOBILE CARD VIEW (Visible only on small screens) */}
      <div className="md:hidden">
        {sorted.map(tr => (
          <div key={tr.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex justify-between items-start">
             <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">{tr.date}</span>
                  <span className={`font-bold text-sm ${tr.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {tr.type === 'INCOME' ? '+' : '-'}₹{tr.amount.toLocaleString()}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">{getCropName(tr.cropId)}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                   <TransactionIcon type={tr.type} category={tr.category} />
                   <span className="capitalize">{t(tr.category as any)}</span>
                   {tr.description && <span className="text-slate-400 mx-1">• {tr.description}</span>}
                </div>
             </div>
             <button 
                onClick={() => onDelete(tr.id)}
                className="ml-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">{t('date')}</th>
              <th className="px-6 py-3">{t('selectCrop')}</th>
              <th className="px-6 py-3">{t('category')}</th>
              <th className="px-6 py-3 text-right">{t('amount')}</th>
              <th className="px-6 py-3 text-center">{t('delete')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(tr => (
              <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap text-slate-600">{tr.date}</td>
                <td className="px-6 py-3 font-medium text-slate-800">{getCropName(tr.cropId)}</td>
                <td className="px-6 py-3 capitalize flex items-center gap-2">
                  <TransactionIcon type={tr.type} category={tr.category} />
                  <span className="text-slate-600">
                    {t(tr.category as any)}
                  </span>
                  {tr.description && (
                    <span className="text-xs text-slate-400 max-w-[150px] truncate" title={tr.description}>
                      ({tr.description})
                    </span>
                  )}
                </td>
                <td className={`px-6 py-3 text-right font-medium ${tr.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {tr.type === 'INCOME' ? '+' : '-'}₹{tr.amount.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-center">
                  <button 
                    onClick={() => onDelete(tr.id)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};