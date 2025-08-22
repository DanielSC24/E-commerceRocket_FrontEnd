import { Injectable } from '@angular/core';
import { environment } from '../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { PedidoResponse } from '../models/pedido.response.model';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { PedidoRequest } from '../models/pedido.request.model';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private apiUrl: string = environment.apiUrl + '/pedidos/';

  constructor(private http: HttpClient) { }

  getPedido(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.apiUrl).pipe(
      map(pedidos => pedidos.sort()),
      catchError(error => {
        console.error('Error al obtener los productos', error);
        return of([]);
      })
    );
  }

  postPedido(pedido: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.apiUrl, pedido).pipe(
      catchError(error => {
        console.error('Error al registrar el producto', error);
        return throwError(() => error);
      })
    );
  }

  putPedido(pedido: PedidoRequest, pedidoId: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.apiUrl}${pedidoId}`, pedido).pipe(
      catchError(error => {
        console.error('Error al actualizar el producto', error);
        return throwError(() => error);
      })
    );
  }

  deletePedido(pedidoId: number): Observable<PedidoResponse> {
    return this.http.delete<PedidoResponse>(`${this.apiUrl}${pedidoId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar el producto', error);
        return throwError(() => error);
      })
    );
  }

}
