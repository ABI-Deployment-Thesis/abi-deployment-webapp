// src/components/RunModelModal/RunModelModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/config';

const RunModelModal = ({ show, handleClose, refreshModelRuns }) => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelType, setModelType] = useState('');
  const [features, setFeatures] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');

  const token = localStorage.getItem('token');

  const fetchModels = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MODELS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      setFormError(
        Array.isArray(errorMessage)
          ? errorMessage.map(err => err.msg).join(', ')
          : errorMessage || 'Failed to load models. Please try again.'
      );
    }
  }, [token]);

  useEffect(() => {
    if (show) fetchModels();
  }, [show, fetchModels]);

  const fetchModelDetails = useCallback(async () => {
    if (selectedModel) {
      try {
        const response = await axios.get(`${API_ENDPOINTS.MODELS}/${selectedModel}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { features, type } = response.data;
        setFeatures(features);
        setModelType(type);
      } catch (error) {
        const errorMessage = error.response?.data?.error;
        setFormError(
          Array.isArray(errorMessage)
            ? errorMessage.map(err => err.msg).join(', ')
            : errorMessage || 'Failed to load model details. Please try again.'
        );
      }
    }
  }, [selectedModel, token]);

  useEffect(() => {
    fetchModelDetails();
  }, [selectedModel, fetchModelDetails]);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
    setInputValues({});
    setFile(null);
    setFileError('');
    setFormError('');
  };

  const handleInputChange = (feature, event) => {
    let value;
    switch (feature.type) {
      case 'int':
        value = event.target.value == 0 ? event.target.value : parseInt(event.target.value, 10);
        break;
      case 'float':
        value = event.target.value == 0 ? event.target.value : parseFloat(event.target.value);
        break;
      case 'boolean':
        value = event.target.checked;
        break;
      default:
        value = event.target.value;
    }

    setInputValues(prevValues => ({
      ...prevValues,
      [feature.name]: value
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      setFileError('');
    } else {
      setFile(null);
      setFileError('Only .zip files are allowed.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (modelType === 'optimization' && !file) {
      setFileError('Please upload a valid .zip file.');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    let requestPayload;

    if (modelType === 'predictive') {
      requestPayload = {
        model_id: selectedModel,
        input_features: features.map(feature => ({
          name: feature.name,
          value: inputValues[feature.name] === '0' || inputValues[feature.name] === '0.0' ? 0 : (inputValues[feature.name] || '')
        }))
      };
      headers['Content-Type'] = 'application/json';
    } else if (modelType === 'optimization') {
      const formData = new FormData();
      formData.append('model_id', selectedModel);
      formData.append('file', file);
      requestPayload = formData;
    }

    try {
      await axios.post(
        `${API_ENDPOINTS.MODEL_RUNS}/${selectedModel}`,
        requestPayload,
        { headers }
      );
      handleClose();
      refreshModelRuns();
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      setFormError(
        Array.isArray(errorMessage)
          ? errorMessage.map(err => err.msg).join(', ')
          : errorMessage || 'Failed to run the model. Please try again.'
      );
    }
  };

  useEffect(() => {
    if (show) {
      const params = new URLSearchParams(window.location.search);
      const modelId = params.get('model_id');
      if (modelId && models.length > 0) {
        setSelectedModel(modelId);
      }
    }
  }, [show, models]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Run Model</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="modelSelect">
            <Form.Label>Select Model</Form.Label>
            <Form.Control as="select" value={selectedModel} onChange={handleModelChange} required>
              <option value="">Select a model</option>
              {models.map(model => (
                <option key={model._id} value={model._id}>{model.name}</option>
              ))}
            </Form.Control>
          </Form.Group>

          {selectedModel && <br />}

          {modelType === 'predictive' && features.map(feature => (
            <Form.Group controlId={`feature-${feature.name}`} key={feature._id}>
              <Form.Label>{feature.name}</Form.Label>
              <Form.Control
                type={feature.type === 'int' ? 'number' : feature.type === 'float' ? 'number' : 'text'}
                step={feature.type === 'float' ? '0.01' : undefined}
                min={feature.type === 'int' ? '0' : undefined}
                value={inputValues[feature.name] || ''}
                onChange={(e) => handleInputChange(feature, e)}
                required
              />
            </Form.Group>
          ))}

          {modelType === 'optimization' && (
            <Form.Group controlId="fileUpload">
              <Form.Label>Upload File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} required />
              {fileError && <Form.Text className="text-danger">{fileError}</Form.Text>}
            </Form.Group>
          )}

          <br />

          {formError && <Alert variant="danger">{formError}</Alert>}

          <Button variant="primary" type="submit">Run</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RunModelModal;
