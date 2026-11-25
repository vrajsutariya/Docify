import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { DocuMindPage } from '../pages/documind/DocuMindPage';
import { DataInsightPage } from '../pages/datainsight/DataInsightPage';
import { SmartToolsPage } from '../pages/smarttools/SmartToolsPage';
import { AdminPage } from '../pages/admin/AdminPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/documind/*" element={<DocuMindPage />} />
      <Route path="/datainsight/*" element={<DataInsightPage />} />
      <Route path="/smarttools/*" element={<SmartToolsPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  );
};
