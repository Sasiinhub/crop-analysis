
import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  ComposedChart,
  Line,
  Sector
} from 'recharts';
import { CropData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ChartsProps {
  data: CropData[];
  criticalIds?: string[]; // Profit <= 0 (Red)
  warningIds?: string[];  // Profit <= Cost (Orange/Purple)
}

interface SingleCropProps {
  crop: CropData;
}

interface GlobalCostProps {
  costBreakdown: {
    seeds: number;
    sowing: number;
    fertilizer: number;
    labor: number;
    irrigation: number;
    pestControl: number;
    harvest: number;
    transport: number;
    preserve: number;
    other: number;
  };
}

interface YearlyData {
  year: string;
  profit: number;
  revenue: number;
  cost: number;
}

interface YearlyChartProps {
  data: YearlyData[];
}

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#64748b'];

// Helper to determine color based on ID status
const getStatusColor = (id: string, criticalIds: string[] = [], warningIds: string[] = []) => {
  if (criticalIds.includes(id)) return '#ef4444'; // Red for Critical (Loss)
  if (warningIds.includes(id)) return '#a855f7'; // Purple for Warning (Low Margin) - Changed from Orange to be distinct
  return '#3b82f6'; // Blue for Healthy
};

// --- Helper for Scrollable Charts ---
// Only scrolls if data length exceeds a threshold (e.g. 8 items)
const ScrollableChartContainer: React.FC<{ dataLength: number, height: number, children: React.ReactNode }> = ({ dataLength, height, children }) => {
  // If data length is high, we force a wider minimum width to trigger scrolling
  // 60px per bar is a comfortable width
  const minWidth = dataLength > 8 ? Math.max(100, dataLength * 60) : '100%';
  
  return (
    <div className="w-full h-full overflow-hidden">
      <div className="w-full h-full overflow-x-auto custom-scrollbar pb-2">
         <div style={{ minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth, height: '100%' }}>
            {children}
         </div>
      </div>
    </div>
  );
};

// --- Helper for Scrollable Pie Charts (Mobile) ---
const ScrollablePieContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full h-full overflow-hidden relative">
      <div className="w-full h-full overflow-auto custom-scrollbar pb-2">
         {/* Min width ensures the chart renders large enough so labels don't get cut off */}
         <div className="min-w-[500px] sm:min-w-full h-full">
            {children}
         </div>
      </div>
    </div>
  );
};


export const YearlyPerformanceChart: React.FC<YearlyChartProps> = ({ data }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('yearlyPerformanceTitle')}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" stroke="#64748b" />
          <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val/1000}k`} />
          <Tooltip 
             contentStyle={{ borderRadius: '8px' }} 
             formatter={(value: number) => `₹${value.toLocaleString()}`}
          />
          <Legend verticalAlign="top" height={36}/>
          
          <Bar dataKey="revenue" name={t('revenue')} fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="cost" name={t('cost')} fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
          <Line type="monotone" dataKey="profit" name={t('profit')} stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProfitBarChart: React.FC<ChartsProps> = ({ data, criticalIds = [], warningIds = [] }) => {
  const { t } = useLanguage();

  // Prepare Data: Sort by Profit/Cost Ratio (Efficiency)
  const sortedData = useMemo(() => {
    return [...data].map(item => {
      // Calculate Ratio (Safe divide)
      const ratio = item.totalCost > 0 ? (item.profit / item.totalCost) : 0;
      return { ...item, ratio };
    }).sort((a, b) => b.ratio - a.ratio); // Highest Ratio (Best Efficiency) first
  }, [data]);

  const renderLegend = () => {
    const customPayload = [
      { value: t('cost'), color: '#f59e0b' },
      { value: t('profit'), color: '#3b82f6' },
      { value: t('roi'), color: '#10b981' } // Virtual legend item for context
    ];

    return (
      <div className="flex flex-col items-center mb-4 sticky left-0 right-0">
        <div className="text-xs text-slate-500 mb-2 font-medium bg-slate-100 px-3 py-1 rounded-full">
           Sorted by Efficiency (Less Cost &rarr; High Profit)
        </div>
        <ul className="flex flex-wrap justify-center gap-4 text-sm">
          {customPayload.map((entry, index) => (
            <li key={`item-${index}`} className="flex items-center">
              <span 
                className="w-3 h-3 mr-2 inline-block rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 font-medium">{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const profit = payload.find((p: any) => p.dataKey === 'profit');
      const cost = payload.find((p: any) => p.dataKey === 'totalCost');
      const ratio = cost?.payload?.ratio || 0;

      return (
        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="flex items-center justify-between gap-4">
              <span className="text-amber-600 font-medium">{t('cost')}:</span>
              <span>₹{cost?.value.toLocaleString()}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-blue-600 font-medium">{t('profit')}:</span>
              <span>₹{profit?.value.toLocaleString()}</span>
            </p>
            <div className="border-t border-slate-100 my-1 pt-1 mt-1">
              <p className="flex items-center justify-between gap-4 font-bold">
                <span className="text-emerald-600">Ratio:</span>
                <span className="text-emerald-700">{ratio.toFixed(2)}x</span>
              </p>
              <p className="text-[10px] text-slate-400 text-right">
                (Every ₹1 cost gives ₹{ratio.toFixed(2)} profit)
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] flex flex-col relative">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-lg font-semibold text-slate-800">{t('profitChartTitle')}</h3>
      </div>
      
      <ScrollableChartContainer dataLength={sortedData.length} height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tick={{fill: '#64748b', fontSize: 11}} 
              axisLine={false} 
              tickLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Legend verticalAlign="top" content={renderLegend} />
            
            <ReferenceLine y={0} stroke="#94a3b8" />

            {/* Cost Bar */}
            <Bar dataKey="totalCost" name={t('cost')} fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />

            {/* Profit Bar */}
            <Bar dataKey="profit" name={t('profit')} radius={[4, 4, 0, 0]} barSize={20}>
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getStatusColor(entry.id, criticalIds, warningIds)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ScrollableChartContainer>
    </div>
  );
};

export const RevenueCostChart: React.FC<ChartsProps> = ({ data, criticalIds = [], warningIds = [] }) => {
  const { t } = useLanguage();

  const renderLegend = () => {
    const payload = [
      { value: t('revenue'), color: '#10b981' },
      { value: t('profit'), color: '#3b82f6' },
      { value: t('cost'), color: '#f59e0b' }
    ];

    if (warningIds.length > 0) {
      payload.splice(2, 0, { value: t('lowMargin'), color: '#a855f7' });
    }
    if (criticalIds.length > 0) {
      const idx = warningIds.length > 0 ? 3 : 2;
      payload.splice(idx, 0, { value: t('lossMaking'), color: '#ef4444' });
    }

    return (
      <ul className="flex flex-wrap justify-center gap-4 text-sm mb-2 sticky left-0 right-0">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center">
            <span 
              className="w-3 h-3 mr-2 inline-block rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 font-medium">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Increased height to 500px to utilize space below
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[500px] flex flex-col relative">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('financialOverviewTitle')}</h3>
      
      <ScrollableChartContainer dataLength={data.length} height={450}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            // Increased bottom margin to accommodate tilted labels
            margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tick={{fill: '#64748b'}} 
              axisLine={false} 
              tickLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
            <Tooltip 
              formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              content={renderLegend}
            />
            
            {/* Revenue - Green */}
            <Bar dataKey="revenue" name={t('revenue')} fill="#10b981" radius={[4, 4, 0, 0]} />

            {/* Profit - Dynamic Color */}
            <Bar dataKey="profit" name={t('profit')} fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getStatusColor(entry.id, criticalIds, warningIds)} 
                />
              ))}
            </Bar>
            
            {/* Cost - Orange */}
            <Bar dataKey="totalCost" name={t('cost')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            
          </BarChart>
        </ResponsiveContainer>
      </ScrollableChartContainer>
    </div>
  );
};

export const OverallSummaryChart: React.FC<ChartsProps> = ({ data }) => {
  const { t } = useLanguage();
  const totalCost = data.reduce((sum, item) => sum + item.totalCost, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);

  // Dynamic bar size state
  const [barSize, setBarSize] = useState(60);

  useEffect(() => {
    const handleResize = () => {
      // Small bar size on mobile (screen width < 768px), standard on desktop
      setBarSize(window.innerWidth < 768 ? 40 : 80);
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const summaryData = [
    { name: t('cost'), value: totalCost, fill: '#f59e0b' },
    { name: t('profit'), value: totalProfit, fill: '#3b82f6' }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">{t('grandTotalsTitle')}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={summaryData}
          margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            tick={{fill: '#64748b'}} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
             stroke="#64748b" 
             tick={{fill: '#64748b'}} 
             axisLine={false} 
             tickLine={false}
             // Updated to show full number (e.g. 50,000) instead of abbreviated 'k'
             tickFormatter={(value) => `₹${value.toLocaleString()}`} 
             width={80} 
          />
          <Tooltip 
            formatter={(value: number) => [`₹${value.toLocaleString()}`, t('amount')]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f1f5f9' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={barSize}>
            {summaryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// New Chart: Aggregates costs from ALL visible crops
// Updated: Reduced height to match other pie charts and adjusted radius
export const GlobalCostPieChart: React.FC<GlobalCostProps> = ({ costBreakdown }) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const chartData = [
    { name: t('seeds'), value: costBreakdown.seeds },
    { name: t('sowing'), value: costBreakdown.sowing },
    { name: t('fertilizer'), value: costBreakdown.fertilizer },
    { name: t('labor'), value: costBreakdown.labor },
    { name: t('irrigation'), value: costBreakdown.irrigation },
    { name: t('pestControl'), value: costBreakdown.pestControl },
    { name: t('harvest'), value: costBreakdown.harvest },
    { name: t('transport'), value: costBreakdown.transport },
    { name: t('preserve'), value: costBreakdown.preserve },
    { name: t('other'), value: costBreakdown.other },
  ].filter(item => item.value > 0);

  const handleContainerClick = () => {
    setActiveIndex(null);
  };

  const onPieClick = (_: any, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(activeIndex === index ? null : index);
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm mt-4 px-2">
        {payload.map((entry: any, index: number) => (
          <li 
            key={`item-${index}`}
            className={`flex items-center cursor-pointer transition-opacity duration-300 ${
              activeIndex !== null && activeIndex !== index ? 'opacity-30' : 'opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(activeIndex === index ? null : index);
            }}
          >
            <span 
              className="w-3 h-3 mr-1.5 inline-block rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-slate-600 ${activeIndex === index ? 'font-bold text-slate-900' : 'font-medium'}`}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // If empty
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] flex items-center justify-center text-slate-400">
         {t('noDataDesc')}
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] flex flex-col cursor-default"
      onClick={handleContainerClick}
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('globalCostAnalysis')}</h3>
      <div className="flex-1 w-full h-full min-h-0">
        <ScrollablePieContainer>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="75%" 
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                onClick={onPieClick}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                    stroke={activeIndex === index ? '#000' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, t('cost')]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Legend 
                verticalAlign="bottom" 
                content={renderLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </ScrollablePieContainer>
      </div>
    </div>
  );
};

export const CostBreakdownPieChart: React.FC<SingleCropProps> = ({ crop }) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Transform breakdown object to array for Recharts with translated names
  const chartData = [
    { name: t('seeds'), value: crop.costBreakdown.seeds },
    { name: t('sowing'), value: crop.costBreakdown.sowing },
    { name: t('fertilizer'), value: crop.costBreakdown.fertilizer },
    { name: t('labor'), value: crop.costBreakdown.labor },
    { name: t('irrigation'), value: crop.costBreakdown.irrigation },
    { name: t('pestControl'), value: crop.costBreakdown.pestControl },
    { name: t('harvest'), value: crop.costBreakdown.harvest },
    { name: t('transport'), value: crop.costBreakdown.transport },
    { name: t('preserve'), value: crop.costBreakdown.preserve },
    { name: t('other'), value: crop.costBreakdown.other },
  ].filter(item => item.value > 0);

  const handleContainerClick = () => {
    setActiveIndex(null);
  };

  const onPieClick = (_: any, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(activeIndex === index ? null : index);
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm mt-4 px-2">
        {payload.map((entry: any, index: number) => (
          <li 
            key={`item-${index}`}
            className={`flex items-center cursor-pointer transition-opacity duration-300 ${
              activeIndex !== null && activeIndex !== index ? 'opacity-30' : 'opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(activeIndex === index ? null : index);
            }}
          >
            <span 
              className="w-3 h-3 mr-1.5 inline-block rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-slate-600 ${activeIndex === index ? 'font-bold text-slate-900' : 'font-medium'}`}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] cursor-default"
      onClick={handleContainerClick}
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('costAnalysisFor')} {crop.name}</h3>
      <ScrollablePieContainer>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="75%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              onClick={onPieClick}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  stroke={activeIndex === index ? '#000' : 'none'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`₹${value.toLocaleString()}`, t('cost')]}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
            <Legend 
              verticalAlign="bottom" 
              content={renderLegend}
            />
          </PieChart>
        </ResponsiveContainer>
      </ScrollablePieContainer>
    </div>
  );
};
