import { Component } from '@angular/core';
import { PedidoResponse } from '../../models/pedido.response.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidosService } from '../../service/pedidos.service';
import Swal from 'sweetalert2';
import { PedidoRequest } from '../../models/pedido.request.model';

@Component({
  selector: 'app-pedidos',
  standalone: false,
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent {

  pedidos: PedidoResponse[]=[];
  showForm: boolean = false;
  pedidoForm: FormGroup;
  textoModal: string = 'Nuevos pedidos';
  selectedPedido: PedidoResponse | null = null;
  isEditMode: boolean = false;
  muestraAcciones: boolean = false;

  constructor(private pedidosService: PedidosService, private formBuilder: FormBuilder){
    this.pedidoForm = this.formBuilder.group({
      id: [null],
      cliente: ['', [Validators.required, Validators.maxLength(30)]],
      listarProductos:['', [Validators.required, Validators.min(0)]],
      total: ['',[Validators.required, Validators.min(0)]],
      fechaCreacion:['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      estado:['', [Validators.required, Validators.maxLength(15)]],
    });
  }

  ngOnInit(){
    this.listarPedidos();
    // if (this.authService.hasRole(Roles.ADMIN)) {
    //   this.muestraAcciones = true;
    // }
  }

  listarPedidos(): void{
    this.pedidosService.getPedido().subscribe({
      next: resp => {
         this.pedidos = resp;
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
        const pedidoData: PedidoRequest = this.pedidoForm.value;
        console.log(pedidoData);
        if (this.isEditMode) {
          this.pedidosService.putPedido(pedidoData, pedidoData.id).subscribe({
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
                title: 'Producto registrado',
                text: 'El producto fue registrado correctamente.',
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
      this.pedidoForm.patchValue({
        id: pedido.id,
        cliente: pedido.cliente,
        listarProductos: pedido.listarProductos,
        total: pedido.total,
        fechaCreacion: pedido.fechaCreacion,
        estado: pedido.estado
      });
    }

    deleteProducto(idPedido: number): void {
      Swal.fire({
        title: '¿Estás seguro que deseas eliminar el producto?',
        text: 'Eliminar producto',
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
