// src/components/ModelRunner/ModelRunner.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './ModelRunner.css';
import RunModelModal from '../../components/RunModelModal/RunModelModal';
import ModelRunDetailsModal from '../../components/ModelRunDetailsModal/ModelRunDetailsModal';
import { API_ENDPOINTS } from '../../config/config';

function ModelRunner() {
  const [modelRuns, setModelRuns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const location = useLocation();

  const fetchModelRuns = async (modelId = '') => {
    const token = localStorage.getItem('token');
    try {
      const url = modelId ? `${API_ENDPOINTS.MODEL_RUNS}?model_id=${modelId}` : API_ENDPOINTS.MODEL_RUNS;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const runsWithDuration = response.data.map(run => {
        const durationMs = new Date(run.updatedAt) - new Date(run.createdAt);
        return { ...run, durationMs };
      });

      setModelRuns(runsWithDuration);
    } catch (error) {
      console.error('Error fetching model runs:', error);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const modelId = queryParams.get('model_id');
    setSelectedModelId(modelId);
    fetchModelRuns(modelId);

    const intervalId = setInterval(() => {
      fetchModelRuns(modelId);
    }, 3000); // Update every 3 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [location.search]);

  const getStateIcon = (state) => {
    switch (state) {
      case 'finished':
        return <FaCheckCircle color="green" />;
      case 'failed':
        return <FaTimesCircle color="red" />;
      default:
        return <FaSpinner className="spinner" />;
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleRowClick = (runId) => {
    setSelectedRunId(runId);
    setShowDetailsModal(true);
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRunId(null);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedModelRuns = [...modelRuns].sort((a, b) => {
    if (sortConfig.key === 'duration') {
      // Sorting by duration in milliseconds
      if (a.durationMs < b.durationMs) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a.durationMs > b.durationMs) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    // Default sorting by other keys
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDuration = (start, end) => {
    const durationMs = new Date(end) - new Date(start);

    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    let durationStr = '';
    if (days > 0) durationStr += `${days}d `;
    if (hours > 0 || days > 0) durationStr += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) durationStr += `${minutes}m `;
    durationStr += `${seconds}s`;

    return durationStr.trim();
  };

  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <div className="container">
      <h1>Model Runner</h1>
      <Button variant="primary" onClick={handleShowModal}>Run</Button>
      <Table>
        <thead>
          <tr>
            <th onClick={() => handleSort('model_name')}>
              Model Name {getSortArrow('model_name')}
            </th>
            <th onClick={() => handleSort('model_type')}>
              Type {getSortArrow('model_type')}
            </th>
            <th onClick={() => handleSort('model_engine')}>
              Engine {getSortArrow('model_engine')}
            </th>
            <th onClick={() => handleSort('updatedAt')}>
              Last Updated On {getSortArrow('updatedAt')}
            </th>
            <th onClick={() => handleSort('duration')}>
              Duration {getSortArrow('duration')}
            </th>
            <th onClick={() => handleSort('state')}>
              State {getSortArrow('state')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedModelRuns.map(run => (
            <tr key={run._id} onClick={() => handleRowClick(run._id)}>
              <td>{run.model_name}</td>
              <td>{run.model_type}</td>
              <td>{run.model_engine}</td>
              <td>{new Date(run.updatedAt).toLocaleString()}</td>
              <td>{formatDuration(run.createdAt, run.updatedAt)}</td>
              <td>{getStateIcon(run.state)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <RunModelModal show={showModal} handleClose={handleCloseModal} refreshModelRuns={() => fetchModelRuns(selectedModelId)} />
      <ModelRunDetailsModal show={showDetailsModal} handleClose={handleCloseDetailsModal} runId={selectedRunId} />
    </div>
  );
}

export default ModelRunner;
