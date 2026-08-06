
import React, { useState, useMemo } from 'react';
import { Plus, Sprout, IndianRupee, CheckCircle, RotateCcw, Pencil, X, Calendar, TreePine, Leaf, Tag, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CropProfile, Transaction, TransactionType, ExpenseCategory, CropType, IncomeCategory } from '../types';

interface TransactionFormProps {
  crops: CropProfile[];
  onAddCrop: (masterName: string, startDate: string, type: CropType) => void;
  onEditCrop: (id: string, newMasterName: string, startDate: string, endDate: string | null) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onCompleteCrop: (id: string) => void;
}

// Helper to get local date string YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ crops, onAddCrop, onEditCrop, onAddTransaction, onCompleteCrop }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'transaction' | 'crop'>('transaction');

  // Transaction State - Default to TODAY (Local Time)
  const [date, setDate] = useState(getTodayString());
  const [cropId, setCropId] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  // State to hold both expense or income category
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('other');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  // Crop State
  const [masterCropName, setMasterCropName] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [cropType, setCropType] = useState<CropType>('SEASONAL');
  const [editingCropId, setEditingCropId] = useState<string | null>(null);

  // Reset category default when switching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'EXPENSE' ? 'other' : 'sale');
  };

  // Filter active crops for dropdown, sorted by date (newest first)
  const activeCrops = useMemo(() => {
    return crops
      .filter(c => c.status !== 'COMPLETED')
      .sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
  }, [crops]);

  // Group all crops by MASTER CROP NAME for the Manager List
  const cropsByMaster = useMemo(() => {
    const grouped: Record<string, CropProfile[]> = {};
    crops.forEach(crop => {
      const master = crop.masterCrop || crop.name; // Fallback
      if (!grouped[master]) grouped[master] = [];
      grouped[master].push(crop);
    });
    // Sort keys alphabetically
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [crops]);

  // Unique existing master crop names for autocomplete suggestion
  const existingMasterNames = useMemo(() => {
    const names = new Set(crops.map(c => c.masterCrop).filter(Boolean));
    return Array.from(names).sort();
  }, [crops]);

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropId || !amount) return;

    onAddTransaction({
      date,
      cropId,
      type,
      category: category,
      amount: parseFloat(amount),
      description: desc
    });

    // Reset form partially (Date remains as is for bulk entry convenience)
    setAmount('');
    setDesc('');
  };

  const handleCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterCropName.trim()) return;

    if (editingCropId) {
      // If editing, endDate might be relevant if previously completed
      const finalEndDate = endDate ? endDate : null;
      onEditCrop(editingCropId, masterCropName, startDate, finalEndDate);
      setEditingCropId(null);
    } else {
      onAddCrop(masterCropName, startDate, cropType);
    }
    
    setMasterCropName('');
    setEndDate('');
    // Reset defaults
    setCropType('SEASONAL');
    setStartDate(getTodayString());
  };

  const startEditing = (crop: CropProfile) => {
    setEditingCropId(crop.id);
    // Safe split check
    const baseName = crop.name ? crop.name.split('(')[0].trim() : 'Unknown';
    setMasterCropName(crop.masterCrop || baseName);
    
    if (crop.startDate) setStartDate(crop.startDate);
    if (crop.endDate) setEndDate(crop.endDate);
    if (crop.type) setCropType(crop.type);
  };

  const cancelEditing = () => {
    setEditingCropId(null);
    setMasterCropName('');
    setEndDate('');
    setStartDate(getTodayString());
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'transaction' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('transaction')}
        >
          {t('addTransaction')}
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'crop' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('crop')}
        >
          {t('manageCropsTab')}
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'transaction' ? (
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            {activeCrops.length === 0 && (
              <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-md mb-2">
                {crops.length > 0 ? "All crops are marked as Completed. Start a new crop batch." : "Please add a crop first."}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('date')}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('selectCrop')}</label>
                <select
                  required
                  value={cropId}
                  onChange={e => setCropId(e.target.value)}
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- {t('activeCropsOnly')} --</option>
                  {activeCrops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('transType')}</label>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleTypeChange('EXPENSE')}
                  className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${type === 'EXPENSE' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
                >
                  {t('expense')}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('INCOME')}
                  className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${type === 'INCOME' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
                >
                  {t('income')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('category')}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {type === 'EXPENSE' ? (
                  <>
                    <option value="seeds">{t('seeds')}</option>
                    <option value="sowing">{t('sowing')}</option>
                    <option value="fertilizer">{t('fertilizer')}</option>
                    <option value="labor">{t('labor')}</option>
                    <option value="irrigation">{t('irrigation')}</option>
                    <option value="pestControl">{t('pestControl')}</option>
                    <option value="harvest">{t('harvest')}</option>
                    <option value="transport">{t('transport')}</option>
                    <option value="preserve">{t('preserve')}</option>
                    <option value="other">{t('other')}</option>
                  </>
                ) : (
                  <>
                    <option value="sale">{t('sale')}</option>
                    <option value="own_use">{t('own_use')}</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('amount')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="pl-9 w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {type === 'INCOME' && category === 'own_use' && (
                 <p className="text-[10px] text-slate-400 mt-1 ml-1">Enter market value of retained crop.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('description')}</label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={activeCrops.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {t('save')}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Add / Edit Crop Section */}
            <form onSubmit={handleCropSubmit} className="space-y-3">
               <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">{t('masterCropName')}</label>
                 <input
                   list="masterCropsList"
                   type="text"
                   required
                   placeholder="e.g. Maize"
                   value={masterCropName}
                   onChange={e => setMasterCropName(e.target.value)}
                   className="w-full border-slate-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                 />
                 <datalist id="masterCropsList">
                   {existingMasterNames.map(name => (
                     <option key={name} value={name} />
                   ))}
                 </datalist>
               </div>

              {!editingCropId ? (
                // ADD MODE
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('sowingDate')}</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input 
                        type="date" 
                        required 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-9 border-slate-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('cropType')}</label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value as CropType)}
                      className="w-full border-slate-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="SEASONAL">{t('typeSeasonal')}</option>
                      <option value="PERENNIAL">{t('typePerennial')}</option>
                    </select>
                  </div>
                </div>
              ) : (
                // EDIT MODE
                <div className="grid grid-cols-2 gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <div className="col-span-2 flex items-center gap-2 text-amber-700 text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    {t('editCaution')}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('sowingDate')}</label>
                    <input 
                      type="date" 
                      required 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border-slate-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('endDate')}</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border-slate-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
              
              {editingCropId && (
                <div className="flex justify-end">
                   <button 
                      type="button" 
                      onClick={cancelEditing}
                      className="text-xs text-slate-500 underline mr-4 hover:text-slate-800"
                    >
                      {t('cancel')}
                    </button>
                </div>
              )}

              <button
                type="submit"
                className={`w-full text-white font-medium py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 ${editingCropId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {editingCropId ? <CheckCircle className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                {editingCropId ? t('updateCrop') : t('addNewCrop')}
              </button>
            </form>

            {/* List Existing Crops (Grouped by Master Crop) */}
            {cropsByMaster.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{t('manageCrops')}</h4>
                <div className="max-h-60 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  {cropsByMaster.map(([master, masterCrops]) => (
                    <div key={master}>
                      <h5 className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block mb-2 sticky top-0 z-10">{master}</h5>
                      <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        {masterCrops.map(crop => (
                          <div key={crop.id} className={`flex items-center justify-between p-2 rounded-md border ${editingCropId === crop.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className={`text-sm font-medium ${crop.status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-700'}`}>
                                  {/* Generate Display Name: Master (StartDate - EndDate) */}
                                  {crop.masterCrop} <span className="text-xs font-normal text-slate-500">
                                    ({formatDate(crop.startDate)} - {crop.endDate ? formatDate(crop.endDate) : 'Present'})
                                  </span>
                                </p>
                                {crop.type === 'PERENNIAL' && (
                                  <span title={t('typePerennial')}>
                                    <TreePine className="w-3 h-3 text-emerald-600" />
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${crop.status === 'COMPLETED' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {crop.status === 'COMPLETED' ? t('statusCompleted') : t('statusActive')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditing(crop)}
                                className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-indigo-600"
                                title={t('edit')}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              
                              {crop.status === 'ACTIVE' && (
                                <button
                                  onClick={() => onCompleteCrop(crop.id)}
                                  className="p-1.5 rounded text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                  title={t('markCompleted')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};