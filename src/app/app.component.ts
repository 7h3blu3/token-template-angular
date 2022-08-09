import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '01.Token-Template-Project-Angular';

  constructor(private authService: AuthService) {}
  
  ngOnInit() {
     //This is needed so we do not lose our authentication on refresh
    this.authService.autoAuthUser();
  }
}
