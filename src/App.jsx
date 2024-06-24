// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import ModelManagement from './pages/ModelManagement';
import ModelRunner from './pages/ModelRunner';
import Navbar from './components/Navbar';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      {token && <Navbar />}
      <div className="container mt-4">
        <Routes>
          <Route path="/signin" element={token ? <Navigate to="/model-management" /> : <SignIn />} />
          <Route path="/model-management" element={token ? <ModelManagement /> : <Navigate to="/signin" />} />
          <Route path="/model-runner" element={token ? <ModelRunner /> : <Navigate to="/signin" />} />
          <Route path="/" element={<Navigate to={token ? "/model-management" : "/signin"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
