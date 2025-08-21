import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private autUrl: string = environment.authUrl;
  private tokenKey = 'auth-token';
  private payload: any | null = null; // Para cachear el payload

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  login(username: string, password: string){
    return this.http.post<{token: string}>(this.autUrl, {username, password}).pipe(
      tap(response =>{
        //localStorage.setItem(this.tokenKey, response.token);
        this.setToken(response.token);
      })
    );
  }

  isLoggedIn(): boolean{
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  isTokenExpired(): boolean{
    const token = this.getToken();
    if(!token) return true;

    try{
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now()/1000);
      return payload.exp < now;
    }catch(e){
      return true;
    }
  }

  getToken(): string | null{
    if(isPlatformBrowser(this.platformId)){
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setToken(token:string): void{
    if(isPlatformBrowser(this.platformId)){
      localStorage.setItem(this.tokenKey, token);
      this.payload = null; // Forzar recarga del payload en el próximo getRoles
    }
  }

  logout(): void{
    if(isPlatformBrowser(this.platformId)){
      localStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated():boolean{
    return !!this.getToken();
  }

  // ---------- NUEVAS FUNCIONES PARA ROLES ----------

  private decodeToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        this.payload = JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        this.payload = null;
      }
    } else {
      this.payload = null;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || null;
    } catch (e) {
        console.error('Error leyendo username del token', e);
        return null;
    }
}

  getRoles(): string[] {
    if (!this.payload) this.decodeToken();
    return this.payload?.roles || [];
  }

get isAdmin(): boolean {
  const roles = this.getRoles();
  console.log('Roles en navbar:', roles);
  return this.hasRole('ROLE_ADMIN');
}

hasRole(role: string): boolean {
  return this.getRoles().includes(role);
}

  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.getRoles().includes(r));
  }

}
