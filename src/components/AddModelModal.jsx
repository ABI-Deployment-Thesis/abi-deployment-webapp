// src/components/AddModelModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

function AddModelModal({ show, handleClose, refreshModels }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('predictive');
  const [engine, setEngine] = useState('docker');
  const [language, setLanguage] = useState('Python3');
  const [features, setFeatures] = useState([{ name: '', type: 'int' }]);
  const [dependencies, setDependencies] = useState([{ library: '', version: '' }]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleAddFeature = () => setFeatures([...features, { name: '', type: 'int' }]);
  const handleRemoveFeature = (index) => setFeatures(features.filter((_, i) => i !== index));

  const handleAddDependency = () => setDependencies([...dependencies, { library: '', version: '' }]);
  const handleRemoveDependency = (index) => setDependencies(dependencies.filter((_, i) => i !== index));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedExtensions = ['.py', '.sav'];
    const fileExtension = selectedFile ? selectedFile.name.split('.').pop() : '';
    if (allowedExtensions.includes(`.${fileExtension}`)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Only .py and .sav files are allowed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    const featuresWithOrder = features.map((feature, index) => ({
      ...feature,
      order: index + 1
    }));

    formData.append('features', JSON.stringify(featuresWithOrder));
    formData.append('dependencies', JSON.stringify(dependencies));
    formData.append('type', type);
    formData.append('name', name);
    formData.append('engine', engine);
    if (engine === 'docker') {
      formData.append('language', language);
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post('http://127.0.0.1:3001/model', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      refreshModels();
      handleClose();
    } catch (error) {
      if (error.response && error.response.data) {
        setError(
          Array.isArray(error.response.data.error)
            ? error.response.data.error.map(err => err.msg).join(', ')
            : error.response.data.error
        );
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Model</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="predictive">Predictive</option>
              <option value="optimization">Optimization</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Engine</Form.Label>
            <Form.Select value={engine} onChange={(e) => setEngine(e.target.value)}>
              <option value="docker">Docker</option>
              <option value="test">Test</option>
            </Form.Select>
          </Form.Group>

          {engine === 'docker' && (
            <Form.Group className="mb-3">
              <Form.Label>Language</Form.Label>
              <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="Python3">Python3</option>
                <option value="R">R</option>
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Features</Form.Label>
            {features.map((feature, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={feature.name}
                  onChange={(e) => {
                    const newFeatures = [...features];
                    newFeatures[index].name = e.target.value;
                    setFeatures(newFeatures);
                  }}
                  required
                />
                <Form.Select
                  value={feature.type}
                  onChange={(e) => {
                    const newFeatures = [...features];
                    newFeatures[index].type = e.target.value;
                    setFeatures(newFeatures);
                  }}
                  required
                >
                  <option value="int">int</option>
                  <option value="float">float</option>
                  <option value="boolean">bool</option>
                </Form.Select>
                <Button variant="danger" onClick={() => handleRemoveFeature(index)}>Remove</Button>
              </div>
            ))}
            <Button variant="primary" onClick={handleAddFeature}>Add Feature</Button>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dependencies</Form.Label>
            {dependencies.map((dependency, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control
                  type="text"
                  placeholder="Library"
                  value={dependency.library}
                  onChange={(e) => {
                    const newDependencies = [...dependencies];
                    newDependencies[index].library = e.target.value;
                    setDependencies(newDependencies);
                  }}
                  required
                />
                <Form.Control
                  type="text"
                  placeholder="Version"
                  value={dependency.version}
                  onChange={(e) => {
                    const newDependencies = [...dependencies];
                    newDependencies[index].version = e.target.value;
                    setDependencies(newDependencies);
                  }}
                  required
                />
                <Button variant="danger" onClick={() => handleRemoveDependency(index)}>Remove</Button>
              </div>
            ))}
            <Button variant="primary" onClick={handleAddDependency}>Add Dependency</Button>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>File</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} required />
          </Form.Group>

          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddModelModal;
