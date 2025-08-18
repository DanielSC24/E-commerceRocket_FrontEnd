import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentesComponent } from './componentes/componentes.component';
import { EnvironmentsComponent } from './environments/environments.component';
import { GuardsComponent } from './guards/guards.component';
import { ModelsComponent } from './models/models.component';
import { SharedComponent } from './shared/shared.component';
import { ServiceComponent } from './service/service.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { ClienteComponent } from './componentes/cliente/cliente.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { LoginComponent } from './componentes/login/login.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { PedidosComponent } from './componentes/pedidos/pedidos.component';
import { NavbarComponent } from './componentes/common/navbar/navbar.component';
import { FooterComponent } from './componentes/common/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    ComponentesComponent,
    EnvironmentsComponent,
    GuardsComponent,
    ModelsComponent,
    SharedComponent,
    ServiceComponent,
    UsuariosComponent,
    ClienteComponent,
    ProductosComponent,
    LoginComponent,
    DashboardComponent,
    PedidosComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
