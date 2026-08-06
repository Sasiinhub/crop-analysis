
import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { CropData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploaderProps {
  onDataLoaded: (data: CropData[]) => void;
  onError: (msg: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const processFile = (file: File) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File is empty");

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Normalize data keys based on user's python script columns
        const normalizedData: CropData[] = jsonData.map((row: any, index: number) => {
          const seeds = Number(row['Seeds_cost'] || row['Seeds'] || 0);
          const sowing = Number(row['Sowing'] || 0);
          const fertilizer = Number(row['Fertilizer'] || 0);
          const labor = Number(row['Labor'] || 0);
          const irrigation = Number(row['Irrigation'] || 0);
          const pestControl = Number(row['Pest_Control'] || row['Pest'] || 0);
          const harvest = Number(row['Harvest'] || 0);
          const transport = Number(row['Transport'] || 0);
          const preserve = Number(row['Preserve'] || row['Storage'] || 0);
          
          // Calculate total known costs
          const totalKnownCost = seeds + sowing + fertilizer + labor + irrigation + pestControl + harvest + transport + preserve;
          
          // Try to find a total cost column, or use the sum
          const totalCost = Number(row['Cost'] || row['Total_Cost'] || totalKnownCost);
          const profit = Number(row['Profit'] || 0);

          // Calculate 'Other' if total cost is provided but higher than sum of parts
          const other = Math.max(0, totalCost - totalKnownCost);

          // Calculate Revenue (Revenue = Profit + Total Cost)
          // If a Revenue column exists, use it, otherwise calculate it.
          const revenue = Number(row['Revenue'] || row['Income'] || (profit + totalCost));

          return {
            id: `row-${index}`,
            name: row['Crop'] || row['Name'] || `Crop ${index + 1}`,
            yield: Number(row['Yield'] || row['Production'] || 0),
            profit: profit,
            revenue: revenue,
            costBreakdown: {
              seeds,
              sowing,
              fertilizer,
              labor,
              irrigation,
              pestControl,
              harvest,
              transport,
              preserve,
              other
            },
            totalCost: totalCost,
            ...row
          };
        }).filter(item => item.name);

        if (normalizedData.length === 0) {
          throw new Error("Could not find valid data. Please ensure columns match: Crop, Profit, Seeds_cost, Sowing, Fertilizer, Labor, Irrigation, Pest_Control");
        }

        onDataLoaded(normalizedData);
      } catch (err) {
        console.error(err);
        onError(err instanceof Error ? err.message : "Failed to parse file");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      onError("Failed to read file");
    };

    reader.readAsBinaryString(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const loadSampleData = () => {
    const sample: CropData[] = [
      { 
        id: '1', name: 'Maize', yield: 4.5, profit: 12000, totalCost: 8500, revenue: 20500,
        costBreakdown: { seeds: 1500, sowing: 800, fertilizer: 2000, labor: 2500, irrigation: 1000, pestControl: 700, harvest: 0, transport: 0, preserve: 0, other: 0 }
      },
      { 
        id: '2', name: 'Banana(nantheram)', yield: 9.2, profit: 25000, totalCost: 12000, revenue: 37000,
        costBreakdown: { seeds: 3000, sowing: 1000, fertilizer: 3500, labor: 2000, irrigation: 1500, pestControl: 1000, harvest: 0, transport: 0, preserve: 0, other: 0 }
      },
      { 
        id: '3', name: 'Cotton', yield: 2.1, profit: 15000, totalCost: 9500, revenue: 24500,
        costBreakdown: { seeds: 2000, sowing: 900, fertilizer: 2500, labor: 3000, irrigation: 800, pestControl: 300, harvest: 0, transport: 0, preserve: 0, other: 0 }
      },
      { 
        id: '4', name: 'Rice', yield: 5.8, profit: 18000, totalCost: 11000, revenue: 29000,
        costBreakdown: { seeds: 1200, sowing: 1500, fertilizer: 2800, labor: 3500, irrigation: 1200, pestControl: 800, harvest: 0, transport: 0, preserve: 0, other: 0 }
      },
    ];
    onDataLoaded(sample);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
          ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}
        `}
      >
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${loading ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            {loading ? (
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800">
              {loading ? t('processing') : t('dropFile')}
            </h3>
            <p className="text-slate-500 mt-1">Expected: Crop, Profit, Seeds_cost, Sowing, Fertilizer...</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={loadSampleData}
          className="text-sm text-slate-500 hover:text-emerald-600 font-medium underline underline-offset-2"
        >
          {t('useSample')}
        </button>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">{t('pythonCompat')}</p>
          <p>{t('pythonDesc')}</p>
        </div>
      </div>
    </div>
  );
};