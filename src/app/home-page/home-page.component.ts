import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {
  userId: string;
  userIsAuthenticated = false;
  private authStatusSub: Subscription;
  constructor( private authService: AuthService) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        console.log("isAuthenticated ", isAuthenticated)
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
        console.log("userIsAuthenticated ", this.userIsAuthenticated)
        console.log("userId ", this.userId)

      });
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
