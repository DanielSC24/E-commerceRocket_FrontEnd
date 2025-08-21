import { Component } from '@angular/core';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

 get isAdmin(): boolean {
  console.log('Verificando rol de ADMIN');
  const roles = this.authService.getRoles();
  console.log('Roles en navbar:', roles);
  return this.authService.hasRole('ROLE_ADMIN');
}
get username(): string | null {
  console.log('Obteniendo nombre de usuario');
  const user = this.authService.getUsername();
  console.log('Username en navbar:', user);
  return user;
}

  logout(): void {
    this.authService.logout();
  }

}
