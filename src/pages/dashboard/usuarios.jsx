import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    nombre: "",
    email: "",
    password: "",
    id_rol: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usuariosPerPage] = useState(3); // Define cuántos usuarios mostrar por página
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/usuarios");
      const data = response.data;
      setUsuarios(data);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/roles");
      const data = response.data;
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    const filtered = usuarios.filter((user) =>
      user.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsuarios(filtered);
  }, [search, usuarios]);

  const handleOpen = () => {
    setOpen(!open);
    setFormErrors({});
  };

  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditMode(true);
    setOpen(true);
    setFormErrors({});
  };

  const handleCreate = () => {
    setSelectedUser({
      nombre: "",
      email: "",
      password: "",
      id_rol: "",
    });
    setEditMode(false);
    setOpen(true);
    setFormErrors({});
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar al usuario ${user.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/usuarios/${user.id_usuario}`);
        fetchUsuarios();
        Toast.fire({
          icon: 'success',
          title: '¡Eliminado! El usuario ha sido eliminado.'
        });
      } catch (error) {
        console.error("Error deleting usuario:", error);
        Toast.fire({
          icon: 'error',
          title: 'Error al eliminar usuario. Por favor, inténtalo de nuevo.'
        });
      }
    }
  };

  const handleSave = async () => {
    const isValid = validateFields(selectedUser);
    if (!isValid) {
      Toast.fire({
        icon: 'error',
        title: 'Por favor, completa todos los campos correctamente.'
      });
      return;
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/usuarios/${selectedUser.id_usuario}`, selectedUser);
        fetchUsuarios();
        Toast.fire({
          icon: 'success',
          title: '¡Actualizado! El usuario ha sido actualizado correctamente.'
        });
      } else {
        await axios.post("http://localhost:3000/api/usuarios/registro", selectedUser);
        fetchUsuarios();
        Toast.fire({
          icon: 'success',
          title: '¡Creado! El usuario ha sido creado correctamente.'
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving usuario:", error);
      Toast.fire({
        icon: 'error',
        title: 'Error al guardar usuario. Por favor, inténtalo de nuevo.'
      });
    }
  };

  const validateFields = (user) => {
    const errors = {};

    if (!user.nombre || user.nombre.length < 3) {
      errors.nombre = 'El nombre debe contener al menos 3 letras y no debe incluir números ni caracteres especiales.';
    }

    if (!user.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(user.email)) {
      errors.email = 'Ingrese un formato de correo electrónico válido.';
    }

    if (!user.password || user.password.length < 5) {
      errors.password = 'La contraseña debe tener al menos 5 cáracteres.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular índices de usuarios actuales a mostrar
  const indexOfLastUsuario = currentPage * usuariosPerPage;
  const indexOfFirstUsuario = indexOfLastUsuario - usuariosPerPage;
  const currentUsuarios = filteredUsuarios.slice(indexOfFirstUsuario, indexOfLastUsuario);

  // Array de números de página
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredUsuarios.length / usuariosPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  // Función para obtener el nombre del rol de un usuario
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id_rol === roleId);
    return role ? role.nombre : "Desconocido";
  };

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Crear Usuario
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por  de usuario..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Usuarios
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo Electrónico
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsuarios.map((user) => (
                    <tr key={user.id_usuario}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleName(user.id_rol)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                      <IconButton onClick={() => handleEdit(user)} className="btnedit" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                       
                    
                        <IconButton onClick={() => handleDelete(user)} className="btncancelarm" size="sm">
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton onClick={() => handleViewDetails(user)} className="btnvisualizar" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginación */}
            <div className="mt-4">
              <ul className="flex justify-center items-center space-x-2">
                {pageNumbers.map((number) => (
                  <Button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`pagination ${number === currentPage ? 'active' : ''}`}               
                  size="sm"
                >
                  {number}
                </Button>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal de Crear/Editar Usuario */}
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{editMode ? "Editar Usuario" : "Crear Usuario"}</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <Input
              size="lg"
              label="Nombre"
              name="nombre"
              value={selectedUser.nombre}
              onChange={handleChange}
              error={formErrors.nombre}
              required
            />
            <Input
              size="lg"
              label="Correo Electrónico"
              name="email"
              type="email"
              value={selectedUser.email}
              onChange={handleChange}
              error={formErrors.email}
              required
            />
            <Input
              size="lg"
              label="Contraseña"
              name="password"
              type="password"
              value={selectedUser.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />
            <Select
              label="Rol"
              name="id_rol"
              value={selectedUser.id_rol}
              onChange={(value) => setSelectedUser({ ...selectedUser, id_rol: value })}
              required
            >
              {roles.map((role) => (
                <Option key={role.id_rol} value={role.id_rol}>{role.nombre}</Option>
              ))}
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="cancelar" size="sm"

            onClick={handleOpen}
            
          >
            Cancelar
          </Button>
          <Button
           className="btnagregarm" size="sm"

            color="green"
            onClick={handleSave}
          >
            {editMode ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal de Detalles del Usuario */}
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Usuario</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <Typography variant="h6">Nombre: {selectedUser.nombre}</Typography>
            <Typography variant="h6">Correo Electrónico: {selectedUser.email}</Typography>
            <Typography variant="h6">Rol: {getRoleName(selectedUser.id_rol)}</Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleDetailsOpen}
            className="mr-1"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
