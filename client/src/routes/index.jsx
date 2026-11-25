import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { DocuMindPage } from '../pages/documind/DocuMindPage';
import { DataInsightPage } from '../pages/datainsight/DataInsightPage';
import { SmartToolsPage } from '../pages/smarttools/SmartToolsPage';
import { HistoryPage } from '../pages/HistoryPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminPage } from '../pages/admin/AdminPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/documind/*" element={<DocuMindPage />} />
        <Route path="/datainsight/*" element={<DataInsightPage />} />
        <Route path="/smarttools/*" element={<SmartToolsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        {/* Catch-all fallback */}
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
