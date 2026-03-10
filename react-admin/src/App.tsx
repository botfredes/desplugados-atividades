import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ActivityList from './components/ActivityList';
import ActivityDetail from './components/ActivityDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ActivityList />} />
      <Route path="/activity/:id" element={<ActivityDetail />} />
    </Routes>
  );
}

export default App;
