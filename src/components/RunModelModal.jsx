// src/components/RunModelModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const RunModelModal = ({ show, handleClose, refreshModelRuns }) => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [features, setFeatures] = useState([]);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
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

    if (show) {
      fetchModels();
    }
  }, [show]);

  useEffect(() => {
    const fetchModelDetails = async () => {
      const token = localStorage.getItem('token');
      if (selectedModel) {
        try {
          const response = await axios.get(`http://127.0.0.1:3002/models/${selectedModel}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setFeatures(response.data.features);
        } catch (error) {
          console.error('Error fetching model details:', error);
        }
      }
    };

    fetchModelDetails();
  }, [selectedModel]);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
    setInputValues({});
  };

  const handleInputChange = (feature, event) => {
    let value;
    switch (feature.type) {
      case 'int':
        value = parseInt(event.target.value, 10);
        break;
      case 'float':
        value = parseFloat(event.target.value);
        break;
      case 'boolean':
        value = event.target.checked;
        break;
      default:
        value = event.target.value;
    }
    setInputValues({
      ...inputValues,
      [feature.name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const inputFeatures = features.map((feature) => ({
      name: feature.name,
      value: inputValues[feature.name] || '',
    }));

    try {
      await axios.post('http://127.0.0.1:3003/model-runs', {
        model_id: selectedModel,
        input_features: inputFeatures,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      handleClose();
      refreshModelRuns();
    } catch (error) {
      console.error('Error running model:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Run Model</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="modelSelect">
            <Form.Label>Select Model</Form.Label>
            <Form.Control as="select" value={selectedModel} onChange={handleModelChange}>
              <option value="">Select a model</option>
              {models.map((model) => (
                <option key={model._id} value={model._id}>
                  {model.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          {features.map((feature) => (
            <Form.Group controlId={`feature-${feature.name}`} key={feature._id}>
              <Form.Label>{feature.name}</Form.Label>
              {feature.type === 'boolean' ? (
                <Form.Check
                  type="checkbox"
                  checked={!!inputValues[feature.name]}
                  onChange={(e) => handleInputChange(feature, e)}
                />
              ) : (
                <Form.Control
                  type={feature.type === 'int' || feature.type === 'float' ? 'number' : 'text'}
                  step={feature.type === 'float' ? '0.01' : undefined}
                  value={inputValues[feature.name] || ''}
                  onChange={(e) => handleInputChange(feature, e)}
                />
              )}
            </Form.Group>
          ))}
          <Button variant="primary" type="submit">
            Run
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RunModelModal;
