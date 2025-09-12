import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignupComponent } from './signup/signup';
import { Login } from './login/login';
import { HomeComponent } from './home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,SignupComponent,Login,HomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('insurance_management_system_frontend');
}
