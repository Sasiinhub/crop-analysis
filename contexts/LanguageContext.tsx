
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

export const translations = {
  en: {
    appTitle: "AgriCrop Analytics",
    resetData: "Reset Data",
    heroTitle: "Crop Profit & Cost Analyzer",
    heroSubtitle: "Upload your CSV/Excel file containing 'Crop', 'Profit', and cost breakdown columns (Seeds, Fertilizer, Labor, etc.) to visualize performance.",
    dropFile: "Drop your Excel/CSV file",
    processing: "Processing File...",
    useSample: "Use sample data (Maize, Banana...)",
    pythonCompat: "Python Script Compatibility",
    pythonDesc: "This app accepts the exact CSV format from your Python script (columns: Crop, Profit, Seeds_cost, Sowing, Fertilizer, Labor, Irrigation, Pest_Control).",
    
    // Navigation
    navRecords: "Daily Records",
    navAnalytics: "Analytics Dashboard",

    // KPIs
    totalProfit: "Total Profit",
    avgMonthlyProfit: "Avg. Monthly Profit",
    totalRevenue: "Total Revenue",
    highestProfitCrop: "Highest Efficiency Crop",
    totalOpCost: "Total Operational Cost",

    // Alerts
    criticalAlertTitle: "Critical Alert: Loss Making Crops",
    warningAlertTitle: "Warning: Low Profit Margin",
    criticalAlertMessage: "The following crops are generating zero or negative profit: {crops}. Immediate action required.",
    criticalAlertMessageHistory: "The following crops generated zero or negative profit: {crops}. Alert.", 
    warningAlertMessage: "The following crops have high costs relative to profit (Profit ≤ Cost): {crops}. Consider optimizing expenses.",

    // Charts
    profitChartTitle: "Profit Efficiency (ROI)",
    yearlyPerformanceTitle: "Yearly Financial Overview",
    costAnalysisFor: "Cost Analysis for:",
    globalCostAnalysis: "Total Expense Distribution (All Selected)",
    financialOverviewTitle: "Financial Overview",
    grandTotalsTitle: "Grand Totals",
    
    // Chart Labels
    revenue: "Revenue",
    profit: "Profit",
    cost: "Total Cost", 
    amount: "Amount",
    lowMargin: "Low Margin (Profit ≤ Cost)",
    lossMaking: "Loss Making (Profit ≤ 0)",
    roi: "ROI Ratio",
    
    // Cost Breakdown
    seeds: "Seeds",
    sowing: "Sowing",
    fertilizer: "Fertilizer",
    labor: "Labor",
    irrigation: "Irrigation",
    pestControl: "Pest Control",
    harvest: "Harvest",
    transport: "Transport",
    preserve: "Preserve/Storage",
    other: "Other",

    // Income Categories
    sale: "Market Sale",
    own_use: "Own Consumption (Value)",

    // Manual Entry
    modeManual: "Daily Record Book",
    modeExcel: "Upload Excel Analysis",
    manageCropsTab: "Manage Crops", 
    addNewCrop: "Start New Crop",     
    updateCrop: "Update Details",      
    edit: "Edit",
    cancel: "Cancel",
    addTransaction: "Add Transaction",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions recorded yet. Start by adding a crop and recording expenses!",
    date: "Date",
    selectCrop: "Select Crop Batch",
    transType: "Type",
    expense: "Expense",
    income: "Income / Sale",
    category: "Category",
    description: "Description (Optional)",
    save: "Save Record",
    cropName: "Display Name",
    enterCropName: "e.g. Maize - Summer 2024",
    delete: "Delete",
    dashboard: "Dashboard",
    ledger: "Ledger",
    switchToExcel: "Switch to Excel Upload",
    switchToManual: "Switch to Daily Records",
    
    // Backup & Clear
    exportData: "Backup Data",
    importData: "Restore Backup",
    loadDemo: "Load Demo Data",
    clearData: "Clear All Records",
    clearConfirm: "Are you sure? This will delete ALL crops and transactions permanently.",
    demoLoaded: "Demo data loaded successfully!",
    dataCleared: "All data cleared successfully.",
    backupSuccess: "Data restored successfully!",
    backupError: "Invalid backup file.",

    // Crop Status
    statusActive: "Active",
    statusCompleted: "Completed",
    markCompleted: "Complete Batch",
    markActive: "Reactivate",
    manageCrops: "Manage Crops",
    activeCropsOnly: "Showing Active Crops only",
    cropAdded: "Crop Added!",
    cropHint: "Tip: Add a season or year to distinguish crops (e.g., 'Rice - 2024'). When done, mark as 'Completed'.",

    // New Fields
    sowingDate: "Start Date",
    endDate: "End Date",
    cropType: "Crop Cycle Type",
    typeSeasonal: "Seasonal (One-time Harvest)",
    typePerennial: "Perennial (Continuous Yield)",
    year: "Year",
    editCaution: "Caution: Modifying dates of a completed crop may affect historical reports.",
    
    // Master Crop Logic
    masterCropName: "Crop Name (e.g. Maize)",
    filterByCrop: "Filter by Crop:",
    filterByYear: "Filter by Year:",
    allCrops: "All Crops",
    allYears: "All Years",
    historyOnly: "History Only (Excl. Current Year)",
    viewingCrop: "Viewing Analysis for:",
    compareYears: "Compare Year to Year",

    // Empty States & Conflicts
    noDataTitle: "No Data Found",
    noDataDesc: "There are no records matching your current filters.",
    suggestion: "Suggestion:",
    resetFilters: "Reset Filters",
    showHistory: "Show All History",
    checkFilters: "Check your Year or Active Status filters."
  },
  ta: {
    appTitle: "விவசாய பயிர் பகுப்பாய்வு",
    resetData: "தரவை மீட்டமை",
    heroTitle: "பயிர் இலாபம் மற்றும் செலவு பகுப்பாய்வி",
    heroSubtitle: "செயல்திறனைப் பார்க்க, 'பயிர்', 'இலாபம்' மற்றும் செலவு விவரங்கள் (விதைகள், உரம், உழைப்பு போன்றவை) கொண்ட உங்கள் CSV/Excel கோப்பை பதிவேற்றவும்.",
    dropFile: "உங்கள் Excel/CSV கோப்பை இங்கே விடவும்",
    processing: "கோப்பு செயலாக்கப்படுகிறது...",
    useSample: "மாதிரி தரவைப் பயன்படுத்தவும் (சோளம், வாழை...)",
    pythonCompat: "பைதான் ஸ்கிரிப்ட் இணக்கத்தன்மை",
    pythonDesc: "இந்த செயலி உங்கள் பைதான் ஸ்கிரிப்டிலிருந்து சரியான CSV வடிவத்தை ஏற்றுக்கொள்கிறது.",
    
    navRecords: "தினசரி பதிவுகள்",
    navAnalytics: "பகுப்பாய்வு பலகை",

    totalProfit: "மொத்த இலாபம்",
    avgMonthlyProfit: "சராசரி மாத இலாபம்",
    totalRevenue: "மொத்த வருவாய்",
    highestProfitCrop: "சிறந்த திறன் கொண்ட பயிர்", 
    totalOpCost: "மொத்த செயல்பாட்டு செலவு",

    criticalAlertTitle: "முக்கிய எச்சரிக்கை: நஷ்டம் தரும் பயிர்கள்",
    warningAlertTitle: "எச்சரிக்கை: குறைவான இலாப வரம்பு",
    criticalAlertMessage: "பின்வரும் பயிர்கள் பூஜ்ஜியம் அல்லது எதிர்மறை இலாபத்தை உருவாக்குகின்றன: {crops}. உடனடி நடவடிக்கை தேவை.",
    criticalAlertMessageHistory: "பின்வரும் பயிர்கள் பூஜ்ஜியம் அல்லது எதிர்மறை இலாபத்தை உருவாக்கின: {crops}. எச்சரிக்கை.",
    warningAlertMessage: "பின்வரும் பயிர்கள் இலாபத்துடன் ஒப்பிடும்போது அதிக செலவுகளைக் கொண்டுள்ளன (இலாபம் ≤ செலவு): {crops}. செலவுகளைக் குறைக்க முயற்சிக்கவும்.",

    profitChartTitle: "இலாப செயல்திறன் (ROI)",
    yearlyPerformanceTitle: "ஆண்டு நிதி கண்ணோட்டம்",
    costAnalysisFor: "செலவு பகுப்பாய்வு:",
    globalCostAnalysis: "மொத்த செலவு விநியோகம்",
    financialOverviewTitle: "நிதி கண்ணோட்டம்",
    grandTotalsTitle: "மொத்த நிதி சுருக்கம்",
    
    revenue: "வருவாய்",
    profit: "இலாபம்",
    cost: "மொத்த செலவு",
    amount: "தொகை",
    lowMargin: "குறைந்த இலாபம் (இலாபம் ≤ செலவு)",
    lossMaking: "நஷ்டம் (இலாபம் ≤ 0)",
    roi: "ROI விகிதம்",
    
    seeds: "விதைகள்",
    sowing: "விதைப்பு",
    fertilizer: "உரம்",
    labor: "உழைப்பு",
    irrigation: "நீர்ப்பாசனம்",
    pestControl: "பூச்சி கட்டுப்பாடு",
    harvest: "அறுவடை",
    transport: "போக்குவரத்து",
    preserve: "பாதுகாப்பு/சேமிப்பு",
    other: "மற்றவை",

    sale: "சந்தை விற்பனை",
    own_use: "சொந்த பயன்பாடு (மதிப்பு)",

    modeManual: "தினசரி பதிவு புத்தகம்",
    modeExcel: "Excel பதிவேற்றம்",
    manageCropsTab: "பயிர் மேலாளர்",
    addNewCrop: "புதிய பயிரைத் தொடங்குங்கள்",
    updateCrop: "விவரங்களைப் புதுப்பிக்கவும்",
    edit: "திருத்து",
    cancel: "ரத்துசெய்",
    addTransaction: "பரிவர்த்தனையைச் சேர்",
    recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
    noTransactions: "பரிவர்த்தனைகள் எதுவும் இன்னும் பதிவு செய்யப்படவில்லை. ஒரு பயிரைச் சேர்ப்பதன் மூலம் தொடங்கவும்!",
    date: "தேதி",
    selectCrop: "பயிர் தொகுதியை தேர்ந்தெடுக்கவும்",
    transType: "வகை",
    expense: "செலவு",
    income: "வருமானம் / விற்பனை",
    category: "வகை",
    description: "விளக்கம் (விரும்பினால்)",
    save: "சேமி",
    cropName: "காட்சி பெயர்",
    enterCropName: "எ.கா. சோளம் - 2024",
    delete: "அழி",
    dashboard: "முகப்பு",
    ledger: "கணக்கு புத்தகம்",
    switchToExcel: "Excel பதிவேற்றத்திற்கு மாறவும்",
    switchToManual: "தினசரி பதிவுக்கு மாறவும்",

    exportData: "தரவு காப்பு",
    importData: "காப்புப்பிரதியை மீட்டமை",
    loadDemo: "மாதிரி தரவை ஏற்றவும்",
    clearData: "அனைத்து பதிவுகளையும் அழிக்கவும்",
    clearConfirm: "நிச்சயமா? இது அனைத்து பயிர்களையும் பரிவர்த்தனைகளையும் நிரந்தரமாக அழித்துவிடும்.",
    demoLoaded: "மாதிரி தரவு வெற்றிகரமாக ஏற்றப்பட்டது!",
    dataCleared: "அனைத்து தரவும் வெற்றிகரமாக அழிக்கப்பட்டது.",
    backupSuccess: "தரவு வெற்றிகரமாக மீட்டமைக்கப்பட்டது!",
    backupError: "தவறான காப்பு கோப்பு.",

    statusActive: "செயலில் உள்ளது",
    statusCompleted: "முடிந்தது",
    markCompleted: "முடிந்தது",
    markActive: "மீண்டும் இயக்கவும்",
    manageCrops: "பயிர்களை நிர்வகிக்கவும்",
    activeCropsOnly: "செயலில் உள்ள பயிர்கள் மட்டும்",
    cropAdded: "பயிர் சேர்க்கப்பட்டது!",
    cropHint: "உதவிக்குறிப்பு: பயிர்களை வேறுபடுத்த ஒரு வருடம் அல்லது பருவத்தைச் சேர்க்கவும் (எ.கா. 'அரிசி - 2024'). முடிந்ததும், 'முடிந்தது' எனக் குறிக்கவும்.",

    sowingDate: "தொடங்கும் தேதி",
    endDate: "முடிவு தேதி",
    cropType: "பயிர் சுழற்சி வகை",
    typeSeasonal: "பருவகால (ஒரு முறை அறுவடை)",
    typePerennial: "வற்றாத (தொடர் விளைச்சல்)",
    year: "ஆண்டு",
    editCaution: "எச்சரிக்கை: முடிந்த பயிரின் தேதிகளை மாற்றுவது அறிக்கைகளைப் பாதிக்கலாம்.",

    masterCropName: "பயிர் பெயர் (எ.கா. சோளம்)",
    filterByCrop: "பயிர் மூலம் வடிகட்டவும்:",
    filterByYear: "ஆண்டு:",
    allCrops: "அனைத்து பயிர்கள்",
    allYears: "அனைத்து ஆண்டுகள்",
    historyOnly: "வரலாறு மட்டும் (நடப்பு ஆண்டு தவிர)",
    viewingCrop: "பகுப்பாய்வு பார்க்கப்படுகிறது:",
    compareYears: "ஆண்டுக்கு ஆண்டு ஒப்பீடு",

    noDataTitle: "தரவு இல்லை",
    noDataDesc: "தற்போதைய வடிப்பான்களுடன் எந்த பதிவுகளும் இல்லை.",
    suggestion: "பரிந்துரை:",
    resetFilters: "வடிப்பான்களை மீட்டமைக்கவும்",
    showHistory: "அனைத்து வரலாற்றையும் காட்டு",
    checkFilters: "உங்கள் ஆண்டு அல்லது நிலை வடிப்பான்களைச் சரிபார்க்கவும்."
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ta');

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
