// src/components/AddModelModal/AddModelModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/config';

function AddModelModal({ show, handleClose, refreshModels }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('predictive');
  const [engine, setEngine] = useState('docker');
  const [language, setLanguage] = useState('Python3');
  const [dockerTag, setDockerTag] = useState('3.9');
  const [serialization, setSerialization] = useState('joblib');
  const [features, setFeatures] = useState([{ name: '', type: 'int' }]);
  const [dependencies, setDependencies] = useState([{ library: '', version: '' }]);
  const [memLimit, setMemLimit] = useState('256M');
  const [cpuPercentage, setCpuPercentage] = useState(50);
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState(null);

  const handleAddFeature = () => setFeatures([...features, { name: '', type: 'int' }]);
  const handleRemoveFeature = (index) => setFeatures(features.filter((_, i) => i !== index));

  const handleAddDependency = () => setDependencies([...dependencies, { library: '', version: '' }]);
  const handleRemoveDependency = (index) => setDependencies(dependencies.filter((_, i) => i !== index));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedExtensions = ['.pkl', '.sav', '.rds', '.zip'];
    const fileExtension = selectedFile ? `.${selectedFile.name.split('.').pop()}` : '';

    if (allowedExtensions.includes(fileExtension)) {
      setFile(selectedFile);
      setFormError(null);
    } else {
      setFile(null);
      setFormError('Only .pkl, .sav, .rds, and .zip files are allowed.');
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);

    if (selectedLanguage === 'R') {
      setDockerTag('4.1.3');
    } else if (selectedLanguage === 'Python3') {
      setDockerTag('3.9');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('engine', engine);

    if (engine === 'docker') {
      formData.append('language', language);
      formData.append('docker_tag', dockerTag);
      formData.append('mem_limit', memLimit);
      formData.append('cpu_percentage', cpuPercentage);
    }

    if (type === 'predictive') {
      formData.append('features', JSON.stringify(features.map((feature, index) => ({ ...feature, order: index + 1 }))));
      if (engine === 'docker' && language === 'Python3') {
        formData.append('serialization', serialization);
      }
    }

    formData.append('dependencies', JSON.stringify(dependencies));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_ENDPOINTS.MODELS}/${type}/${engine}/${language.replace(/\d+/g, '')}`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshModels();
      handleClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      setFormError(
        Array.isArray(errorMessage)
          ? errorMessage.map(err => err.msg).join(', ')
          : errorMessage || 'An unexpected error occurred.'
      );
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Model</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
            </Form.Select>
          </Form.Group>

          {engine === 'docker' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Select value={language} onChange={(e) => handleLanguageChange(e)}>
                  <option value="Python3">Python3</option>
                  {type === 'predictive' && <option value="R">R</option>}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Docker Tag</Form.Label>
                <Form.Control
                  type="text"
                  value={dockerTag}
                  onChange={(e) => setDockerTag(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Memory Limit</Form.Label>
                <Form.Control
                  type="text"
                  value={memLimit}
                  onChange={(e) => setMemLimit(e.target.value)}
                  placeholder="e.g., 256M"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>CPU Percentage</Form.Label>
                <Form.Control
                  type="number"
                  value={cpuPercentage}
                  onChange={(e) => setCpuPercentage(e.target.value)}
                  placeholder="e.g., 50"
                  required
                />
              </Form.Group>
            </>
          )}

          {type === 'predictive' && engine === 'docker' && language === 'Python3' && (
            <Form.Group className="mb-3">
              <Form.Label>Serialization</Form.Label>
              <Form.Select value={serialization} onChange={(e) => setSerialization(e.target.value)}>
                <option value="joblib">joblib</option>
                <option value="pickle">pickle</option>
              </Form.Select>
            </Form.Group>
          )}

          {type === 'predictive' && (
            <Form.Group className="mb-3">
              <Form.Label>Features</Form.Label>
              {features.map((feature, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
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
                    className="me-2"
                  />
                  <Form.Select
                    value={feature.type}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index].type = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    required
                    className="me-2"
                  >
                    <option value="int">int</option>
                    <option value="float">float</option>
                    <option value="boolean">bool</option>
                    <option value="string">string</option>
                  </Form.Select>
                  <Button variant="danger" onClick={() => handleRemoveFeature(index)}>Remove</Button>
                </div>
              ))}
              <Button variant="primary" onClick={handleAddFeature}>Add Feature</Button>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Dependencies</Form.Label>
            {dependencies.map((dependency, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
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
                  className="me-2"
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
                  className="me-2"
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

          {formError && <Alert variant="danger">{formError}</Alert>}

          <Button variant="primary" type="submit">Submit</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddModelModal;
