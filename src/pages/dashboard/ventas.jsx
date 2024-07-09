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
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from "sweetalert2";

export function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState({
    id_cliente: "",
    fecha_venta: "",
    estado: "pendiente",
    pagado: false,
    detalleVentas: [], // Aquí cambiamos a "detalleVentas"
    cliente: { nombre: "", contacto: "" },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ventasPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/ventas");
      setVentas(response.data);
      setFilteredVentas(response.data);
    } catch (error) {
      console.error("Error fetching ventas:", error);
    }
  };

  useEffect(() => {
    filterVentas();
  }, [search, ventas]);

  const filterVentas = () => {
    const filtered = ventas.filter((venta) =>
      venta.cliente.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredVentas(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleCreate = () => {
    setSelectedVenta({
      id_cliente: "",
      fecha_venta: "",
      estado: "pendiente",
      pagado: false,
      detalleVentas: [], // Aquí cambiamos a "detalleVentas"
      cliente: { nombre: "", contacto: "" },
    });
    handleOpen();
  };

  const handleSave = async () => {
    if (!selectedVenta.id_cliente || !selectedVenta.fecha_venta || selectedVenta.detalleVentas.length === 0) {
      Swal.fire("Error", "Por favor, complete todos los campos requeridos.", "error");
      return;
    }

    const ventaToSave = {
      id_cliente: parseInt(selectedVenta.id_cliente),
      fecha_venta: selectedVenta.fecha_venta,
      estado: selectedVenta.estado,
      pagado: selectedVenta.pagado,
      detalleVentas: selectedVenta.detalleVentas.map((detalle) => ({
        id_producto: parseInt(detalle.id_producto),
        cantidad: parseInt(detalle.cantidad),
        precio_unitario: parseFloat(detalle.precio_unitario),
      })),
    };

    try {
      await axios.post("http://localhost:3000/api/ventas", ventaToSave);
      Swal.fire("¡Creación exitosa!", "La venta ha sido creada correctamente.", "success");
      fetchVentas();
      handleOpen();
    } catch (error) {
      console.error("Error saving venta:", error);
      Swal.fire("Error", "Hubo un problema al guardar la venta.", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedVenta({ ...selectedVenta, [name]: value });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedVenta.detalleVentas];
    if (name === "cantidad" || name === "id_producto") {
      detalles[index][name] = value.replace(/\D/, ""); // Solo permite dígitos
    } else if (name === "precio_unitario") {
      detalles[index][name] = value.replace(/[^\d.]/, ""); // Permite dígitos y un punto decimal
    } else {
      detalles[index][name] = value;
    }
    setSelectedVenta({ ...selectedVenta, detalleVentas: detalles });
  };

  const handleAddDetalle = () => {
    setSelectedVenta({
      ...selectedVenta,
      detalleVentas: [...selectedVenta.detalleVentas, { id_producto: "", cantidad: "", precio_unitario: "" }],
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedVenta.detalleVentas];
    detalles.splice(index, 1);
    setSelectedVenta({ ...selectedVenta, detalleVentas: detalles });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (venta) => {
    setSelectedVenta({
      ...venta,
      detalleVentas: venta.detalles || [],
      cliente: venta.cliente || { nombre: "", contacto: "" },
    });
    handleDetailsOpen();
  };

  const handleUpdateState = async (id_venta) => {
    const { value: estado } = await Swal.fire({
      title: "Actualizar Estado",
      input: "select",
      inputOptions: {
        pendiente: "Pendiente",
        "en preparación": "En preparación",
        completado: "Completado",
      },
      inputPlaceholder: "Selecciona el estado",
      showCancelButton: true,
    });

    if (estado) {
      try {
        await axios.put(`http://localhost:3000/api/ventas/${id_venta}/estado`, { estado });
        Swal.fire("¡Actualización exitosa!", "El estado de la venta ha sido actualizado.", "success");
        fetchVentas();
      } catch (error) {
        console.error("Error updating estado:", error);
        Swal.fire("Error", "Hubo un problema al actualizar el estado de la venta.", "error");
      }
    }
  };

  const indexOfLastVenta = currentPage * ventasPerPage;
  const indexOfFirstVenta = indexOfLastVenta - ventasPerPage;
  const currentVentas = filteredVentas.slice(indexOfFirstVenta, indexOfLastVenta);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredVentas.length /  ventasPerPage); i++) {
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
          <Button onClick={handleCreate}  className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Venta
          </Button>
          <div className="mb-6">
            <Input type="text" placeholder="Buscar por cliente..." value={search} onChange={handleSearchChange} />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Ventas
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentVentas.map((venta) => (
                <Card key={venta.id_venta} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    Cliente: {venta.cliente.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Fecha de Venta: {new Date(venta.fecha_venta).toLocaleDateString()}
                  </Typography>
                  <Typography color="blue-gray">Estado: {venta.estado}</Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton className="btnvisualizar" size="sm"  onClick={() => handleViewDetails(venta)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton  className="btnedit" size="sm" onClick={() => handleUpdateState(venta.id_venta)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-center items-center space-x-2">
            {pageNumbers.map(number => (
              <Button
                key={number}
                onClick={() => paginate(number)}
                className={`pagination ${number === currentPage ? 'active' : ''}`}               
                size="sm"
              >
                {number}
              </Button>
            ))}
          </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="overflow-auto max-h-[90vh]">
        <DialogHeader>Crear Venta</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          <Input label="ID Cliente" name="id_cliente" type="number" value={selectedVenta.id_cliente} onChange={handleChange} />
          <Input label="Fecha de Venta" name="fecha_venta" type="date" value={selectedVenta.fecha_venta} onChange={handleChange} />
          <Select label="Estado" name="estado" value={selectedVenta.estado} onChange={(e) => setSelectedVenta({ ...selectedVenta, estado: e.target.value })}>
            <Option value="pendiente">Pendiente</Option>
            <Option value="en preparación">En preparación</Option>
            <Option value="completado">Completado</Option>
          </Select>
          <div className="flex items-center">
            <Typography className="mr-2">Pagado:</Typography>
            <input type="checkbox" name="pagado" checked={selectedVenta.pagado} onChange={(e) => setSelectedVenta({ ...selectedVenta, pagado: e.target.checked })} />
          </div>
          <Typography variant="h6" color="blue-gray" className="mt-4">
            Detalles de la Venta
          </Typography>
          {selectedVenta.detalleVentas.map((detalle, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <Input label="ID Producto" name="id_producto" type="number" value={detalle.id_producto} onChange={(e) => handleDetalleChange(index, e)} />
              <Input label="Cantidad" name="cantidad" type="number" value={detalle.cantidad} onChange={(e) => handleDetalleChange(index, e)} />
              <Input label="Precio Unitario" name="precio_unitario" type="number" step="0.01" value={detalle.precio_unitario} onChange={(e) => handleDetalleChange(index, e)} />
              <IconButton color="red" onClick={() => handleRemoveDetalle(index)} className="mt-6">
                <TrashIcon className="h-5 w-5" />
              </IconButton>
            </div>
          ))}
          <Button color="blue" onClick={handleAddDetalle}>
            Agregar Detalle
          </Button>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" className="btncancelarm" size="sm" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient"  className="btnagregarm" size="sm" onClick={handleSave}>
            Crear Venta
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles de la Venta</DialogHeader>
        <DialogBody divider>
          {selectedVenta.cliente && (
            <div>
              <Typography variant="h6" color="blue-gray">
                Información del Cliente
              </Typography>
              <table className="min-w-full mt-2">
                <tbody>
                  <tr>
                    <td className="font-semibold">ID Cliente:</td>
                    <td>{selectedVenta.cliente.id_cliente}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Nombre:</td>
                    <td>{selectedVenta.cliente.nombre}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Contacto:</td>
                    <td>{selectedVenta.cliente.contacto}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Creado:</td>
                    <td>{new Date(selectedVenta.cliente.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Actualizado:</td>
                    <td>{new Date(selectedVenta.cliente.updatedAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles de la Venta
            </Typography>
            <table className="min-w-full mt-2">
              <tbody>
                <tr>
                  <td className="font-semibold">ID Venta:</td>
                  <td>{selectedVenta.id_venta}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Fecha de Venta:</td>
                  <td>{new Date(selectedVenta.fecha_venta).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Estado:</td>
                  <td>{selectedVenta.estado}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Pagado:</td>
                  <td>{selectedVenta.pagado ? "Sí" : "No"}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Creado:</td>
                  <td>{new Date(selectedVenta.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Actualizado:</td>
                  <td>{new Date(selectedVenta.updatedAt).toLocaleString()}</td>
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
                  <th className="font-semibold">Precio Unitario</th>
                </tr>
              </thead>
              <tbody>
                {selectedVenta.detalleVentas.map((detalle) => (
                  <tr key={detalle.id_detalle_venta}>
                    <td>{detalle.id_detalle_venta}</td>
                    <td>{detalle.id_producto}</td>
                    <td>{detalle.cantidad}</td>
                    <td>{detalle.precio_unitario}</td>
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

