import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';
import { Network, Search, Target } from 'lucide-react';
import { CropData, KNNPrediction } from '../types';
import { KNNModel } from '../utils/ml';

interface PredictionToolProps {
  data: CropData[];
}

export const PredictionTool: React.FC<PredictionToolProps> = ({ data }) => {
  const [inputCost, setInputCost] = useState<string>('');
  const [prediction, setPrediction] = useState<KNNPrediction | null>(null);
  const [model, setModel] = useState<KNNModel | null>(null);

  // Train the model whenever data changes
  useEffect(() => {
    if (data.length > 0) {
      const knn = new KNNModel(3); // K=3
      knn.train(data);
      setModel(knn);
    }
  }, [data]);

  const handlePredict = () => {
    if (model && inputCost) {
      const cost = parseFloat(inputCost);
      if (!isNaN(cost)) {
        const result = model.predict(cost);
        setPrediction(result);
      }
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return data.map(item => ({
      x: item.totalCost,
      y: item.profit,
      name: item.name,
      isNeighbor: prediction?.neighbors.some(n => n.id === item.id) || false
    }));
  }, [data, prediction]);

  const neighborNames = prediction?.neighbors.map(n => n.name).join(', ') || '';

  if (data.length < 2) {
    return (
      <div className="bg-amber-50 p-4 rounded-lg text-amber-800">
        Add more crop data to enable pattern matching.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Network className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Smart Crop Similarity (KNN)</h2>
          <p className="text-sm text-slate-500">Finds similar historical crops to predict outcomes</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Interactive Prediction Input */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Proposed Budget (Total Cost)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">₹</span>
              </div>
              <input
                type="number"
                value={inputCost}
                onChange={(e) => setInputCost(e.target.value)}
                className="pl-7 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
                placeholder="e.g. 15000"
              />
            </div>
            <button
              onClick={handlePredict}
              disabled={!inputCost}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find Similar Scenarios
            </button>
          </div>

          {prediction && (
            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Predicted Profit</span>
                <span className="text-xs bg-white px-2 py-0.5 rounded text-indigo-500 border border-indigo-100">
                  {Math.round(prediction.confidenceScore)}% Confidence
                </span>
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                <Target className="w-5 h-5 text-indigo-600" />
                <span className="text-3xl font-bold text-slate-900">
                  ₹{Math.round(prediction.predictedProfit).toLocaleString()}
                </span>
              </div>

              <div className="text-sm text-slate-600 border-t border-indigo-100 pt-3">
                <p className="font-medium mb-1">Based on similar crops:</p>
                <p className="text-indigo-700 bg-indigo-100/50 p-2 rounded text-xs leading-relaxed">
                  {neighborNames}
                </p>
              </div>
            </div>
          )}
          
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
             <strong>Model Logic (KNN):</strong> Instead of a generic trend line, this model scans your actual data to find the 3 closest matches to your budget. It assumes your new crop will perform similarly to its "nearest neighbors".
          </div>
        </div>

        {/* Right: Scatter Chart */}
        <div className="md:col-span-2 min-h-[300px]">
          <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
            <Network className="w-4 h-4" />
            Similarity Cluster Map
          </h3>
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Cost" 
                unit="₹" 
                tickFormatter={(val) => `${val/1000}k`}
                domain={['dataMin - 2000', 'dataMax + 2000']}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Profit" 
                unit="₹"
                tickFormatter={(val) => `${val/1000}k`}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg">
                        <p className="font-bold text-slate-800">{data.name}</p>
                        <p className="text-sm text-slate-600">Cost: ₹{data.x}</p>
                        <p className="text-sm text-slate-600">Profit: ₹{data.y}</p>
                        {data.isNeighbor && <p className="text-xs text-indigo-600 font-bold mt-1">Matched Neighbor</p>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36}/>
              
              {/* Reference line for the user input */}
              {inputCost && (
                <ReferenceLine x={parseFloat(inputCost)} stroke="#6366f1" strokeDasharray="3 3" label="Your Budget" />
              )}

              <Scatter name="Crops" data={chartData} fill="#94a3b8">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isNeighbor ? '#4f46e5' : '#cbd5e1'} 
                    r={entry.isNeighbor ? 8 : 5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};