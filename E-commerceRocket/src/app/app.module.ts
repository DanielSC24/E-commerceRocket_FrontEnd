import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { ClienteComponent } from './componentes/cliente/cliente.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { LoginComponent } from './componentes/login/login.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { PedidosComponent } from './componentes/pedidos/pedidos.component';
import { NavbarComponent } from './componentes/common/navbar/navbar.component';
import { FooterComponent } from './componentes/common/footer/footer.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './shared/auth.interceptor';
import { ErrorInterceptor } from './shared/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
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
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi:true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi:true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
