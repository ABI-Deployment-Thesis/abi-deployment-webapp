// src/pages/ModelManagement/ModelManagement.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';
import AddModelModal from '../../components/AddModelModal/AddModelModal';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/config';
import './ModelManagement.css';

function ModelManagement() {
  const [models, setModels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const navigate = useNavigate();

  const fetchModels = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(API_ENDPOINTS.MODELS, {
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

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedModels = [...models].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRowClick = (modelId) => {
    navigate(`/model-runner?model_id=${modelId}`);
  };

  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <div className="container">
      <h1>Model Management</h1>
      <Button variant="primary" onClick={handleShowModal}>Add New Model</Button>
      <Table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Name {getSortArrow('name')}
            </th>
            <th onClick={() => handleSort('type')}>
              Type {getSortArrow('type')}
            </th>
            <th onClick={() => handleSort('engine')}>
              Engine {getSortArrow('engine')}
            </th>
            <th onClick={() => handleSort('language')}>
              Language {getSortArrow('language')}
            </th>
            <th onClick={() => handleSort('serialization')}>
              Serialization {getSortArrow('serialization')}
            </th>
            <th onClick={() => handleSort('created_at')}>
              Created On {getSortArrow('created_at')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedModels.map(model => (
            <tr key={model._id} onClick={() => handleRowClick(model._id)} style={{ cursor: 'pointer' }}>
              <td>{model.name}</td>
              <td>{model.type}</td>
              <td>{model.engine}</td>
              <td>{model.language}</td>
              <td>{model.serialization}</td>
              <td>{new Date(model.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <AddModelModal show={showModal} handleClose={handleCloseModal} refreshModels={fetchModels} />
    </div>
  );
}

export default ModelManagement;
