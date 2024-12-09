// src/features/Users/Components/modals/NewRoleModal.jsx

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function NewRoleModal({ show, handleClose, handleSubmit }) {
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
  });

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(newRole);
    setNewRole({ name: '', description: '' }); // Resetear el formulario
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Nuevo Rol</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Nombre del Rol</Form.Label>
            <Form.Control
              type="text"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              required
              placeholder="Ingrese el nombre del rol"
            />
          </Form.Group>

          <Form.Group controlId="description" className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              placeholder="Ingrese la descripción del rol"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-4">
            Agregar Rol
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

NewRoleModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};
