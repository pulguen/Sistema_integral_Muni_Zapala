// src/features/Users/Components/Roles.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Breadcrumb } from 'react-bootstrap';
import customFetch from '../../../context/CustomFetch.js';
import Swal from 'sweetalert2';
import Loading from '../../../components/common/loading/Loading.jsx';
import RolesList from './RolesList.jsx'; // Importa el componente RolesList

export default function Roles() {
  const [users, setUsers] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await customFetch('/users', 'GET');
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('La respuesta no es un arreglo:', data);
        setUsers([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener usuarios.', 'error');
      console.error('Error al obtener usuarios:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = users.filter((usuario) => {
      const nombre = usuario.name?.toLowerCase() || '';
      const email = usuario.email?.toLowerCase() || '';
      return nombre.includes(term) || email.includes(term);
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

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
      />

      {cargando ? (
        <Loading />
      ) : (
        <>
          {searchTerm && filteredUsers.length > 0 ? (
            <ul className="list-unstyled">
              {filteredUsers.map((usuario) => (
                <li 
                  key={usuario.id} 
                  style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
                  onClick={() => handleSelectUser(usuario)}
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
              <RolesList selectedUser={selectedUser} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
