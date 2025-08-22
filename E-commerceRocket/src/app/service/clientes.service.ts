import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/enviroments';
import { Observable, throwError, catchError, map, of } from 'rxjs';
import { ClienteRequest } from '../models/cliente.request.model';
import { ClienteResponse } from '../models/cliente.response.model';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
 private clienteUrl: string = environment.clientes;

  constructor(private http: HttpClient) { }

  getClientes(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(this.clienteUrl);
  }
  getClienteById(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.clienteUrl}/${id}`);
  }
  postCliente(cliente: ClienteRequest): Observable<ClienteResponse>{
    return this.http.post<ClienteResponse>(this.clienteUrl, cliente).pipe(
      catchError(error =>{
        console.error('Error :', error);
        return throwError(error);
      })
    );

  }
  putCliente(cliente: ClienteRequest, ClienteId: number): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.clienteUrl}/${ClienteId}`, cliente).pipe(
      catchError(error => {
        console.error('Error al actualizar cliente', error);
        return throwError(() => error);
      })
    ); 
  }
  deleteCliente(clienteId: number): Observable<ClienteResponse> {
    return this.http.delete<ClienteResponse>(`${this.clienteUrl}/${clienteId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar cliente', error);
        return throwError(() => error);
      })
    );
  }

}
