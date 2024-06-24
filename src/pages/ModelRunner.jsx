// src/components/ModelRunner.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import '../App.css'; // Import the CSS file
import RunModelModal from '../components/RunModelModal'; // Import the modal component
import ModelRunDetailsModal from '../components/ModelRunDetailsModal'; // Import the new modal component

function ModelRunner() {
  const [modelRuns, setModelRuns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const location = useLocation();

  const fetchModelRuns = async (modelId = '') => {
    const token = localStorage.getItem('token');
    try {
      const url = modelId ? `http://127.0.0.1:3002/model-runs?model_id=${modelId}` : 'http://127.0.0.1:3002/model-runs';
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setModelRuns(response.data);
    } catch (error) {
      console.error('Error fetching model runs:', error);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const modelId = queryParams.get('model_id');
    fetchModelRuns(modelId);

    const intervalId = setInterval(() => {
      fetchModelRuns(modelId);
    }, 5000);

    return () => clearInterval(intervalId); // Clear interval on component unmount
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

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleRowClick = (runId) => {
    setSelectedRunId(runId);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRunId(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedModelRuns = [...modelRuns].sort((a, b) => {
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
      <h1>Model Runner</h1>
      <Button variant="primary" onClick={handleShowModal}>Run</Button>
      <table className="table mt-3">
        <thead>
          <tr>
            <th onClick={() => handleSort('model_name')}>Model Name</th>
            <th onClick={() => handleSort('updatedAt')}>Updated At</th>
            <th onClick={() => handleSort('duration')}>Duration (s)</th>
            <th onClick={() => handleSort('state')}>State</th>
          </tr>
        </thead>
        <tbody>
          {sortedModelRuns.map(run => (
            <tr key={run._id} onClick={() => handleRowClick(run._id)}>
              <td>{run.model_name}</td>
              <td>{new Date(run.updatedAt).toLocaleString()}</td>
              <td>{(new Date(run.updatedAt) - new Date(run.createdAt)) / 1000}</td>
              <td>{getStateIcon(run.state)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <RunModelModal show={showModal} handleClose={handleCloseModal} refreshModelRuns={() => fetchModelRuns()} />
      <ModelRunDetailsModal show={showDetailsModal} handleClose={handleCloseDetailsModal} runId={selectedRunId} />
    </div>
  );
}

export default ModelRunner;
