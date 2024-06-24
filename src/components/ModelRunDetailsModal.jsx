// src/components/ModelRunDetailsModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import axios from 'axios';

const ModelRunDetailsModal = ({ show, handleClose, runId }) => {
  const [runDetails, setRunDetails] = useState(null);

  useEffect(() => {
    const fetchRunDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://127.0.0.1:3003/model-runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setRunDetails(response.data[0]); // Adjusted based on response being an array
      } catch (error) {
        console.error('Error fetching run details:', error);
      }
    };

    if (show && runId) {
      fetchRunDetails();
    }
  }, [show, runId]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Run Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {runDetails ? (
          <>
            <h5>Model ID: {runDetails.model_id}</h5>
            <h5>State: {runDetails.state}</h5>
            <h5>Created At: {new Date(runDetails.createdAt).toLocaleString()}</h5>
            <h5>Updated At: {new Date(runDetails.updatedAt).toLocaleString()}</h5>
            <h5>Container ID: <span className="long-text">{runDetails.container_id}</span></h5>
            <h5>Container Exit Code: {runDetails.container_exit_code}</h5>
            <h5>Result:</h5>
            <pre>{runDetails.result}</pre>
            <h5>Input Features:</h5>
            <Table bordered>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {runDetails.input_features.map((feature, index) => (
                  <tr key={index}>
                    <td>{feature.name}</td>
                    <td>{feature.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelRunDetailsModal;
