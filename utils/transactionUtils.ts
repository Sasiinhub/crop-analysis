
import { CropProfile, Transaction, CropData } from "../types";

export const aggregateTransactions = (
  crops: CropProfile[], 
  transactions: Transaction[]
): CropData[] => {
  return crops.map(crop => {
    // Filter transactions for this crop
    const cropTrans = transactions.filter(t => t.cropId === crop.id);

    // Initial buckets
    const costBreakdown = {
      seeds: 0,
      sowing: 0,
      fertilizer: 0,
      labor: 0,
      irrigation: 0,
      pestControl: 0,
      harvest: 0,
      transport: 0,
      preserve: 0,
      other: 0
    };

    let totalCost = 0;
    let revenue = 0;

    // Sum up values
    cropTrans.forEach(t => {
      // Ensure amount is treated as a number
      const amount = Number(t.amount) || 0;

      if (t.type === 'INCOME') {
        revenue += amount;
      } else {
        // Expense
        totalCost += amount;
        
        // Map category to breakdown key - trim and lowercase for safety
        const cat = t.category ? t.category.trim() : 'other';
        
        switch (cat) {
          case 'seeds': costBreakdown.seeds += amount; break;
          case 'sowing': costBreakdown.sowing += amount; break;
          case 'fertilizer': costBreakdown.fertilizer += amount; break;
          case 'labor': costBreakdown.labor += amount; break;
          case 'irrigation': costBreakdown.irrigation += amount; break;
          case 'pestControl': costBreakdown.pestControl += amount; break;
          case 'harvest': costBreakdown.harvest += amount; break;
          case 'transport': costBreakdown.transport += amount; break;
          case 'preserve': costBreakdown.preserve += amount; break;
          default: costBreakdown.other += amount; break;
        }
      }
    });

    const rawProfit = revenue - totalCost;

    // Logic: For ANY crop that is still ACTIVE, do not show negative profit (Loss).
    // The farmer considers active crops as "Work in Progress" or Investment.
    let profit = rawProfit;
    if (crop.status === 'ACTIVE') {
      profit = Math.max(0, rawProfit);
    }

    return {
      id: crop.id,
      name: crop.name,
      yield: 0, // Yield tracking not implemented in simple transaction model yet
      profit,
      revenue,
      totalCost,
      costBreakdown,
      status: crop.status,
      type: crop.type,
      startDate: crop.startDate // Pass start date for calculations
    };
  });
};
