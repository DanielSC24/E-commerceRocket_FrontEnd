import { Component } from '@angular/core';
import { PedidoResponse } from '../../models/pedido.response.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidosService } from '../../service/pedidos.service';
import Swal from 'sweetalert2';
import { PedidoRequest } from '../../models/pedido.request.model';
import { ClienteResponse } from '../../models/cliente.response.model';
import { ClientesService } from '../../service/clientes.service';
import { ProductoResponse } from '../../models/producto.response.model';
import { ProductosService } from '../../service/productos.service';
import { AuthService } from '../../service/auth.service';
import { Roles } from '../../constants/constants';

@Component({
  selector: 'app-pedidos',
  standalone: false,
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent {

  pedidos: PedidoResponse[]=[];
  clientes: ClienteResponse[]=[];
  productosIds: ProductoResponse[]=[];
  productosSeleccionados: ProductoResponse[] = [];
  productosDisponibles: ProductoResponse[] = [];
  showForm: boolean = false;
  pedidoForm: FormGroup;
  textoModal: string = 'Nuevos pedidos';
  selectedPedido: PedidoResponse | null = null;
  isEditMode: boolean = false;
  muestraAcciones: boolean = false;
  estadosPedido: string[] = ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO', 'PROCESANDO'];

  constructor(private pedidosService: PedidosService, private clientesService: ClientesService,private authService: AuthService,
    private productosService: ProductosService, private formBuilder: FormBuilder){
    this.pedidoForm = this.formBuilder.group({
      id: [null],
      cliente: ['', [Validators.required]], //array del cliente por id
      listarProductos:['', [Validators.required, Validators.min(0)]],
      productos:[[], [Validators.required]], // array de productos de id
      total: ['',[Validators.required, Validators.min(0)]],
      fechaCreacion:[new Date().toISOString().split('T')[0]],
      estado:['PENDIENTE', [Validators.required]],
    });
  }

  ngOnInit(){
    this.listarPedidos();
    this.listarClientes();
    this.listarProductos();
     if (this.authService.hasRole(Roles.ADMIN)) {
       this.muestraAcciones = true;
     }
  }

  listarPedidos(): void{
    this.pedidosService.getPedido().subscribe({
      next: resp => {
         this.pedidos = resp;
      }
    });
  }

  listarClientes(): void{
    this.clientesService.getClientes().subscribe({
      next: resp => {
        this.clientes = resp;
      }
    });
  }

  listarProductos(): void{
    this.productosService.getProductos().subscribe({
      next: resp => {
        this.productosIds = resp;
      }

    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.textoModal = 'Nuevo Pedido';
    this.isEditMode = false;
    this.pedidoForm.reset();
    this.selectedPedido = null;
  }

  resetForm(): void {
    this.pedidoForm.reset();
    this.showForm = false;
    this.textoModal = 'Nuevo Pedido';
    this.isEditMode = false;
    this.selectedPedido = null;
  }

  onSubmit(): void {
      if (this.pedidoForm.valid) {
        const formValue = this.pedidoForm.value;

        const pedidoData: PedidoRequest = {
          id: formValue.id,
          clienteId: formValue.clienteId,
          productosIds: formValue.productosIds,
          total: formValue.total,
          fechaCreacion: formValue.fechaCreacion,
          estado: formValue.estado
        };


        console.log(pedidoData);
        if (this.isEditMode) {
          this.pedidosService.putPedido(pedidoData, pedidoData.id!).subscribe({
            next: updatePedido => {
              const index = this.pedidos.findIndex(p => p.id === updatePedido.id);
              if (index !== -1) {
                this.pedidos[index] = updatePedido;
              }
              Swal.fire({
                title: 'Pedido actualizado',
                text: 'El pedido fue actualizado correctamente.',
                icon: 'success'
              });
              this.resetForm();
            }
          });
        } else {
          this.pedidosService.postPedido(pedidoData).subscribe({
            next: newProducto => {
              this.pedidos.push(newProducto);
              Swal.fire({
                title: 'Pedido registrado',
                text: 'El pedido fue registrado correctamente.',
                icon: 'success'
              });
              this.resetForm();
            }
          });
        }
      }
    }

    editProducto(pedido: PedidoResponse): void {
      this.showForm = true;
      this.textoModal = 'Editando Pedido ' + pedido.cliente;
      this.isEditMode = true;
      this.selectedPedido = pedido;
      // cargar productos seleccionados
      this.productosSeleccionados = pedido.productos || [];
      this.pedidoForm.patchValue({
        id: pedido.id,
        cliente: pedido.cliente.id,
        productosIds: pedido.productos.map(p=> p.id),
        total: pedido.total,
        fechaCreacion: pedido.fechaCreacion,
        estado: pedido.estado
      });
    }

    estaProductoSeleccionado(producto: ProductoResponse): boolean {
      return this.productosSeleccionados.some(p => p.id === producto.id);
    }

    // Metodo para el manejo de productos:
    productoSeleccionado(producto: ProductoResponse, event: any): void{
      if(event.target.checked){
        this.productosSeleccionados.push(producto);
      }else{
        this.productosSeleccionados = this.productosSeleccionados.filter(p =>  p.id !== producto.id);
      }
      this.actualizarTotal();
    }

    // Método para actualizar el total
    actualizarTotal(): void{
      const total = this.productosSeleccionados.reduce((sum, producto) => sum + producto.precio, 0);
      this.pedidoForm.patchValue({
        productos: this.productosSeleccionados.map(p=> p.id),
        total: total
      });
    }

    deleteProducto(idPedido: number): void {
      Swal.fire({
        title: '¿Estás seguro que deseas eliminar el pedido?',
        text: 'Eliminar pedido',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true
      }).then(resp => {
        if (resp.isConfirmed) {
          this.pedidosService.deletePedido(idPedido).subscribe({
            next: deletedPedido => {
              this.pedidos = this.pedidos.filter(p => p.id !== idPedido);
              Swal.fire({
                title: 'Pedido ' + deletedPedido.cliente + ' eliminado.',
                text: 'El pedido fue eliminado correctamente.',
                icon: 'success'
              });
            }
          });
        }
      });
    }

}
