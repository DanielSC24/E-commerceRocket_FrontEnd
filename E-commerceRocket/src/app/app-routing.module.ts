import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ProductosComponent } from './componentes/productos/productos.component';
import { PedidosComponent } from './componentes/pedidos/pedidos.component';
import { ClienteComponent } from './componentes/cliente/cliente.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { Roles } from './constants/constants';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children:[
      {path: 'productos', component: ProductosComponent, canActivate: [AuthGuard]},
      {path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard]},
      {path: 'clientes', component: ClienteComponent, canActivate: [AuthGuard]},
      {path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN]}}
    ]
  },
  {path: '**', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
