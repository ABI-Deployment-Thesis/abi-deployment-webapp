// src/components/ModelRunDetailsModal/ModelRunDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import './ModelRunDetailsModal.css';
import { API_ENDPOINTS } from '../../config/config';

const ModelRunDetailsModal = ({ show, handleClose, runId }) => {
  const [runDetails, setRunDetails] = useState(null);
  const [modelType, setModelType] = useState('');

  useEffect(() => {
    const fetchRunDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data: runData } = await axios.get(`${API_ENDPOINTS.MODEL_RUNS}/${runId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { data: modelData } = await axios.get(`${API_ENDPOINTS.MODELS}/${runData.model_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRunDetails(runData);
        setModelType(modelData.type);
      } catch (error) {
        console.error('Error fetching run details:', error);
        setRunDetails(null);
      }
    };

    if (show && runId) {
      fetchRunDetails();
    }
  }, [show, runId]);

  const renderInputFeatures = () => {
    if (!runDetails?.input_features?.length) {
      return <tr><td colSpan="2">No input features available</td></tr>;
    }

    return runDetails.input_features.map((feature, index) => (
      <tr key={index}>
        <td>{feature.name}</td>
        <td>{feature.value}</td>
      </tr>
    ));
  };

  const stateClass = runDetails ? `state-${runDetails.state}` : '';

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="custom-modal-width">
      <Modal.Header closeButton>
        <Modal.Title>Run Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {runDetails ? (
          <>
            <strong>Model ID:</strong> {runDetails.model_id}<br />
            <strong>State: <span className={stateClass}>{runDetails.state}</span></strong><br />
            <strong>Created At:</strong> {new Date(runDetails.createdAt).toLocaleString()}<br />
            <strong>Updated At:</strong> {new Date(runDetails.updatedAt).toLocaleString()}<br />
            {runDetails.container_id !== undefined && runDetails.container_id !== null && runDetails.container_id !== '' && (
              <>
                <strong>Container ID:</strong> {runDetails.container_id}<br />
              </>
            )}

            {(runDetails.state == 'failed' || runDetails.state == 'finished') && (
              <>
                <strong>Container Exit Code:</strong> {runDetails.container_exit_code}<br />
              </>
            )}
            <br />

            {(runDetails.state == 'failed' || runDetails.state == 'finished') && (
              <>
                <strong>Result:</strong>
                <pre>{runDetails.result}</pre>
              </>  
            )}

            {modelType !== 'optimization' && (
              <>
                <strong>Input Features:</strong>
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderInputFeatures()}
                  </tbody>
                </Table>
              </>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelRunDetailsModal;
