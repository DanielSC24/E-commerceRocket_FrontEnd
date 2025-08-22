import { Component } from '@angular/core';
import { Form } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { UsuarioRequest } from '../../models/usuario.request.model';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../service/usuarios.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioResponse } from '../../models/usuario.response.model';
import {Roles } from '../../constants/constants';

// Define Roles enum if not imported from elsewhere


@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
 
  onRolesChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selected: string[] = Array.from(select.selectedOptions).map(option => option.value);
    this.usuarioForm.get('roles')?.setValue(selected);
    this.usuarioForm.get('roles')?.markAsTouched();
  }

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
      username: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roles: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  
    //Se ejecuta al inicializar el componente
   
  ngOnInit() {
    this.listarUsuarios();
    if(this.authService.hasRole(Roles.ADMIN)){ 
      this.muestraAcciones = true;
    }
  }
//lista de usuarios
  listarUsuarios(): void {
    this .usuariosService.getUsuarios().subscribe({
      next: resp => {
        this.usuarios = resp;
      }
    });
  }
  //transformar rol de usuario
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
  //se ejecuta al alternar el formulario
  toggleForm(): void {
    this.showForm = !this.showForm;
    this.textoModal = 'Nuevo Usuario';
    this.isEditMode = false;
    this.usuarioForm.reset();
    this.selectedUsuario = null;
  }
  //reinicia el formulario
  resetForm(): void {
    this.usuarioForm.reset();
    this.showForm = false;
    this.textoModal = 'Nuevo Usuario';
    this.isEditMode = false;
    this.selectedUsuario = null;
  }
  //actualiza o crea un usuario
  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const formValue = this.usuarioForm.value;
      // Refuerzo: asegurar que roles es array y tiene al menos un valor
      const rolesValue = Array.isArray(formValue.roles) ? formValue.roles.filter((r: any) => !!r) : [];
      if (!rolesValue.length) {
        Swal.fire({
          title: 'Error',
          text: 'Debes seleccionar al menos un rol.',
          icon: 'error'
        });
        return;
      }
      const usuarioData: any = {
        username: formValue.username,
        password: formValue.password,
        roles: rolesValue
      };
      if (this.isEditMode) {
        this.usuariosService.putUsuario(usuarioData, formValue.nombre_usuario).subscribe({
          next: updateUsuario => {
            // Actualiza el usuario en la lista
            const index = this.usuarios.findIndex(u => u.username === formValue.username);
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
      } else {
        //crea un nuevo usuario
        this.usuariosService.postUsuario(usuarioData).subscribe({
          next: newUsuario => {
            this.usuarios.push(newUsuario);
            Swal.fire({
              title: 'Usuario creado',
              text: 'El usuario fue creado correctamente.',
              icon: 'success'
            });
            this.resetForm();
          }
        });
      }
    }
  }
  cancelar(): void {
    this.showForm = false;
    this.usuarioForm.reset();
  }

  //se ejecuta al editar un usuario
    editUsuario(usuario: UsuarioResponse): void {
      this.showForm = true;
      this.textoModal = 'Editando Usuario ' + usuario.username;
      this.isEditMode = true;
      this.selectedUsuario = usuario;
      this.usuarioForm.patchValue({
        ...usuario
      });
    
  }
  //elimina un usuario
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
            this.usuarios = this.usuarios.filter(u => u.username !== nombre_usuario);
            Swal.fire({
              title: 'Usuario ' + deleteUsuario.username + ' eliminado',
              text: 'El usuario fue eliminado correctamente.',
              icon: 'success'
            });
          }
        });
      }
    });
  }
}
