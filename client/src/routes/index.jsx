import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Public Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { SharedQuizPage } from '../pages/quiz/SharedQuizPage';

// Protected Dashboard & Module Pages
import { Dashboard } from '../pages/Dashboard';
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
      {/* Public Marketing & Auth Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/quiz/share/:shareId" element={<SharedQuizPage />} />
      <Route path="/quiz/:shareId" element={<SharedQuizPage />} />

      {/* Protected Application Routes inside AppLayout (Main Layout Shell) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/documind/*" element={<DocuMindPage />} />
        <Route path="/datainsight/*" element={<DataInsightPage />} />
        <Route path="/smarttools/*" element={<SmartToolsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Route>

      {/* Fallback to Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
