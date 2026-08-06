import { CropData, KNNPrediction } from "../types";

/**
 * Implements K-Nearest Neighbors (KNN) for Regression
 * Logic: Finds the 'k' most similar historical crops based on Cost 
 * and averages their Profit to make a prediction.
 */
export class KNNModel {
  private k: number;
  private data: CropData[] = [];

  constructor(k: number = 3) {
    this.k = k;
  }

  train(data: CropData[]) {
    this.data = data;
    // Adjust K if we have fewer data points than the default K
    if (data.length < this.k) {
      this.k = Math.max(1, data.length);
    }
  }

  predict(targetCost: number): KNNPrediction | null {
    if (this.data.length === 0) return null;

    // 1. Calculate Euclidean Distance (1D) for each point
    const distances = this.data.map(crop => ({
      crop,
      distance: Math.abs(crop.totalCost - targetCost)
    }));

    // 2. Sort by distance (nearest first)
    distances.sort((a, b) => a.distance - b.distance);

    // 3. Select top K neighbors
    const nearestNeighbors = distances.slice(0, this.k);

    // 4. Calculate Average Profit of neighbors
    const sumProfit = nearestNeighbors.reduce((sum, n) => sum + n.crop.profit, 0);
    const predictedProfit = sumProfit / nearestNeighbors.length;

    // 5. Calculate a simple "Confidence Score" based on how close the neighbors actually are
    // If distance is 0, confidence is 100%. If distance is large, confidence drops.
    const avgDistance = nearestNeighbors.reduce((sum, n) => sum + n.distance, 0) / nearestNeighbors.length;
    // Normalize: purely heuristic for UI display (assuming max acceptable variance is ~5000)
    const confidenceScore = Math.max(0, Math.min(100, 100 - (avgDistance / 50))); 

    return {
      predictedProfit,
      neighbors: nearestNeighbors.map(n => n.crop),
      confidenceScore
    };
  }
}