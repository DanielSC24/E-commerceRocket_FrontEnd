import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidosService } from '../../service/pedidos.service';
import { ClientesService } from '../../service/clientes.service';
import { ProductosService } from '../../service/productos.service';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';
import { PedidoRequest } from '../../models/pedido.request.model';
import { PedidoResponse } from '../../models/pedido.response.model';
import { ClienteResponse } from '../../models/cliente.response.model';
import { ProductoResponse } from '../../models/producto.response.model';
import { Roles } from '../../constants/constants';

@Component({
  selector: 'app-pedidos',
  standalone: false,
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  pedidos: PedidoResponse[] = [];
  clientes: ClienteResponse[] = [];
  productosIds: ProductoResponse[] = [];
  productosSeleccionados: ProductoResponse[] = [];
  showForm: boolean = false;
  pedidoForm: FormGroup;
  textoModal: string = 'Nuevo Pedido';
  selectedPedido: PedidoResponse | null = null;
  isEditMode: boolean = false;
  muestraAcciones: boolean = false;
  estadosPedido: string[] = ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO', 'PROCESANDO'];

  constructor(
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.pedidoForm = this.formBuilder.group({
      id: [null],
      clienteId: ['', Validators.required],
      productos: [[], Validators.required], // IDs de productos
      total: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]], // deshabilitado correctamente
      fechaCreacion: [new Date().toISOString().split('T')[0], Validators.required],
      estado: ['PENDIENTE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.listarPedidos();
    this.listarClientes();
    this.listarProductos();
    if (this.authService.hasRole(Roles.ADMIN)) {
      this.muestraAcciones = true;
    }
  }

  listarPedidos(): void {
    this.pedidosService.getPedido().subscribe(resp => {
      // Mostrar solo pendientes, enviados o entregados
      this.pedidos = resp.filter(p => ['PENDIENTE', 'ENVIADO', 'ENTREGADO'].includes(p.estado));
    });
  }

  listarClientes(): void {
    this.clientesService.getClientes().subscribe(resp => this.clientes = resp);
  }

  listarProductos(): void {
  this.productosService.getProductos().subscribe(resp => this.productosIds = resp);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.textoModal = 'Nuevo Pedido';
    this.isEditMode = false;
    this.productosSeleccionados = [];
    this.pedidoForm.reset({
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'PENDIENTE',
      productos: []
    });
    this.selectedPedido = null;
  }

  resetForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.productosSeleccionados = [];
    this.pedidoForm.reset({
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'PENDIENTE',
      productos: []
    });
    this.selectedPedido = null;
  }

  estaProductoSeleccionado(producto: ProductoResponse): boolean {
    return this.productosSeleccionados.some(p => p.id === producto.id);
  }

  productoSeleccionado(producto: ProductoResponse, event: any): void {
    if (event.target.checked) {
      // Si el producto no tiene cantidad, inicializarla en 1
      if (producto.cantidad === undefined) {
        (producto as any).cantidad = 1;
      }
      this.productosSeleccionados.push(producto);
    } else {
      this.productosSeleccionados = this.productosSeleccionados.filter(p => p.id !== producto.id);
    }

    // Actualizamos IDs de productos en el FormGroup
    this.pedidoForm.patchValue({
      productos: this.productosSeleccionados.map(p => p.id)
    });

    this.actualizarTotal();
  }

  actualizarCantidad(producto: any): void {
    if (producto.cantidad < 1) {
      producto.cantidad = 1;
    }
    this.actualizarTotal();
  }

  actualizarTotal(): void {
    const total = this.productosSeleccionados.reduce((sum, p) => sum + (p.precio * (p.cantidad || 1)), 0);
    this.pedidoForm.get('total')?.setValue(total);
  }


  onSubmit(): void {
    // Si no hay productos seleccionados, marcar el campo como tocado para mostrar el error
    if (!this.pedidoForm.get('productos')?.value || this.pedidoForm.get('productos')?.value.length === 0) {
      this.pedidoForm.get('productos')?.markAsTouched();
    }
    if (!this.pedidoForm.valid) return;

    // Validar stock
    const productosSinStock = this.productosSeleccionados.filter(p => p.stock <= 0);
    if (productosSinStock.length > 0) {
      Swal.fire('Error', 'Uno o más productos no tienen stock suficiente', 'error');
      return;
    }

  const formValue = this.pedidoForm.getRawValue();
      const pedidoData: any = {
        id: formValue.id,
        clienteId: Number(formValue.clienteId),
        productos: this.productosSeleccionados.map(p => ({ productoId: Number(p.id), cantidad: p.cantidad || 1 })),
        total: formValue.total,
        fechaCreacion: formValue.fechaCreacion,
        estado: formValue.estado
      };

  console.log('Pedido enviado:', pedidoData);
  if (this.isEditMode) {
      // Solo se permite cambiar estado
      this.pedidosService.putPedido(pedidoData, pedidoData.id!).subscribe(updatePedido => {
        const index = this.pedidos.findIndex(p => p.id === updatePedido.id);
        if (index !== -1) this.pedidos[index] = updatePedido;
        Swal.fire('Actualizado', 'Pedido actualizado correctamente', 'success');
        this.resetForm();
      });
    } else {
      this.pedidosService.postPedido(pedidoData).subscribe(newPedido => {
        // Actualizar stock localmente (opcional, si backend no lo hace)
        this.productosSeleccionados.forEach(p => p.stock--);
        this.pedidos.push(newPedido);
        Swal.fire('Registrado', 'Pedido registrado correctamente', 'success');
        this.resetForm();
      });
    }
  }

  editProducto(pedido: PedidoResponse): void {
    if (pedido.estado === 'ENTREGADO') return; // no editable
    this.showForm = true;
    this.textoModal = 'Editando Pedido ' + pedido.cliente.nombre;
    this.isEditMode = true;
    this.selectedPedido = pedido;
    // Reconstruir productosSeleccionados y agregar cantidad: 1 a cada producto
    this.productosSeleccionados = (pedido.productos || []).map(p => ({
      ...p,
      cantidad: 1
    }));
    this.pedidoForm.patchValue({
      id: pedido.id,
      clienteId: pedido.cliente.id,
      productos: this.productosSeleccionados.map(p => p.id),
      total: pedido.total,
      fechaCreacion: pedido.fechaCreacion,
      estado: pedido.estado
    });
  }

  deleteProducto(idPedido: number): void {
    Swal.fire({
      title: '¿Seguro que deseas cancelar el pedido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then(resp => {
      if (resp.isConfirmed) {
        // Borrado lógico: cambiar estado a CANCELADO
        const pedido = this.pedidos.find(p => p.id === idPedido);
        if (pedido) {
          pedido.estado = 'CANCELADO';
          this.pedidos = this.pedidos.filter(p => p.id !== idPedido); // no mostrar en listado
        }
        Swal.fire('Cancelado', 'El pedido fue cancelado', 'success');
      }
    });
  }

}
