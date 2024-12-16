// src/features/Users/Components/Roles.jsx

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Form, Breadcrumb, Table, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Loading from '../../../components/common/loading/Loading.jsx';
import RolesList from './RolesList.jsx';
import NewRoleModal from '../../../components/common/modals/NewRoleModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';
import EditRoleModal from '../../../components/common/modals/EditRoleModal.jsx';
import customFetch from '../../../context/CustomFetch.js'; // Asegúrate de que la ruta es correcta

export default function Roles() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  // Estados para edición de roles
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);

  // Destructuramos addRole del contexto y eliminamos fetchRoles ya que no se usa
  const { roles, cargandoRoles, fetchUsuarios, deleteRole, addRole } = useContext(UsersContext);

  const fetchUsuariosLocal = useCallback(async () => {
    setCargandoUsuarios(true);
    try {
      const data = await customFetch('/users', 'GET');
      console.log('Datos de usuarios:', data);
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        console.error('Error: La respuesta no es un arreglo de usuarios:', data);
        Swal.fire('Error', 'Error al obtener usuarios.', 'error');
        setUsuarios([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener usuarios.', 'error');
      console.error('Error al obtener usuarios:', error);
      setUsuarios([]);
    } finally {
      setCargandoUsuarios(false);
    }
  }, []);

  const memoizedFilteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return usuarios.filter((usuario) => {
      const nombre = usuario.name?.toLowerCase() || '';
      const email = usuario.email?.toLowerCase() || '';
      return nombre.includes(term) || email.includes(term);
    });
  }, [searchTerm, usuarios]);

  useEffect(() => {
    fetchUsuariosLocal();
  }, [fetchUsuariosLocal]);

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
  }, []);

  const handleAddRole = useCallback(async (newRole) => {
    try {
      // Utilizamos addRole del contexto en lugar de customFetch directamente
      await addRole(newRole);

      // Mostrar mensaje de éxito
      Swal.fire('Éxito', 'Rol agregado exitosamente.', 'success');
      setShowAddRoleModal(false);
      await fetchUsuarios();

      if (selectedUser) {
        const [userData, status] = await customFetch(`/users/${selectedUser.id}`, 'GET');
        console.log('Datos del usuario seleccionado tras agregar rol:', userData);
        if (status === 200 && userData && typeof userData === 'object' && Array.isArray(userData.roles)) {
          setSelectedUser(userData);
        } else {
          console.error('Error al refrescar el usuario seleccionado:', userData, status);
          Swal.fire('Error', 'No se pudo actualizar la información del usuario seleccionado.', 'error');
        }
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el rol.', 'error');
      console.error('Error al agregar rol:', error);
    }
  }, [selectedUser, fetchUsuarios, addRole]);

  const handleEditRoleClick = (role) => {
    setRoleToEdit(role);
    setShowEditRoleModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await deleteRole(roleId); 
        // deleteRole se encarga de mostrar mensaje de éxito o error
      } catch (error) {
        // Si quieres, puedes dejar un console.error, pero no es necesario otro Swal
        console.error('Error al eliminar rol:', error);
      }
    }
  };
  

  // Verificar que roles se actualizan correctamente
  useEffect(() => {
    console.log('Roles desde el contexto en Roles.jsx:', roles);
  }, [roles]);

  return (
    <div className="mt-2 usuarios-con-roles-section">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/usuarios">Gestión de Usuarios</Breadcrumb.Item>
        <Breadcrumb.Item active>Roles</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="section-title">Gestión de Usuarios y Roles</h3>

      <Row>
        {/* Columna Izquierda: CRUD de Roles Existentes */}
        <Col xs={12} lg={6}>
          <h5 className="mt-3 mt-lg-0">Roles Existentes:</h5>
          {cargandoRoles ? (
            <Loading />
          ) : roles && roles.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.description || 'Sin descripción'}</td>
                    <td>
                      <CustomButton
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditRoleClick(role)}
                        aria-label={`Editar Rol ${role.name}`}
                      >
                        <FaEdit />
                      </CustomButton>
                      <CustomButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        aria-label={`Eliminar Rol ${role.name}`}
                      >
                        <FaTrash />
                      </CustomButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay roles disponibles.</p>
          )}
          <CustomButton
            onClick={() => setShowAddRoleModal(true)}
            className="mb-3"
            aria-label="Agregar Rol"
          >
            <FaPlus className="me-2" />
            Agregar Rol
          </CustomButton>
        </Col>

        {/* Columna Derecha: Buscador, Usuarios y Roles del Usuario Seleccionado */}
        <Col xs={12} lg={6}>
        <h5 className="mt-3 mt-lg-0">Asignación de Roles</h5>
          {/* Buscador de usuarios */}
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3 search-input"
            aria-label="Buscar Usuario"
            autoComplete="off"
          />

          {cargandoUsuarios ? (
            <Loading />
          ) : (
            <>
              {searchTerm && memoizedFilteredUsers.length > 0 ? (
                <ul className="list-unstyled">
                  {memoizedFilteredUsers.map((usuario) => (
                    <li
                      key={usuario.id}
                      style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
                      onClick={() => handleSelectUser(usuario)}
                      aria-label={`Seleccionar usuario ${usuario.name}`}
                    >
                      {usuario.name} ({usuario.email})
                    </li>
                  ))}
                </ul>
              ) : (
                searchTerm && <p>No se encontraron usuarios.</p>
              )}

              {selectedUser && (
                <div style={{ marginTop: '2rem' }}>
                  <h5>Roles de {selectedUser.name}:</h5>
                  <RolesList userId={selectedUser.id} />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      <NewRoleModal
        show={showAddRoleModal}
        handleClose={() => setShowAddRoleModal(false)}
        handleSubmit={handleAddRole} // Utiliza handleAddRole correctamente
      />

      {roleToEdit && (
        <EditRoleModal
          show={showEditRoleModal}
          handleClose={() => setShowEditRoleModal(false)}
          roleData={roleToEdit}
        />
      )}
    </div>
  );
}
