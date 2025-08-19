import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, map, of, } from 'rxjs';
import { UsuarioResponse } from '../models/usuario.response.model';
import { HttpClient } from '@angular/common/http';
import { UsuarioRequest } from '../models/usuario.request.model';
import { environment } from '../environments/enviroments';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl).pipe(
      map(usuarios => usuarios.sort()),
      catchError(error => {
        console.error('Error al obtener los usuarios', error);
        return of([]);
      })
    );
  }

  postUsuario(usuario: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, usuario).pipe(
      catchError(error => {
        console.error('Error al registrar el usuario', error);
        return throwError(() => error);
      })
    );
  }
  putUsuario(usuario: UsuarioRequest, usuarioId: string): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/${usuarioId}`, usuario).pipe(
      catchError(error => {
        console.error('Error al actualizar el usuario', error);
        return throwError(() => error);
      })
    );
  }

  deleteUsuario(usuarioId: string): Observable<UsuarioResponse> {
    return this.http.delete<UsuarioResponse>(`${this.apiUrl}/${usuarioId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar el usuario', error);
        return throwError(() => error);
      })
    );
  }
}
