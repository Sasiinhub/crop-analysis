
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sprout, RefreshCw, X, PieChart as PieChartIcon, Languages, AlertTriangle, AlertOctagon, FileText, BookOpen, Download, Upload, Database, Trash2, Filter, LayoutDashboard, ClipboardList, RotateCcw } from 'lucide-react';
import { CropData, AppState, CropProfile, Transaction, CropType } from './types';
import { FileUploader } from './components/FileUploader';
import { ProfitBarChart, CostBreakdownPieChart, RevenueCostChart, OverallSummaryChart, YearlyPerformanceChart, GlobalCostPieChart } from './components/Charts';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { useLanguage, Language } from './contexts/LanguageContext';
import { getTranslatedCropName } from './utils/cropTranslations';
import { aggregateTransactions } from './utils/transactionUtils';
import { DEMO_CROPS, DEMO_TRANSACTIONS } from './utils/demoData';

type InputMode = 'MANUAL' | 'EXCEL';
type ViewMode = 'RECORDS' | 'ANALYTICS';

const App: React.FC = () => {
  // Mode State
  const [inputMode, setInputMode] = useState<InputMode>('MANUAL');
  const [activeTab, setActiveTab] = useState<ViewMode>('RECORDS');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  // Excel Data State
  const [excelData, setExcelData] = useState<CropData[]>([]);
  
  // Manual Data State (Persistent)
  const [crops, setCrops] = useState<CropProfile[]>(() => {
    const saved = localStorage.getItem('agri_crops');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration Logic for Old Data
        return parsed.map((c: any) => {
          const hasNewFields = c.masterCrop && c.batchName;
          const name = c.name || 'Unknown';
          const splitName = name.split('-');
          
          return { 
            ...c, 
            status: c.endDate ? 'COMPLETED' : (c.status || 'ACTIVE'),
            type: c.type || 'SEASONAL',
            startDate: c.startDate || new Date().toISOString().split('T')[0],
            endDate: c.endDate || null,
            masterCrop: hasNewFields ? c.masterCrop : (splitName[0] ? splitName[0].trim() : 'Unknown'),
            batchName: hasNewFields ? c.batchName : (splitName[1] ? splitName[1].trim() : name)
          };
        });
      } catch (e) {
        console.error("Failed to parse crops from local storage", e);
        return [];
      }
    }
    return [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('agri_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // View Filter State
  const [selectedMasterCrop, setSelectedMasterCrop] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL'); 

  const [appState, setAppState] = useState<AppState>(AppState.DASHBOARD);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { t, language, setLanguage } = useLanguage();

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('agri_crops', JSON.stringify(crops));
  }, [crops]);

  useEffect(() => {
    localStorage.setItem('agri_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Derived Data Logic
  const activeData: CropData[] = useMemo(() => {
    if (inputMode === 'EXCEL') {
      return excelData;
    } else {
      let filteredCrops = crops;
      const currentYear = new Date().getFullYear().toString();

      // 1. Priority Filter: Master Crop
      if (selectedMasterCrop !== 'ALL') {
        filteredCrops = filteredCrops.filter(c => c.masterCrop === selectedMasterCrop);
      }

      // 2. Filter by Year (Including HISTORY_ONLY logic)
      if (selectedYear === 'HISTORY_ONLY') {
        // Exclude current year, only completed
        filteredCrops = filteredCrops.filter(c => {
          const sDate = c.startDate || '';
          if (!sDate) return false;
          const year = sDate.split('-')[0];
          return c.status === 'COMPLETED' && year !== currentYear;
        });
      } else if (selectedYear !== 'ALL') {
        // Specific Year
        filteredCrops = filteredCrops.filter(c => (c.startDate || '').startsWith(selectedYear));
      } 

      // 3. Aggregate manual transactions for those crops
      return aggregateTransactions(filteredCrops, transactions);
    }
  }, [inputMode, excelData, crops, transactions, selectedMasterCrop, selectedYear]);

  const displayData = useMemo(() => {
    const processed = activeData.map(crop => {
      // Find original profile to get detailed name info
      const profile = crops.find(p => p.id === crop.id);
      
      let displayName = crop.name;
      // If manual mode, generate name with YEAR only (Cleaner View)
      if (inputMode === 'MANUAL' && profile) {
        // Extract Year from start date safely
        const year = profile.startDate ? profile.startDate.split('-')[0] : '';

        if (selectedMasterCrop !== 'ALL') {
           // If we are looking at ONE master crop, distinguish by batch date
           displayName = `${year} (${profile.startDate})`;
        } else {
           // Overview: Master Name + Year
           const transMaster = getTranslatedCropName(profile.masterCrop, language);
           displayName = `${transMaster} (${year})`;
        }
      } else {
        displayName = getTranslatedCropName(crop.name, language);
      }

      return {
        ...crop,
        name: displayName
      };
    });

    // SORTING: Sort by Profit (Descending) - Highest profit first (left)
    return processed.sort((a, b) => b.profit - a.profit);
  }, [activeData, language, selectedMasterCrop, crops, inputMode]);

  // --- YEARLY AGGREGATION LOGIC ---
  const yearlyAggregatedData = useMemo(() => {
    if (selectedYear !== 'ALL' && selectedYear !== 'HISTORY_ONLY') return [];

    const grouped: Record<string, { year: string, profit: number, revenue: number, cost: number }> = {};

    activeData.forEach(crop => {
       const profile = crops.find(p => p.id === crop.id);
       if (profile && profile.startDate) {
          const year = profile.startDate.split('-')[0];
          if (!grouped[year]) {
            grouped[year] = { year, profit: 0, revenue: 0, cost: 0 };
          }
          grouped[year].profit += crop.profit;
          grouped[year].revenue += crop.revenue;
          grouped[year].cost += crop.totalCost;
       }
    });

    return Object.values(grouped).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [activeData, crops, selectedYear]);

  // --- GLOBAL COST BREAKDOWN LOGIC ---
  const overallCostBreakdown = useMemo(() => {
    const breakdown = {
      seeds: 0, sowing: 0, fertilizer: 0, labor: 0, irrigation: 0, 
      pestControl: 0, harvest: 0, transport: 0, preserve: 0, other: 0
    };

    activeData.forEach(crop => {
       breakdown.seeds += crop.costBreakdown.seeds;
       breakdown.sowing += crop.costBreakdown.sowing;
       breakdown.fertilizer += crop.costBreakdown.fertilizer;
       breakdown.labor += crop.costBreakdown.labor;
       breakdown.irrigation += crop.costBreakdown.irrigation;
       breakdown.pestControl += crop.costBreakdown.pestControl;
       breakdown.harvest += crop.costBreakdown.harvest;
       breakdown.transport += crop.costBreakdown.transport;
       breakdown.preserve += crop.costBreakdown.preserve;
       breakdown.other += crop.costBreakdown.other;
    });

    return breakdown;
  }, [activeData]);


  // --- DYNAMIC FILTERS ---
  const availableMasterCrops = useMemo(() => {
    let filtered = crops;
    if (selectedYear !== 'ALL' && selectedYear !== 'HISTORY_ONLY') {
      filtered = filtered.filter(c => (c.startDate || '').startsWith(selectedYear));
    }
    const names = new Set(filtered.map(c => c.masterCrop).filter(Boolean));
    return Array.from(names).sort();
  }, [crops, selectedYear]);

  const availableYears = useMemo(() => {
    let filtered = crops;
    if (selectedMasterCrop !== 'ALL') {
      filtered = filtered.filter(c => c.masterCrop === selectedMasterCrop);
    }
    const years = new Set(filtered.map(c => (c.startDate || '').split('-')[0]).filter(Boolean));
    return Array.from(years).sort().reverse(); 
  }, [crops, selectedMasterCrop]);

  // Identify Crops matching specific criteria
  const { criticalCrops, warningCrops } = useMemo(() => {
    const critical = displayData.filter(c => {
      if (c.status === 'ACTIVE') return false;
      return c.profit <= 0 && c.totalCost > 0;
    }); 

    const warning = displayData.filter(c => {
      if (c.status === 'ACTIVE') return false;
      return c.profit > 0 && c.profit <= c.totalCost;
    });

    return { criticalCrops: critical, warningCrops: warning };
  }, [displayData]);

  // Auto-select crop for Pie Chart
  useEffect(() => {
    if (displayData.length > 0) {
      const exists = displayData.some(c => c.id === selectedCropId);
      if (!selectedCropId || !exists) {
        setSelectedCropId(displayData[0].id);
      }
    } else {
      setSelectedCropId('');
    }
  }, [displayData, selectedCropId]);

  // Handle Input Mode Switch
  useEffect(() => {
    if (inputMode === 'EXCEL') {
      setActiveTab('ANALYTICS');
    }
  }, [inputMode]);

  // Handlers for Manual Mode
  const handleAddCrop = (masterCrop: string, startDate: string, type: CropType) => {
    const displayName = `${masterCrop} (${startDate})`;
    const newCrop: CropProfile = {
      id: Date.now().toString(),
      name: displayName,
      masterCrop,
      batchName: '', 
      status: 'ACTIVE',
      startDate,
      endDate: null,
      type
    };
    setCrops([...crops, newCrop]);
  };

  const handleEditCrop = (id: string, newMaster: string, startDate: string, endDate: string | null) => {
    setCrops(crops.map(c => c.id === id ? { 
      ...c, 
      masterCrop: newMaster,
      startDate: startDate,
      endDate: endDate, 
      status: endDate ? 'COMPLETED' : 'ACTIVE',
      name: `${newMaster} (${startDate})`
    } : c));
  };

  const handleCompleteCrop = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCrops(crops.map(crop => 
      crop.id === id 
        ? { ...crop, status: 'COMPLETED', endDate: today }
        : crop
    ));
  };

  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    const t: Transaction = {
      ...newT,
      id: Date.now().toString()
    };
    setTransactions([...transactions, t]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleLoadDemoData = () => {
    const isDemoLoaded = crops.some(c => c.id === 'c23_1');
    if (isDemoLoaded) {
      setSuccessMsg("Demo data is already loaded");
      setTimeout(() => setSuccessMsg(null), 3000);
      return;
    }
    setCrops(prev => [...prev, ...DEMO_CROPS]);
    setTransactions(prev => [...prev, ...DEMO_TRANSACTIONS]);
    setSuccessMsg(t('demoLoaded'));
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleClearData = () => {
    if (window.confirm(t('clearConfirm'))) {
      setCrops([]);
      setTransactions([]);
      setSuccessMsg(t('dataCleared'));
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleResetFilters = () => {
    setSelectedMasterCrop('ALL');
    setSelectedYear('ALL');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ crops, transactions }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agri_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.crops) && Array.isArray(json.transactions)) {
          setCrops(json.crops);
          setTransactions(json.transactions);
          setSuccessMsg(t('backupSuccess'));
          setTimeout(() => setSuccessMsg(null), 3000);
        } else {
          throw new Error("Invalid structure");
        }
      } catch (err) {
        setError(t('backupError'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExcelLoaded = (loadedData: CropData[]) => {
    setExcelData(loadedData);
    setAppState(AppState.DASHBOARD);
    setError(null);
  };

  const handleExcelError = (msg: string) => {
    setError(msg);
  };

  const resetExcelData = () => {
    setExcelData([]);
  };

  const selectedCrop = displayData.find(c => c.id === selectedCropId);

  // --- KPI CALCULATIONS ---
  const totalProfit = displayData.reduce((acc, curr) => acc + curr.profit, 0);
  const totalRevenue = displayData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalCost = displayData.reduce((acc, curr) => acc + curr.totalCost, 0);
  
  const bestCropName = displayData.length > 0 
    ? displayData.reduce((prev, current) => {
        const prevRatio = prev.totalCost > 0 ? (prev.profit / prev.totalCost) : 0;
        const currRatio = current.totalCost > 0 ? (current.profit / current.totalCost) : 0;
        return (prevRatio > currRatio) ? prev : current;
      }).name 
    : '-';
  
  // --- YEAR STATISTICS FOR AVG CALC ---
  const yearStats = useMemo(() => {
     if (activeData.length === 0) return { count: 1 };
     
     // Get all years from the active data
     const years = new Set(
        activeData
          .map(c => {
             // Safe check for startDate from the PROFILE, using find
             const profile = crops.find(p => p.id === c.id);
             const sDate = c.startDate || profile?.startDate;
             
             if (!sDate) return null; 
             return parseInt(sDate.split('-')[0]);
          })
          .filter(y => y !== null && !isNaN(y))
     );
     
     const uniqueYears = Array.from(years) as number[];
     
     if (uniqueYears.length === 0) return { count: 1 };

     const min = Math.min(...uniqueYears);
     const max = Math.max(...uniqueYears);
     
     // Calculate Span (e.g. 2023 to 2024 = 2 years)
     const span = max - min + 1;
     
     return { count: span };
  }, [activeData, crops]);

  // Formula: Total Profit / (Span of Years * 12)
  const avgMonthlyProfit = totalProfit / (yearStats.count * 12);
  
  const toggleLangMenu = () => {
    setIsLangMenuOpen(!isLangMenuOpen);
  };
  
  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const currentYearStr = new Date().getFullYear().toString();
  const isHistoryView = selectedYear === 'HISTORY_ONLY' || (selectedYear !== 'ALL' && selectedYear !== currentYearStr);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg shrink-0">
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 hidden md:block">
                {t('appTitle')}
              </h1>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 md:hidden">
                AgriCrop
              </h1>
            </div>
            
            {/* CENTRAL NAVIGATION TABS (Only in Manual Mode) */}
            {inputMode === 'MANUAL' && (
              <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                 <button
                   onClick={() => setActiveTab('RECORDS')}
                   className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'RECORDS' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <ClipboardList className="w-4 h-4" />
                   {t('navRecords')}
                 </button>
                 <button
                   onClick={() => setActiveTab('ANALYTICS')}
                   className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'ANALYTICS' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <LayoutDashboard className="w-4 h-4" />
                   {t('navAnalytics')}
                 </button>
              </div>
            )}
            
            <div className="flex items-center gap-1 sm:gap-4">
              <div className="flex bg-slate-100 rounded-lg p-1 mr-1 sm:mr-2">
                <button
                  onClick={() => setInputMode('MANUAL')}
                  className={`flex items-center gap-2 px-2 py-1.5 sm:px-3 text-xs sm:text-sm rounded-md font-medium transition-all ${inputMode === 'MANUAL' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                  title={t('switchToManual')}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInputMode('EXCEL')}
                  className={`flex items-center gap-2 px-2 py-1.5 sm:px-3 text-xs sm:text-sm rounded-md font-medium transition-all ${inputMode === 'EXCEL' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  title={t('switchToExcel')}
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>

              {inputMode === 'MANUAL' && (
                <div className="hidden sm:flex items-center gap-0.5 border-r border-slate-200 pr-1 sm:pr-3 mr-0.5 sm:mr-1">
                   <button 
                    onClick={handleLoadDemoData}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title={t('loadDemo')}
                   >
                     <Database className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={handleClearData}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('clearData')}
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={handleExportData}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title={t('exportData')}
                   >
                     <Download className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={handleImportClick}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={t('importData')}
                   >
                     <Upload className="w-5 h-5" />
                   </button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept=".json" 
                     onChange={handleImportFile}
                   />
                </div>
              )}

              <div className="relative">
                 <button 
                   onClick={toggleLangMenu}
                   className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                 >
                   <Languages className="w-4 h-4" />
                   <span className="uppercase">{language}</span>
                 </button>
                 
                 {isLangMenuOpen && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)}></div>
                     
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                       <button onClick={() => selectLanguage('ta')} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-50 ${language === 'ta' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'}`}>தமிழ் (Tamil)</button>
                       <button onClick={() => selectLanguage('en')} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 ${language === 'en' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'}`}>English</button>
                     </div>
                   </>
                 )}
              </div>

              {inputMode === 'EXCEL' && excelData.length > 0 && (
                <button
                  onClick={resetExcelData}
                  className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                  title={t('resetData')}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* MOBILE NAVIGATION TABS */}
          {inputMode === 'MANUAL' && (
            <div className="md:hidden flex border-t border-slate-100">
               <button
                 onClick={() => setActiveTab('RECORDS')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${activeTab === 'RECORDS' ? 'text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-500'}`}
               >
                 <ClipboardList className="w-4 h-4" />
                 {t('navRecords')}
               </button>
               <button
                 onClick={() => setActiveTab('ANALYTICS')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${activeTab === 'ANALYTICS' ? 'text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500'}`}
               >
                 <LayoutDashboard className="w-4 h-4" />
                 {t('navAnalytics')}
               </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <Sprout className="w-5 h-5" />
              {successMsg}
            </span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">Dismiss</button>
          </div>
        )}

        {/* --- EXCEL MODE UPLOAD SCREEN --- */}
        {inputMode === 'EXCEL' && excelData.length === 0 && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
             <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                {t('heroTitle')}
              </h2>
              <FileUploader onDataLoaded={handleExcelLoaded} onError={handleExcelError} />
            </div>
          </div>
        )}

        {/* --- VIEW 1: RECORDS (MANUAL ENTRY) --- */}
        {inputMode === 'MANUAL' && activeTab === 'RECORDS' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
             {/* Left Column: Form */}
             <div className="lg:col-span-1">
               <TransactionForm 
                 crops={crops} 
                 onAddCrop={handleAddCrop} 
                 onEditCrop={handleEditCrop}
                 onAddTransaction={handleAddTransaction}
                 onCompleteCrop={handleCompleteCrop}
               />
             </div>
             
             {/* Right Column: List */}
             <div className="lg:col-span-2">
               <TransactionList 
                 transactions={transactions} 
                 crops={crops} 
                 onDelete={handleDeleteTransaction}
               />
             </div>
          </div>
        )}

        {/* --- VIEW 2: ANALYTICS (DASHBOARD) --- */}
        {(activeTab === 'ANALYTICS' && (inputMode === 'MANUAL' || (inputMode === 'EXCEL' && excelData.length > 0))) && (
          <div className="space-y-8 animate-fade-in">
             
             {/* FILTERS TOOLBAR */}
             {inputMode === 'MANUAL' && (
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                       <Filter className="w-4 h-4 text-slate-400" />
                       <span className="text-sm font-medium text-slate-700">{t('filterByYear')}</span>
                       <select 
                         value={selectedYear}
                         onChange={(e) => setSelectedYear(e.target.value)}
                         className="text-sm border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                       >
                         <option value="ALL">{t('allYears')}</option>
                         <option value="HISTORY_ONLY">{t('historyOnly')}</option>
                         {availableYears.map(year => (
                           <option key={year} value={year}>{year}</option>
                         ))}
                       </select>
                    </div>

                    <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-slate-700">{t('filterByCrop')}</span>
                       <select 
                         value={selectedMasterCrop}
                         onChange={(e) => setSelectedMasterCrop(e.target.value)}
                         className="text-sm border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                       >
                         <option value="ALL">{t('allCrops')}</option>
                         {availableMasterCrops.map(name => (
                           <option key={name} value={name}>{name}</option>
                         ))}
                       </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                     {(selectedMasterCrop !== 'ALL' || selectedYear !== 'ALL') && (
                       <button 
                         onClick={handleResetFilters}
                         className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1"
                       >
                         <RotateCcw className="w-3 h-3" />
                         {t('resetFilters')}
                       </button>
                     )}
                  </div>
               </div>
             )}

             {displayData.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-xl border border-slate-100 border-dashed">
                 <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                 <h3 className="text-lg font-medium text-slate-900">{t('noDataTitle')}</h3>
                 <p className="text-slate-500">{t('noDataDesc')}</p>
                 <p className="text-sm text-indigo-500 mt-2">{t('suggestion')} {t('checkFilters')}</p>
               </div>
             ) : (
               <>
                 {/* ALERTS SECTION */}
                 {(criticalCrops.length > 0 || warningCrops.length > 0) && (
                   <div className="grid gap-4">
                     {criticalCrops.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                          <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">{t('criticalAlertTitle')}</h4>
                            <p className="text-sm text-red-700 leading-relaxed">
                               {isHistoryView 
                                  ? t('criticalAlertMessageHistory').replace('{crops}', criticalCrops.map(c => c.name).join(', '))
                                  : t('criticalAlertMessage').replace('{crops}', criticalCrops.map(c => c.name).join(', '))
                               }
                            </p>
                          </div>
                        </div>
                     )}
                     {warningCrops.length > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-1">{t('warningAlertTitle')}</h4>
                            <p className="text-sm text-amber-700 leading-relaxed">
                               {t('warningAlertMessage').replace('{crops}', warningCrops.map(c => c.name).join(', '))}
                            </p>
                          </div>
                        </div>
                     )}
                   </div>
                 )}

                 {/* KPI CARDS - REORDERED & 3 COLUMNS */}
                 <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {/* 1. Total Operational Cost */}
                   <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500 mb-1">{t('totalOpCost')}</p>
                     <p className="text-2xl font-bold text-slate-800">₹{totalCost.toLocaleString()}</p>
                   </div>

                   {/* 2. Total Profit */}
                   <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500 mb-1">{t('totalProfit')}</p>
                     <p className="text-2xl font-bold text-emerald-600">₹{totalProfit.toLocaleString()}</p>
                   </div>

                   {/* 3. Avg Monthly Profit */}
                   <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500 mb-1">{t('avgMonthlyProfit')}</p>
                     <p className="text-2xl font-bold text-emerald-600">₹{Math.round(avgMonthlyProfit).toLocaleString()}</p>
                   </div>
                   
                   {/* 4. Total Revenue */}
                   <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500 mb-1">{t('totalRevenue')}</p>
                     <p className="text-2xl font-bold text-indigo-600">₹{totalRevenue.toLocaleString()}</p>
                   </div>

                   {/* 5. Highest Efficiency Crop */}
                   <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                     <p className="text-sm font-medium text-slate-500 mb-1">{t('highestProfitCrop')}</p>
                     <p className="text-lg font-bold text-slate-800 truncate" title={bestCropName}>{bestCropName}</p>
                   </div>
                 </div>

                 {/* CHARTS GRID */}
                 <div className="grid lg:grid-cols-2 gap-8">
                    {/* 1. Yearly Performance (Conditional) */}
                    {(selectedYear === 'ALL' || selectedYear === 'HISTORY_ONLY') && yearlyAggregatedData.length > 0 && (
                       <div className="lg:col-span-2">
                          <YearlyPerformanceChart data={yearlyAggregatedData} />
                       </div>
                    )}

                    {/* 2. Profit Efficiency (ROI) */}
                    <ProfitBarChart 
                      data={displayData} 
                      criticalIds={criticalCrops.map(c => c.id)} 
                      warningIds={warningCrops.map(c => c.id)}
                    />

                    {/* 3. Revenue vs Cost */}
                    <RevenueCostChart 
                      data={displayData} 
                      criticalIds={criticalCrops.map(c => c.id)} 
                      warningIds={warningCrops.map(c => c.id)}
                    />
                 </div>
                 
                 {/* DETAILED ANALYSIS SECTION */}
                 <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                      {/* Overall Summary Bar Chart */}
                      <OverallSummaryChart data={displayData} />
                      {/* NEW: Global Cost Breakdown Pie Chart (Aggregated) */}
                      <GlobalCostPieChart costBreakdown={overallCostBreakdown} />
                    </div>
                    <div className="lg:col-span-2">
                       {/* Selector for Single Crop Pie Chart */}
                       {displayData.length > 0 && (
                         <div className="mb-4 flex items-center justify-end">
                           <label className="text-sm text-slate-500 mr-2">{t('viewingCrop')}</label>
                           <select 
                             value={selectedCropId} 
                             onChange={(e) => setSelectedCropId(e.target.value)}
                             className="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                           >
                             {displayData.map(c => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                             ))}
                           </select>
                         </div>
                       )}
                       {selectedCrop && <CostBreakdownPieChart crop={selectedCrop} />}
                    </div>
                 </div>

               </>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
