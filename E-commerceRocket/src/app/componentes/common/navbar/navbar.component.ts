import { Component } from '@angular/core';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private authService: AuthService) { }

  ngOnInit(): void { }

  get isAdmin(): boolean {
    const roles = this.authService.getRoles();
    return this.authService.hasRole('ROLE_ADMIN');
  }
  get username(): string | null {
    const user = this.authService.getUsername();
    return user;
  }

  logout(): void {
    this.authService.logout();
  }

}
