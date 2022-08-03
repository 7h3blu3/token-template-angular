import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

const BACKEND_URL = environment.apiUrl + '/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private token: any;
  private tokenTimer: any;
  private userId: any;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {
    
  }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    Swal.fire({
      title: 'Creating user with ' + email + ' address...',
      text: 'Please wait a few seconds.',
      allowOutsideClick: false,
    });
    Swal.showLoading();
    const authData: AuthData = { email: email, password: password };
    return this.http
      .post(BACKEND_URL + 'signup', authData).subscribe((response) => {
        this.router.navigate(['/auth/login']);
        Swal.fire({
          title: 'User created',
          icon: 'success',
          html: 'User <strong>' + email + '</strong> was created.',
          confirmButtonColor:'#3F51B5',
          allowOutsideClick: false,
        });  
      }, error => {
        this.authStatusListener.next(false)
        this.errorMessageAlert(error);
      });
  }

  login(email: string, password: string) {
    Swal.fire({
      title: 'Logging... ',
      text: 'Please wait a few seconds.',
      allowOutsideClick: false,
    });
    Swal.showLoading();
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string, expiresIn: number, userId:string }>(BACKEND_URL + 'login', authData)
      .subscribe((response) => {
        console.log("token response ", response)
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration)
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.userId)
          this.router.navigate(['/']);
        }
        Swal.fire({
          title: 'Welcome!',
          icon: 'success',
          confirmButtonColor:'#3F51B5',
          allowOutsideClick: false,
        });  
      }, error => {
        this.authStatusListener.next(false)
        this.errorMessageAlert(error);
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
        return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
        this.token = authInformation.token;
        this.isAuthenticated = true;
        this.userId = authInformation.userId;
        this.setAuthTimer(expiresIn / 1000)
        this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/auth/login']);
  }

  private setAuthTimer(duration: number) {
    console.log("setting timer: " + duration)
    this.tokenTimer = setTimeout(() => {
        this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString())
    localStorage.setItem("userId", userId)
  }

  private clearAuthData() {
    localStorage.removeItem("token")
    localStorage.removeItem("expiration")
    localStorage.removeItem("userId")
  }

  private getAuthData() {
      const token = localStorage.getItem("token");
      const expirationDate = localStorage.getItem("expiration");
      const userId = localStorage.getItem("userId")
      if (!token || !expirationDate) {
        return;
      }
      return {
          token: token,
          expirationDate: new Date(expirationDate),
          userId: userId
      }
  }

  errorMessageAlert(error) {
    Swal.fire({
      title: 'An error has occurred',
      icon: 'error',
      html: 'Error message: <strong>' + error.error.message + '</strong>',
      confirmButtonColor:'#3F51B5',
      allowOutsideClick: false,
    });  
  }

}