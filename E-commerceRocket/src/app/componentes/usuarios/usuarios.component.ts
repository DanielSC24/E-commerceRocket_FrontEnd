import { Component } from '@angular/core';
import { Form } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { UsuarioRequest } from '../../models/usuario.request.model';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../service/usuarios.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioResponse } from '../../models/usuario.response.model';

// Define Roles enum if not imported from elsewhere
export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
usuarios: UsuarioResponse[] = [];
showForm: boolean = false;
usuarioForm: FormGroup;
textoModal: string = 'nuevo usuario';
selectedUsuario: UsuarioResponse | null = null;
isEditMode: boolean = false;
muestraAcciones: boolean = false;
roles: string[] = Object.values(Roles);

constructor(private usuariosService: UsuariosService, private authService: AuthService,
  private formBuilder: FormBuilder){
    this.usuarioForm = formBuilder.group({
      nombre_usuario: ['', [Validators.required, Validators.maxLength(30)]],
      contrasenia: ['', [Validators.required, Validators.minLength(8)]],
      idRol: ['', [Validators.required]]
    });
  }
  
  ngOnInit() {
    this.listarUsuarios();
    if(this.authService.hasRole(Roles.ADMIN)){
      this.muestraAcciones = true;
    }
  }

  listarUsuarios(): void {
    this .usuariosService.getUsuarios().subscribe({
      next: resp => {
        this.usuarios = resp;
      }
    });
  }
  transformarRol(rol: string): string {
    switch (rol) {
      case Roles.ADMIN:
        return 'Administrador';
        case Roles.USER:
          return 'Usuario';
          default:
            return 'Desconocido';
    }
  }
  toggleForm(): void {
    this.showForm = !this.showForm;
    this.textoModal = 'Nuevo Usuario';
    this.isEditMode = false;
    this.usuarioForm.reset();
    this.selectedUsuario = null;
  }
  resetForm(): void {
    this.usuarioForm.reset();
    this.showForm = false;
    this.textoModal = 'Nuevo Usuario';
    this.isEditMode = false;
    this.selectedUsuario = null;
  }
  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const usuarioData: UsuarioRequest = this.usuarioForm.value;
      if (this.isEditMode) {
        this.usuariosService.putUsuario(usuarioData, usuarioData.nombre_usuario).subscribe({
          next: updateUsuario => {
            const index = this.usuarios.findIndex(u => u.nombre_usuario === usuarioData.nombre_usuario);
            if(index !== -1) {
              this.usuarios[index] = updateUsuario;
            }
            Swal.fire({
              title: 'Usuario actualizado',
              text: 'El usuario fue actualizado correctamente.',
              icon: 'success'
            });
            this.resetForm();
          }
        });
      }else {
        this.usuariosService.postUsuario(usuarioData).subscribe({
          next: newUsuario => {
            this.usuarios.push(newUsuario);
            Swal.fire({

            });
            this.resetForm();
          }
        });
      }
    }
  }
    editUsuario(usuario: UsuarioResponse): void {
      this.showForm = true;
      this.textoModal = 'Editando Usuario ' + usuario.nombre_usuario;
      this.isEditMode = true;
      this.selectedUsuario = usuario;
      this.usuarioForm.patchValue({
        ...usuario
      });
    
  }
  deleteUsuario(nombre_usuario: string): void {
    Swal.fire({
      title: '¿Estás seguro que deseas eliminar el usuario?',
      text: 'Eliminar usuario',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then(resp => {
      if(resp.isConfirmed) {
        this.usuariosService.deleteUsuario(nombre_usuario).subscribe({
          next: deleteUsuario => {
            this.usuarios = this.usuarios.filter(u => u.nombre_usuario !== nombre_usuario);
            Swal.fire({
              title: 'Usuario ' + deleteUsuario.nombre_usuario + ' eliminado',
              text: 'El usuario fue eliminado correctamente.',
              icon: 'success'
            });
          }
        });
      }
    });
  }
}
