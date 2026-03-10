import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ActivityList from './components/ActivityList';
import ActivityDetail from './components/ActivityDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ActivityList />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
