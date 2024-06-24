// src/pages/ModelManagement.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddModelModal from '../components/AddModelModal';
import { Button } from 'react-bootstrap';

function ModelManagement() {
  const [models, setModels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const fetchModels = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://127.0.0.1:3002/models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedModels = [...models].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="container">
      <h1>Model Management</h1>
      <Button variant="primary" onClick={handleShowModal}>Add New Model</Button>
      <table className="table mt-3">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('type')}>Type</th>
            <th onClick={() => handleSort('engine')}>Engine</th>
            <th onClick={() => handleSort('created_at')}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {sortedModels.map(model => (
            <tr key={model._id}>
              <td>{model.name}</td>
              <td>{model.type}</td>
              <td>{model.engine}</td>
              <td>{new Date(model.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AddModelModal show={showModal} handleClose={handleCloseModal} refreshModels={fetchModels} />
    </div>
  );
}

export default ModelManagement;
