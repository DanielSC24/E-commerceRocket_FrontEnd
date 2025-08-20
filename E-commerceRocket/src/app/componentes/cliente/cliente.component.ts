import { Component } from '@angular/core';
import { ClienteRequest } from '../../models/cliente.request.model';
import { ClientesService } from '../../service/clientes.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteResponse } from '../../models/cliente.response.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth.service';


@Component({
  selector: 'app-cliente',
  standalone: false,
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent {

  clientes: ClienteResponse[] = [];
  showForm: boolean = false;
  clienteForm: FormGroup;
  textoModal: string = 'Nuevo Cliente';
  selectedCliente: ClienteResponse | null = null;
  isEditMode: boolean = false;
  mostrarAcciones: boolean = false;

  constructor(
    private clientesService: ClientesService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.clienteForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      apellido: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      direccion: ['', [Validators.required, Validators.maxLength(100)]]
    });

  }
  //se ejecuta al inicializar el componente
  resetForm(): void {
    this.clienteForm.reset();
    this.showForm = false;
    this.isEditMode = false;
    this.selectedCliente = null;
    this.textoModal = 'Nuevo Cliente';
  }
  //inicializa el componente
  ngOnInit(){
  this.listarClientes();
  // Replace 'ADMIN_ROLE' with the actual value or enum used in your app for the admin role
    if(this.authService.hasRole('ADMIN')) {
      this.mostrarAcciones = true;
    }
}
//lista de clientes
listarClientes(): void{
  this.clientesService.getClientes().subscribe({
    next: resp => {
      this.clientes = resp;
    }
  });
}
//se ejecuta al alternar el formulario
toggleForm(): void {
  this.showForm = !this.showForm;
  this.textoModal = 'Nuevo Cliente';
  this.isEditMode = false;
  this.clienteForm.reset();
  this.selectedCliente = null;
}
  //actualiza o crea un cliente
onSubmit(): void {
  if (this.clienteForm.valid){
    const clienteData = this.clienteForm.value;
    if (this.isEditMode){
      // Actualiza un cliente existente
      this.clientesService.putCliente(clienteData, clienteData.id).subscribe({
        next: updateCliente => {
          const index = this.clientes.findIndex(c => c.id === updateCliente.id);
          if (index !== -1){
            this.clientes[index] = updateCliente;
          }
          Swal.fire({
            title: 'Cliente actualizado',
            text: 'El cliente se ha actualizado correctamente',
            icon: 'success'
          });
          this.resetForm();
        }
      });
    }else{
      // Crea un nuevo cliente
      this.clientesService.postCliente(clienteData).subscribe({
        next: newCliente => {
          this.clientes.push(newCliente);
          Swal.fire({
            title: 'Cliente creado',
            text: 'El cliente se ha creado correctamente',
            icon: 'success'
          });
          this.resetForm();
        }
      });
    }
  }
}
//Edita un cliente
editCliente(cliente: ClienteResponse): void {
  this.showForm = true;
  this.textoModal = 'Editando Cliente' + cliente.nombre;
  this.isEditMode = true;
  this.selectedCliente = cliente;
  this.clienteForm.patchValue({
    ...cliente
  })
}

//elimina un cliente
deleteCliente(idCliente: number): void {
  Swal.fire({
    title: '¿Estás seguro que deseas eliminar el cliente',
    text: 'Eliminar cliente',
    icon: 'question',
    showConfirmButton: true,
    showCancelButton: true
    //se confirma la eliminacion
  }).then(resp => {
    if (resp.isConfirmed){
      this.clientesService.deleteCliente(idCliente).subscribe({
        next: deletedCliente => {
          this.clientes = this.clientes.filter(c => c.id !== idCliente);
          Swal.fire({
            title: 'Cliente eliminado' + deletedCliente.nombre + 'eliminado',
            text: 'El cliente se ha eliminado correctamente',
            icon: 'success'
          });
        }
      });
    }
  });
}
}