import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard';

// Agriculture
import AgricultureIndex from './pages/agriculture';
import CropDetail from './pages/agriculture/CropDetail';
import SeasonDetail from './pages/agriculture/SeasonDetail';

// Dairy (lazy)
const DairyIndex   = lazy(() => import('./pages/dairy'));
const AnimalList   = lazy(() => import('./pages/dairy/AnimalList'));
const AnimalDetail = lazy(() => import('./pages/dairy/AnimalDetail'));
const FodderModule = lazy(() => import('./pages/dairy/FodderModule'));

// Shop (FIXED PATHS)
import ShopOverview from './pages/shop/dashboard';
import POS from './pages/shop/pos';
import Processing from './pages/shop/inventory';
import SalesHistory from './pages/shop/reports';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>

          {/* Default */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Agriculture */}
          <Route path="/agriculture" element={<AgricultureIndex />} />
          <Route path="/agriculture/crops/:cropId" element={<CropDetail />} />
          <Route path="/agriculture/seasons/:seasonId" element={<SeasonDetail />} />

          {/* Dairy */}
          <Route path="/dairy" element={
            <Suspense fallback={<PageLoader />}><DairyIndex /></Suspense>
          } />

          <Route path="/dairy/:type" element={
            <Suspense fallback={<PageLoader />}><AnimalList /></Suspense>
          } />

          <Route path="/dairy/:type/:id" element={
            <Suspense fallback={<PageLoader />}><AnimalDetail /></Suspense>
          } />

          <Route path="/dairy/fodder" element={
            <Suspense fallback={<PageLoader />}><FodderModule /></Suspense>
          } />

          {/* Shop */}
          <Route path="/shop" element={<ShopOverview />} />
          <Route path="/shop/pos" element={<POS />} />
          <Route path="/shop/processing" element={<Processing />} />
          <Route path="/shop/sales" element={<SalesHistory />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}