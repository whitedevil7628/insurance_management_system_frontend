import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Signup } from './signup/signup';
import { Login } from './login/login';
import { HomeComponent } from './home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Signup,Login,HomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('insurance_management_system_frontend');
}
