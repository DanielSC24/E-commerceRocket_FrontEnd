

import { Injectable } from '@angular/core';
import { environment } from '../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { ProductoResponse } from '../models/producto.response.model';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ProductoRequest } from '../models/producto.request.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl: string = environment.apiUrl + '/productos/';

  constructor(private http: HttpClient) { }

  descontarStock(productoId: number, cantidad: number): Observable<ProductoResponse> {
    return this.http.patch<ProductoResponse>(`${this.apiUrl}${productoId}/descontar-stock`, { cantidad }).pipe(
      catchError(error => {
        console.error('Error al descontar stock', error);
        return throwError(() => error);
      })
    );
  }

  getProductos(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.apiUrl).pipe(
      map(productos => productos.sort()),
      catchError(error => {
        console.error('Error al obtener los productos', error);
        return of([]);
      })
    );
  }

  postProducto(producto: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.apiUrl, producto).pipe(
      catchError(error => {
        console.error('Error al registrar el producto', error);
        return throwError(() => error);
      })
    );
  }

  putProducto(producto: ProductoRequest, productoId: number): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.apiUrl}${productoId}`, producto).pipe(
      catchError(error => {
        console.error('Error al actualizar el producto', error);
        return throwError(() => error);
      })
    );
  }

  deleteProducto(productoId: number): Observable<ProductoResponse> {
    return this.http.delete<ProductoResponse>(`${this.apiUrl}${productoId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar el producto', error);
        return throwError(() => error);
      })
    );
  }

}
