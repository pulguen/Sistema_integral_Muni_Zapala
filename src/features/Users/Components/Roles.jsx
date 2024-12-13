// src/features/Users/Components/Roles.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Breadcrumb } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import Loading from '../../../components/common/loading/Loading.jsx';
import RolesList from './RolesList.jsx';
import NewRoleModal from '../../../components/common/modals/NewRoleModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import customFetch from '../../../context/CustomFetch.js';

export default function Roles() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setCargandoUsuarios(true);
    try {
      const data = await customFetch('/users', 'GET');
      console.log('Datos de usuarios:', data);
      // data es un array directo de usuarios: [{...}, {...}, ...]
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
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
  }, []);

  const handleAddRole = useCallback(async (newRole) => {
    try {
      const data = await customFetch('/roles', 'POST', newRole);
      console.log('Respuesta al agregar rol:', data);
      // data = [ [nuevoRol], 200 ] o similar
      if (Array.isArray(data) && data.length === 2 && typeof data[1] === 'number') {
        const [, status] = data; // No usamos fetchedRoleData, sólo status
        if (status === 200) {
          Swal.fire('Éxito', 'Rol agregado exitosamente.', 'success');
          setShowAddRoleModal(false);
          await fetchUsuarios();
          if (selectedUser) {
            const userData = await customFetch(`/users/${selectedUser.id}`, 'GET');
            console.log('Datos del usuario seleccionado tras agregar rol:', userData);

            // Revisamos si la respuesta del endpoint /users/{id} es [usuario, status]
            if (Array.isArray(userData) && userData.length === 2 && typeof userData[1] === 'number') {
              const [refreshedUser, refreshedStatus] = userData;
              if (refreshedStatus === 200) {
                setSelectedUser(refreshedUser);
              } else {
                console.error('Error al refrescar el usuario seleccionado:', refreshedUser, refreshedStatus);
                Swal.fire('Error', 'No se pudo actualizar la información del usuario seleccionado.', 'error');
              }
            } else {
              console.error('Error: La respuesta de /users/{id} no es [user, status]:', userData);
              Swal.fire('Error', 'No se pudo actualizar la información del usuario seleccionado.', 'error');
            }
          }
        } else {
          console.error('Error al agregar rol:', status);
          Swal.fire('Error', 'Hubo un problema al agregar el rol.', 'error');
        }
      } else {
        console.error('Error: La respuesta al agregar rol no es [data, status]:', data);
        Swal.fire('Error', 'Hubo un problema al agregar el rol.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el rol.', 'error');
      console.error('Error al agregar rol:', error);
    }
  }, [selectedUser, fetchUsuarios]);

  return (
    <div className="mt-2 usuarios-con-roles-section">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/usuarios">Gestión de Usuarios</Breadcrumb.Item>
        <Breadcrumb.Item active>Roles</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="section-title">Gestión de Usuarios y Roles</h3>

      <Form.Control
        type="text"
        placeholder="Buscar por nombre o email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3 search-input"
        aria-label="Buscar Usuario"
        autoComplete="off"
      />

      <CustomButton
        onClick={() => setShowAddRoleModal(true)}
        className="mb-3"
        aria-label="Agregar Rol"
      >
        <FaPlus className="me-2" />
        Agregar Rol
      </CustomButton>

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

      <NewRoleModal
        show={showAddRoleModal}
        handleClose={() => setShowAddRoleModal(false)}
        handleSubmit={handleAddRole}
      />
    </div>
  );
}
