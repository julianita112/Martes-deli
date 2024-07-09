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
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function ProductoTerminado() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [productosPerPage] = useState(3);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
      setFilteredProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  useEffect(() => {
    filterProductos();
  }, [search, productos]);

  const filterProductos = () => {
    const filtered = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProductos(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedProducto({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: 0,
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (producto) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el producto ${producto.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/productos/${producto.id_producto}`);
        fetchProductos(); // Refrescar la lista de productos
        Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
      } catch (error) {
        console.error("Error deleting producto:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el producto.', 'error');
      }
    }
  };

  const handleSave = async () => {
    const productoToSave = {
      ...selectedProducto,
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/productos/${selectedProducto.id_producto}`, productoToSave);
        Swal.fire('¡Actualización exitosa!', 'El producto ha sido actualizado correctamente.', 'success');
      } else {
        await axios.post("http://localhost:3000/api/productos", productoToSave);
        Swal.fire('¡Creación exitosa!', 'El producto ha sido creado correctamente.', 'success');
      }
      fetchProductos(); // Refrescar la lista de productos
      handleOpen();
    } catch (error) {
      console.error("Error saving producto:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el producto.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProducto({ ...selectedProducto, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (producto) => {
    setSelectedProducto(producto);
    handleDetailsOpen();
  };

  // Obtener productos actuales
  const indexOfLastProducto = currentPage * productosPerPage;
  const indexOfFirstProducto = indexOfLastProducto - productosPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstProducto, indexOfLastProducto);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProductos.length / productosPerPage); i++) {
    pageNumbers.push(i);
  }

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Producto
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Productos terminados
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Editar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProductos.map((producto) => (
                    <tr key={producto.id_producto}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{producto.nombre}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.descripcion}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.precio}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.stock}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-1">
                        <IconButton className="btnedit" size="sm" color="blue" onClick={() => handleEdit(producto)}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton className="cancelar" size="sm" color="red" onClick={() => handleDelete(producto)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(producto)}>
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      <Dialog open={open} handler={handleOpen} className="custom-modal">
        <DialogHeader>{editMode ? "Editar Producto" : "Crear Producto"}</DialogHeader>
        <DialogBody className="custom-modal-body">
        <div className="flex flex-col space-y-4">
          <Input
            label="Nombre"
            name="nombre"
            value={selectedProducto.nombre}
            onChange={handleChange}
            required
          />
          <Input
            label="Descripción"
            name="descripcion"
            value={selectedProducto.descripcion}
            onChange={handleChange}
            required
          />
          <Input
            label="Precio"
            name="precio"
            type="number"
            value={selectedProducto.precio}
            onChange={handleChange}
            required
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            value={selectedProducto.stock}
            onChange={handleChange}
            required
          />
           </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" className="btnagregarm"  onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Producto</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="font-semibold">Nombre:</td>
                <td>{selectedProducto.nombre}</td>
              </tr>
              <tr>
                <td className="font-semibold">Descripción:</td>
                <td>{selectedProducto.descripcion}</td>
              </tr>
              <tr>
                <td className="font-semibold">Precio:</td>
                <td>{selectedProducto.precio}</td>
              </tr>
              <tr>
                <td className="font-semibold">Stock:</td>
                <td>{selectedProducto.stock}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{selectedProducto.createdAt ? new Date(selectedProducto.createdAt).toLocaleString() : "N/A"}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{new Date(selectedProducto.updatedAt).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="blue-gray" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

