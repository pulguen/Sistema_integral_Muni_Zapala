import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Table, Form, Breadcrumb } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import NewUserModal from '../../../components/common/modals/NewUserModal.jsx';
import EditUserModal from '../../../components/common/modals/EditUserModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import Loading from '../../../components/common/loading/Loading.jsx';
import customFetch from '../../../context/CustomFetch.js';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'asc',
  });

  const fetchUsuarios = useCallback(async () => {
    try {
      const data = await customFetch('/users', 'GET');
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        console.error('Error: La respuesta no es un arreglo:', data);
        setUsuarios([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener usuarios.', 'error');
      console.error('Error al obtener usuarios:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const nombreCompleto = `${usuario.name}`.toLowerCase();
    const email = usuario.email?.toLowerCase() || '';
    return nombreCompleto.includes(searchTerm.toLowerCase()) || email.includes(searchTerm);
  });

  const sortedUsuarios = React.useMemo(() => {
    let sortableUsuarios = [...filteredUsuarios];
    if (sortConfig !== null) {
      sortableUsuarios.sort((a, b) => {
        const aKey = a[sortConfig.key];
        const bKey = b[sortConfig.key];

        if (aKey < bKey) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aKey > bKey) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsuarios;
  }, [filteredUsuarios, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddUser = async (newUser) => {
    try {
      await customFetch('/users', 'POST', newUser);
      await fetchUsuarios();
      setShowAddModal(false);
      Swal.fire('Éxito', 'Usuario agregado exitosamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el usuario.', 'error');
      console.error('Error al agregar usuario:', error);
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      const payload = {
        name: updatedUser.name,
        email: updatedUser.email,
      };

      if (updatedUser.password) {
        payload.password = updatedUser.password;
      }

      await customFetch(`/users/${updatedUser.id}`, 'PUT', payload);
      await fetchUsuarios();
      setShowEditModal(false);
      Swal.fire('Éxito', 'Usuario modificado exitosamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al modificar el usuario.', 'error');
      console.error('Error al modificar usuario:', error);
    }
  };

  const onDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer. ¿Deseas eliminar este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        await customFetch(`/users/${id}`, 'DELETE');
        await fetchUsuarios();
        Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
      console.error('Error al eliminar usuario:', error);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  return (
    <div className="table-responsive mt-2 usuarios-section">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Gestión de Usuarios</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="section-title">Gestión de Usuarios</h3>

      <Form.Control
        type="text"
        placeholder="Buscar por nombre o email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3 search-input"
      />

      <CustomButton onClick={() => setShowAddModal(true)} className="mb-3">
        <FaPlus className="me-2" />
        Agregar Usuario
      </CustomButton>

      {cargando ? (
        <Loading />
      ) : (
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')}>Nombre {getSortIcon('name')}</th>
              <th onClick={() => requestSort('email')}>Email {getSortIcon('email')}</th>
              <th>Roles</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.name}</td>
                <td>{usuario.email}</td>
                <td>
                  {Array.isArray(usuario.roles) && usuario.roles.length > 0
                    ? usuario.roles.map((role) => role.name).join(', ')
                    : 'Sin roles'}
                </td>
                <td>
                  {Array.isArray(usuario.permissions) && usuario.permissions.length > 0
                    ? usuario.permissions.map((permiso) => permiso).join(', ')
                    : 'Sin permisos'}
                </td>
                <td>
                  <CustomButton
                    variant="warning"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(usuario);
                      setShowEditModal(true);
                    }}
                  >
                    <FaEdit />
                  </CustomButton>
                  <CustomButton
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(usuario.id)}
                  >
                    <FaTrash />
                  </CustomButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <NewUserModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleAddUser}
      />

      {selectedUser && (
        <EditUserModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          userData={selectedUser}
          handleSubmit={handleEditUser}
        />
      )}
    </div>
  );
}
