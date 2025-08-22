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

  /** Listar pedidos */
  getPedido(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.apiUrl).pipe(
      map(pedidos => pedidos.sort((a, b) => a.id - b.id)), // ordenar por id
      catchError(error => {
        console.error('Error al obtener los pedidos', error);
        return of([]);
      })
    );
  }

  /** Crear nuevo pedido */
  postPedido(pedido: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.apiUrl, pedido).pipe(
      catchError(error => {
        console.error('Error al registrar el pedido', error);
        return throwError(() => error);
      })
    );
  }

  /** Actualizar pedido completo (solo para admin si es necesario) */
  putPedido(pedido: PedidoRequest, pedidoId: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.apiUrl}${pedidoId}`, pedido).pipe(
      catchError(error => {
        console.error('Error al actualizar el pedido', error);
        return throwError(() => error);
      })
    );
  }

  /** Actualizar solo el estado (PATCH) */
  patchPedido(pedidoId: number, patchData: Partial<{ estado: string }>): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}${pedidoId}`, patchData).pipe(
      catchError(error => {
        console.error('Error al actualizar el estado del pedido', error);
        return throwError(() => error);
      })
    );
  }

  /** Eliminación lógica: cambiar estado a CANCELADO */
  cancelPedido(pedidoId: number): Observable<PedidoResponse> {
    return this.patchPedido(pedidoId, { estado: 'CANCELADO' });
  }

}
