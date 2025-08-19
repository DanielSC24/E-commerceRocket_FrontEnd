import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ProductosComponent } from './componentes/productos/productos.component';
import { PedidosComponent } from './componentes/pedidos/pedidos.component';
import { ClienteComponent } from './componentes/cliente/cliente.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent,
    children:[
      {path: 'productos', component: ProductosComponent},
      {path: 'pedidos', component: PedidosComponent},
      {path: 'clientes', component: ClienteComponent},
      {path: 'usuarios', component: UsuariosComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
