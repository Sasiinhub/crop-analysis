
import { CropProfile, Transaction } from "../types";

export const DEMO_CROPS: CropProfile[] = [
  // --- 2020 ---
  { id: 'c20_1', name: 'நெல் - 2020', masterCrop: 'நெல்', status: 'COMPLETED', type: 'SEASONAL', startDate: '2020-01-10', endDate: '2020-05-15' },
  { id: 'c20_2', name: 'வாழை - 2020', masterCrop: 'வாழை', status: 'COMPLETED', type: 'PERENNIAL', startDate: '2020-02-01', endDate: '2021-01-20' },

  // --- 2021 ---
  { id: 'c21_1', name: 'கரும்பு - 2021', masterCrop: 'கரும்பு', status: 'COMPLETED', type: 'SEASONAL', startDate: '2021-01-15', endDate: '2021-12-10' },
  { id: 'c21_2', name: 'பருத்தி - 2021', masterCrop: 'பருத்தி', status: 'COMPLETED', type: 'SEASONAL', startDate: '2021-04-01', endDate: '2021-10-05' },

  // --- 2022 ---
  { id: 'c22_1', name: 'மஞ்சள் - 2022', masterCrop: 'மஞ்சள்', status: 'COMPLETED', type: 'SEASONAL', startDate: '2022-05-20', endDate: '2023-02-15' },
  { id: 'c22_2', name: 'நெல் - 2022', masterCrop: 'நெல்', status: 'COMPLETED', type: 'SEASONAL', startDate: '2022-08-01', endDate: '2022-12-10' },

  // --- 2023 ---
  { id: 'c23_1', name: 'நெல் - 2023', masterCrop: 'நெல்', status: 'COMPLETED', type: 'SEASONAL', startDate: '2023-01-15', endDate: '2023-05-20' },
  { id: 'c23_2', name: 'பருத்தி - 2023', masterCrop: 'பருத்தி', status: 'COMPLETED', type: 'SEASONAL', startDate: '2023-03-10', endDate: '2023-09-15' },
  { id: 'c23_3', name: 'மக்காச்சோளம் - 2023', masterCrop: 'மக்காச்சோளம்', status: 'COMPLETED', type: 'SEASONAL', startDate: '2023-06-01', endDate: '2023-10-10' },

  // --- 2024 (Active) ---
  { id: 'c24_1', name: 'கரும்பு - 2024', masterCrop: 'கரும்பு', status: 'ACTIVE', type: 'SEASONAL', startDate: '2024-01-20', endDate: null },
  { id: 'c24_2', name: 'வாழை - 2024', masterCrop: 'வாழை', status: 'ACTIVE', type: 'PERENNIAL', startDate: '2024-02-15', endDate: null },
  { id: 'c24_5', name: 'தேங்காய் - தோப்பு', masterCrop: 'தேங்காய்', status: 'ACTIVE', type: 'PERENNIAL', startDate: '2023-01-01', endDate: null },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  // --- 2020 Nel ---
  { id: 't20_1a', date: '2020-01-10', cropId: 'c20_1', type: 'EXPENSE', category: 'seeds', amount: 2000 },
  { id: 't20_1b', date: '2020-05-15', cropId: 'c20_1', type: 'INCOME', category: 'sale', amount: 28000 },
  { id: 't20_1c', date: '2020-03-10', cropId: 'c20_1', type: 'EXPENSE', category: 'labor', amount: 4000 },

  // --- 2020 Banana ---
  { id: 't20_2a', date: '2020-02-01', cropId: 'c20_2', type: 'EXPENSE', category: 'sowing', amount: 5000 },
  { id: 't20_2b', date: '2020-12-15', cropId: 'c20_2', type: 'INCOME', category: 'sale', amount: 45000 },
  { id: 't20_2c', date: '2020-06-10', cropId: 'c20_2', type: 'EXPENSE', category: 'fertilizer', amount: 8000 },

  // --- 2021 Sugarcane ---
  { id: 't21_1a', date: '2021-01-15', cropId: 'c21_1', type: 'EXPENSE', category: 'seeds', amount: 12000 },
  { id: 't21_1b', date: '2021-12-10', cropId: 'c21_1', type: 'INCOME', category: 'sale', amount: 85000 },
  { id: 't21_1c', date: '2021-05-20', cropId: 'c21_1', type: 'EXPENSE', category: 'labor', amount: 15000 },

  // --- 2021 Cotton ---
  { id: 't21_2a', date: '2021-04-01', cropId: 'c21_2', type: 'EXPENSE', category: 'seeds', amount: 3500 },
  { id: 't21_2b', date: '2021-10-05', cropId: 'c21_2', type: 'INCOME', category: 'sale', amount: 38000 },
  { id: 't21_2c', date: '2021-07-10', cropId: 'c21_2', type: 'EXPENSE', category: 'pestControl', amount: 6000 },

  // --- 2022 Turmeric ---
  { id: 't22_1a', date: '2022-05-20', cropId: 'c22_1', type: 'EXPENSE', category: 'seeds', amount: 10000 },
  { id: 't22_1b', date: '2023-02-15', cropId: 'c22_1', type: 'INCOME', category: 'sale', amount: 95000 },
  { id: 't22_1c', date: '2022-10-10', cropId: 'c22_1', type: 'EXPENSE', category: 'harvest', amount: 12000 },

  // --- 2022 Nel ---
  { id: 't22_2a', date: '2022-08-01', cropId: 'c22_2', type: 'EXPENSE', category: 'seeds', amount: 2500 },
  { id: 't22_2b', date: '2022-12-10', cropId: 'c22_2', type: 'INCOME', category: 'sale', amount: 32000 },
  { id: 't22_2c', date: '2022-10-05', cropId: 'c22_2', type: 'EXPENSE', category: 'fertilizer', amount: 4500 },

  // --- 2023 Transactions ---
  { id: 't23_1a', date: '2023-01-15', cropId: 'c23_1', type: 'EXPENSE', category: 'seeds', amount: 2500 },
  { id: 't23_1b', date: '2023-05-20', cropId: 'c23_1', type: 'INCOME', category: 'sale', amount: 35000 },
  { id: 't23_1c', date: '2023-02-15', cropId: 'c23_1', type: 'EXPENSE', category: 'fertilizer', amount: 4000 },
  { id: 't23_1d', date: '2023-05-15', cropId: 'c23_1', type: 'EXPENSE', category: 'harvest', amount: 5000 },

  { id: 't23_2a', date: '2023-03-10', cropId: 'c23_2', type: 'EXPENSE', category: 'seeds', amount: 4000 },
  { id: 't23_2b', date: '2023-09-15', cropId: 'c23_2', type: 'INCOME', category: 'sale', amount: 42000 },
  { id: 't23_2c', date: '2023-05-15', cropId: 'c23_2', type: 'EXPENSE', category: 'pestControl', amount: 3500 },

  { id: 't23_3a', date: '2023-06-01', cropId: 'c23_3', type: 'EXPENSE', category: 'seeds', amount: 2000 },
  { id: 't23_3b', date: '2023-10-10', cropId: 'c23_3', type: 'INCOME', category: 'sale', amount: 22000 },
  { id: 't23_3c', date: '2023-07-15', cropId: 'c23_3', type: 'EXPENSE', category: 'fertilizer', amount: 3000 },

  // --- 2024 Transactions (Active) ---
  { id: 't24_1a', date: '2024-01-20', cropId: 'c24_1', type: 'EXPENSE', category: 'seeds', amount: 15000 },
  { id: 't24_1b', date: '2024-04-10', cropId: 'c24_1', type: 'EXPENSE', category: 'fertilizer', amount: 8000 },
  { id: 't24_2a', date: '2024-02-15', cropId: 'c24_2', type: 'EXPENSE', category: 'sowing', amount: 6000 },
  { id: 't24_2b', date: '2024-05-20', cropId: 'c24_2', type: 'EXPENSE', category: 'fertilizer', amount: 5000 },
  { id: 't24_5a', date: '2024-03-10', cropId: 'c24_5', type: 'INCOME', category: 'sale', amount: 18000 },
  { id: 't24_5b', date: '2024-06-15', cropId: 'c24_5', type: 'EXPENSE', category: 'labor', amount: 2500 },
];
