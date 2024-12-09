// src/features/Users/Components/modals/EditRoleModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function EditRoleModal({ show, handleClose, handleSubmit, roleData }) {
  const [updatedRole, setUpdatedRole] = useState({
    id: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    if (roleData && show) {
      setUpdatedRole({
        id: roleData.id,
        name: roleData.name,
        description: roleData.description,
      });
    }
  }, [roleData, show]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(updatedRole);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Rol</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Nombre del Rol</Form.Label>
            <Form.Control
              type="text"
              value={updatedRole.name}
              onChange={(e) => setUpdatedRole({ ...updatedRole, name: e.target.value })}
              required
              placeholder="Ingrese el nombre del rol"
            />
          </Form.Group>

          <Form.Group controlId="description" className="mt-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={updatedRole.description}
              onChange={(e) => setUpdatedRole({ ...updatedRole, description: e.target.value })}
              placeholder="Ingrese la descripción del rol"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-4">
            Guardar Cambios
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

EditRoleModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  roleData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
};

EditRoleModal.defaultProps = {
  roleData: null,
};
