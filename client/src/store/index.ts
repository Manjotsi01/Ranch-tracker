// ranch-tracker/client/src/store/index.ts

import { create } from 'zustand';
import type { DashboardStats, 
  ModuleKPI, 
  Alert, 
  ProfitChartPoint, 
  ActivityItem, 
  Crop,
  CropSeason,
  Animal, 
  HerdSummary,
  Product, 
  CartItem,
  PaymentMode
 } from '../types/index';


// ─── Dashboard Store ──────────────────────────────────────────────
interface DashboardStore {
  stats: DashboardStats | null;

  kpis: ModuleKPI[];
  alerts: Alert[];
  profitChart: ProfitChartPoint[];
  recentActivity: ActivityItem[];
  period: 'week' | 'month' | 'year';
  loading: boolean;
  error: string | null;
  setStats: (stats: DashboardStats) => void;
  setKPIs: (kpis: ModuleKPI[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setProfitChart: (data: ProfitChartPoint[]) => void;
  setRecentActivity: (data: ActivityItem[]) => void;
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  dismissAlert: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  kpis: [],
  alerts: [],
  profitChart: [],
  recentActivity: [],
  period: 'month',
  loading: false,
  error: null,
  setStats:          (stats) => set({ stats }),
  setKPIs:           (kpis) => set({ kpis }),
  setAlerts:         (alerts) => set({ alerts }),
  setProfitChart:    (profitChart) => set({ profitChart }),
  setRecentActivity: (recentActivity) => set({ recentActivity }),
  setPeriod:         (period) => set({ period }),
  setLoading:        (loading) => set({ loading }),
  setError:          (error) => set({ error }),
  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}))


// ─── Agriculture Store ────────────────────────────────────────────────────────
interface AgricultureState {
  crops: Crop[];
  selectedCrop: Crop | null;
  seasons: CropSeason[];
  selectedSeason: CropSeason | null;
  activeTab: 'ARABLE' | 'VEGETABLE';
  loading: boolean;
  error: string | null;
  setActiveTab: (tab: 'ARABLE' | 'VEGETABLE') => void;
  setSelectedCrop: (crop: Crop | null) => void;
  setSelectedSeason: (season: CropSeason | null) => void;
  setCrops: (crops: Crop[]) => void;
  setSeasons: (seasons: CropSeason[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAgricultureStore = create<AgricultureState>((set) => ({
  crops: [],
  selectedCrop: null,
  seasons: [],
  selectedSeason: null,
  activeTab: 'ARABLE',
  loading: false,
  error: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCrop: (crop) => set({ selectedCrop: crop }),
  setSelectedSeason: (season) => set({ selectedSeason: season }),
  setCrops: (crops) => set({ crops }),
  setSeasons: (seasons) => set({ seasons }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));



interface AnimalStore {
  cowAnimals:      Animal[]
  buffaloAnimals:  Animal[]
  animals:         Animal[]
  selectedAnimal:  Animal | null
  herdSummary:     HerdSummary | null
  filters: {
    status: string
    type:   string
    search: string
  }
  setCowAnimals:      (animals: Animal[]) => void
  setBuffaloAnimals:  (animals: Animal[]) => void
  setAnimals:         (animals: Animal[]) => void
  setSelectedAnimal:  (animal: Animal | null) => void
  setHerdSummary:     (summary: HerdSummary) => void
  setFilter:          (key: keyof AnimalStore['filters'], value: string) => void
  clearFilters:       () => void
}
 
export const useAnimalStore = create<AnimalStore>((set) => ({
  cowAnimals:     [],
  buffaloAnimals: [],
  animals:        [],
  selectedAnimal: null,
  herdSummary:    null,
  filters:        { status: '', type: '', search: '' },
 
  setCowAnimals:     (cowAnimals)     => set({ cowAnimals,     animals: cowAnimals }),
  setBuffaloAnimals: (buffaloAnimals) => set({ buffaloAnimals, animals: buffaloAnimals }),
  setAnimals:        (animals)        => set({ animals }),
  setSelectedAnimal: (selectedAnimal) => set({ selectedAnimal }),
  setHerdSummary:    (herdSummary)    => set({ herdSummary }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () =>
    set({ filters: { status: '', type: '', search: '' } }),
}))
 
interface UIStore {
  sidebarOpen:    boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar:  () => void
}
 
export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen:    true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
 

// ── Cart Store (POS) ──────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[]
  paymentMode: PaymentMode
  customerName: string
  addItem:      (product: Product, qty: number) => void
  updateQty:    (id: string, qty: number) => void
  removeItem:   (id: string) => void
  clearCart:    () => void
  setPayment:   (mode: PaymentMode) => void
  setCustomer:  (name: string) => void
  total:        () => number
  itemCount:    () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items:        [],
  paymentMode:  'CASH',
  customerName: '',

  addItem: (product, qty) =>
    set((s) => {
      const exists = s.items.find((i) => i.productId === product._id)
      if (exists) {
        return {
          items: s.items.map((i) =>
            i.productId === product._id
              ? { ...i, quantity: i.quantity + qty, lineTotal: (i.quantity + qty) * i.unitPrice }
              : i
          ),
        }
      }
      return {
        items: [...s.items, {
          id:          crypto.randomUUID(),
          productId:   product._id,
          productName: product.name,
          unit:        product.unit,
          unitPrice:   product.mrp,
          quantity:    qty,
          lineTotal:   qty * product.mrp,
        }],
      }
    }),

  updateQty: (id, qty) =>
    set((s) => ({
      items: qty <= 0
        ? s.items.filter((i) => i.id !== id)
        : s.items.map((i) => i.id === id ? { ...i, quantity: qty, lineTotal: qty * i.unitPrice } : i),
    })),

  removeItem:  (id)   => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clearCart:   ()     => set({ items: [], customerName: '', paymentMode: 'CASH' }),
  setPayment:  (mode) => set({ paymentMode: mode }),
  setCustomer: (name) => set({ customerName: name }),
  total:       ()     => +get().items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2),
  itemCount:   ()     => get().items.reduce((s, i) => s + i.quantity, 0),
}))