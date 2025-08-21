import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import { AuthService } from "../service/auth.service";
import Swal from "sweetalert2";


@Injectable({ providedIn: 'root'})
export class AuthGuard implements CanActivate{
  constructor(private authService: AuthService, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state:RouterStateSnapshot): boolean {
 if(!this.authService.isLoggedIn()){
  this.router.navigate(['/login']);
  return false;
}
  
 


  const expectedRoles: string[] = route.data['roles'];
  if(expectedRoles && !this.authService.hasAnyRole(expectedRoles)){
    Swal.fire('Acceso denegado',
      `Hola ${this.authService.getUsername()} no tienes permisos para acceder a esta sección`, 'warning');

    return false;
  }
  return true;
}}
