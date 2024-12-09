import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch.js';
import Loading from '../../../components/common/loading/Loading.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';

export default function RolesList({ selectedUser }) {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [selectedRolesIds, setSelectedRolesIds] = useState([]);

  useEffect(() => {
    // Inicializar selectedRolesIds con los roles que ya tiene el usuario
    if (selectedUser && selectedUser.roles) {
      const userRoleIds = selectedUser.roles.map((r) => r.id);
      setSelectedRolesIds(userRoleIds);
    }
  }, [selectedUser]);

  const fetchRoles = async () => {
    try {
      const rolesData = await customFetch('/roles', 'GET');
      let rolesArray = [];
      if (Array.isArray(rolesData)) {
        if (rolesData[0] && Array.isArray(rolesData[0].data)) {
          rolesArray = rolesData[0].data;
        } else if (Array.isArray(rolesData[0])) {
          rolesArray = rolesData[0];
        } else if (rolesData.data && Array.isArray(rolesData.data)) {
          rolesArray = rolesData.data;
        } else {
          rolesArray = rolesData; 
        }
      } else if (rolesData.data && Array.isArray(rolesData.data)) {
        rolesArray = rolesData.data;
      }
      setRoles(rolesArray);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      Swal.fire('Error', 'No se pudieron obtener los roles.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCheckboxChange = (roleId) => {
    setSelectedRolesIds((prevSelected) => {
      if (prevSelected.includes(roleId)) {
        return prevSelected.filter((id) => id !== roleId);
      } else {
        return [...prevSelected, roleId];
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Ahora enviamos el id del usuario y el array de roles seleccionados en el body
      await customFetch(`/users/${selectedUser.id}/roles-sinc`, 'POST', { 
        id: selectedUser.id, 
        roles: selectedRolesIds 
      });
      Swal.fire('Éxito', 'Roles actualizados exitosamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar roles del usuario:', error);
      Swal.fire('Error', 'No se pudieron actualizar los roles.', 'error');
    }
  };

  return (
    <div className="roles-list">
      {cargando ? (
        <Loading />
      ) : (
        <Form>
          {roles.length > 0 ? (
            roles.map((role) => (
              <Form.Check
                key={role.id}
                type="checkbox"
                id={`role-${role.id}`}
                label={role.name}
                checked={selectedRolesIds.includes(role.id)}
                onChange={() => handleCheckboxChange(role.id)}
              />
            ))
          ) : (
            <p>No se encontraron roles.</p>
          )}
          {roles.length > 0 && (
            <CustomButton className="mt-3" onClick={handleSaveChanges}>
              Guardar Cambios
            </CustomButton>
          )}
        </Form>
      )}
    </div>
  );
}
