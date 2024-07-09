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
import { PlusIcon, EyeIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState({
    id_cliente: "",
    fecha_entrega: "",
    estado: "pendiente",
    pagado: false,
    detallesPedido: [],
    clientesh: { nombre: "", contacto: "" }
  });
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pedidosPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/pedidos");
      setPedidos(response.data);
      setFilteredPedidos(response.data);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    }
  };

  useEffect(() => {
    filterPedidos();
  }, [search, pedidos]);

  const filterPedidos = () => {
    const filtered = pedidos.filter((pedido) =>
      pedido.clientesh.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPedidos(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleCreate = () => {
    setSelectedPedido({
      id_cliente: "",
      fecha_entrega: "",
      estado: "pendiente",
      pagado: false,
      detallesPedido: [],
      clientesh: { nombre: "", contacto: "" }
    });
    setEditMode(false);
    handleOpen();
  };

  const handleEdit = (pedido) => {
    setSelectedPedido({
      ...pedido,
      detallesPedido: pedido.detallesPedido || [],
      clientesh: pedido.clientesh || { nombre: "", contacto: "" }
    });
    setEditMode(true);
    handleOpen();
  };

  const handleSave = async () => {
    if (!selectedPedido.id_cliente || !selectedPedido.fecha_entrega || selectedPedido.detallesPedido.length === 0) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    const pedidoToSave = {
      id_cliente: parseInt(selectedPedido.id_cliente),
      fecha_entrega: new Date(selectedPedido.fecha_entrega).toISOString(),
      estado: selectedPedido.estado,
      pagado: selectedPedido.pagado,
      detallesPedido: selectedPedido.detallesPedido.map(detalle => ({
        id_producto: parseInt(detalle.id_producto),
        cantidad: parseInt(detalle.cantidad)
      }))
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/pedidos/${selectedPedido.id_pedido}`, pedidoToSave);
        Swal.fire('¡Actualización exitosa!', 'El pedido ha sido actualizado correctamente.', 'success');
      } else {
        await axios.post("http://localhost:3000/api/pedidos", pedidoToSave);
        Swal.fire('¡Creación exitosa!', 'El pedido ha sido creado correctamente.', 'success');
      }
      fetchPedidos();
      handleOpen();
    } catch (error) {
      console.error("Error saving pedido:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el pedido.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedPedido({ ...selectedPedido, [name]: value });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedPedido.detallesPedido];
    if (name === 'cantidad' || name === 'id_producto') {
      detalles[index][name] = value.replace(/\D/, ''); // Solo permite dígitos
    } else {
      detalles[index][name] = value;
    }
    setSelectedPedido({ ...selectedPedido, detallesPedido: detalles });
  };

  const handleAddDetalle = () => {
    setSelectedPedido({
      ...selectedPedido,
      detallesPedido: [...selectedPedido.detallesPedido, { id_producto: "", cantidad: "" }]
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedPedido.detallesPedido];
    detalles.splice(index, 1);
    setSelectedPedido({ ...selectedPedido, detallesPedido: detalles });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (pedido) => {
    setSelectedPedido({
      ...pedido,
      detallesPedido: pedido.detallesPedido || [],
      clientesh: pedido.clientesh || { nombre: "", contacto: "" }
    });
    handleDetailsOpen();
  };

  const indexOfLastPedido = currentPage * pedidosPerPage;
  const indexOfFirstPedido = indexOfLastPedido - pedidosPerPage;
  const currentPedidos = filteredPedidos.slice(indexOfFirstPedido, indexOfLastPedido);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredPedidos.length / pedidosPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate}   className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Pedido
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por cliente..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Pedidos
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentPedidos.map((pedido) => (
                <Card key={pedido.id_pedido} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    Cliente: {pedido.clientesh.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Fecha de Entrega: {new Date(pedido.fecha_entrega).toLocaleDateString()}
                  </Typography>
                  <Typography color="blue-gray">
                    Estado: {pedido.estado}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(pedido)}>
                      <EyeIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton  className="btnedit" size="sm"  onClick={() => handleEdit(pedido)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton className="btncancelarinsumo" size="sm" onClick={() => handleDelete(pedido.id_pedido)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
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
  <DialogHeader className="color-pink-500 text-black">
    {editMode ? "Editar Pedido" : "Crear Pedido"}
  </DialogHeader>
  <DialogBody className="p-4 overflow-auto max-h-[60vh]">
    <div className="space-y-4">
      <Input
        label="ID Cliente"
        name="id_cliente"
        type="number"
        value={selectedPedido.id_cliente}
        onChange={handleChange}
        className="w-full"
        required
      />
      <Input
        label="Fecha de Entrega"
        name="fecha_entrega"
        type="date"
        value={selectedPedido.fecha_entrega.split('T')[0]}
        onChange={handleChange}
        className="w-full"
        required
      />
      <Input
        label="Estado"
        name="estado"
        value={selectedPedido.estado}
        onChange={handleChange}
        className="w-full"
        required
      />
      <div className="flex items-center space-x-2">
        <input
          id="pagado"
          name="pagado"
          type="checkbox"
          checked={selectedPedido.pagado}
          onChange={(e) => setSelectedPedido({ ...selectedPedido, pagado: e.target.checked })}
          className="form-checkbox h-4 w-4 text-green-500 focus:ring-green border-gray-300 rounded"
        />
        <label htmlFor="pagado" className=" text-gray-700">Pagado</label>
      </div>
      <Typography variant="h6" color="blue-gray">
        Agregar Productos
      </Typography>
      {selectedPedido.detallesPedido.map((detalle, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Input
            label="ID Producto"
            name="id_producto"
            type="number"
            value={detalle.id_producto}
            onChange={(e) => handleDetalleChange(index, e)}
            className="w-1/2"
          />
          <Input
            label="Cantidad"
            name="cantidad"
            type="number"
            value={detalle.cantidad}
            onChange={(e) => handleDetalleChange(index, e)}
            className="w-1/2"
          />
          <div className="flex items-center">
          <IconButton
            color="red"
            onClick={() => handleRemoveDetalle(index)}
            className="btncancelarm" size="sm"
          >
            <TrashIcon className="h-5 w-5" />
          </IconButton>
        </div>
        </div>
      ))}
      <Button color="blue" onClick={handleAddDetalle}>
        Agregar Detalle
      </Button>
    </div>
  </DialogBody>
  <DialogFooter className="flex justify-end">
    <Button variant="text" color="red" onClick={handleOpen}>
      Cancelar
    </Button>
    <Button variant="gradient" color="green" onClick={handleSave}>
      {editMode ? "Guardar Cambios" : "Crear Pedido"}
    </Button>
  </DialogFooter>
</Dialog>



      <Dialog open={detailsOpen} handler={handleDetailsOpen} >
        <DialogHeader>Detalles del Pedido</DialogHeader>
        <DialogBody divider className="overflow-y-auto max-h-[60vh]">
          {selectedPedido.clientesh && (
            <div>
              <Typography variant="h6" color="blue-gray">
                Información del Cliente
              </Typography>
              <table className="min-w-full mt-2">
                <tbody>
                  <tr>
                    <td className="font-semibold">ID Cliente:</td>
                    <td>{selectedPedido.clientesh.id_cliente}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Nombre:</td>
                    <td>{selectedPedido.clientesh.nombre}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Contacto:</td>
                    <td>{selectedPedido.clientesh.contacto}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Creado:</td>
                    <td>{new Date(selectedPedido.clientesh.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Actualizado:</td>
                    <td>{new Date(selectedPedido.clientesh.updatedAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles del Pedido
            </Typography>
            <table className="min-w-full mt-2">
              <tbody>
                <tr>
                  <td className="font-semibold">ID Pedido:</td>
                  <td>{selectedPedido.id_pedido}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Fecha de Entrega:</td>
                  <td>{new Date(selectedPedido.fecha_entrega).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Estado:</td>
                  <td>{selectedPedido.estado}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Pagado:</td>
                  <td>{selectedPedido.pagado ? "Sí" : "No"}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Creado:</td>
                  <td>{new Date(selectedPedido.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Actualizado:</td>
                  <td>{new Date(selectedPedido.updatedAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles de Productos
            </Typography>
            <table className="min-w-full mt-2">
              <thead>
                <tr>
                  <th className="font-semibold">ID Detalle</th>
                  <th className="font-semibold">ID Producto</th>
                  <th className="font-semibold">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {selectedPedido.detallesPedido.map((detalle) => (
                  <tr key={detalle.id_detalle_pedido}>
                    <td>{detalle.id_detalle_pedido}</td>
                    <td>{detalle.id_producto}</td>
                    <td>{detalle.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
