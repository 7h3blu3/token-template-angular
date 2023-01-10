import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { throwError as observableThrowError, Observable, Subject } from "rxjs";
import { map, catchError } from "rxjs/operators";

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
  private alertsKeyword: string;

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
    this.alertsKeyword = 'signup';
    this.loadingAlert(this.alertsKeyword, email)
    const authData: AuthData = { email: email, password: password };
    return this.http
      .post(BACKEND_URL + 'signup', authData).subscribe((response) => {
        this.router.navigate(['/auth/login']);
        this.successAlert(this.alertsKeyword, email);
      }, error => {
        this.authStatusListener.next(false)
        this.errorMessageAlert(error);
      });
  }

  login(email: string, password: string) {
    this.alertsKeyword = 'login';
    this.loadingAlert(this.alertsKeyword, email)
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string, expiresIn: number, userId:string }>(BACKEND_URL + 'login', authData)
      .subscribe((response) => {
        console.log("token response ", response)
        const token = response.token;
        this.token = token;
        console.log("token ", this.token)
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
        this.successAlert(this.alertsKeyword, email);
      }, error => {
        this.authStatusListener.next(false)
        this.errorMessageAlert(error);
      });
  }

  resetPassword(email, domain){
    let data = {
      env:domain,
      email: email
    }
    return this.http
    .post(BACKEND_URL + 'reset-password', data).subscribe((response) => {
      this.router.navigate(['/auth/login']);
      Swal.fire({
        title: "Email sent successfully.",
        html:"Please check the mailbox of <strong>" + email +"</strong>.",
        icon: 'success',
        confirmButtonColor:'#3F51B5',
        allowOutsideClick: false,
      }); 
    }, error => {
      this.errorMessageAlert(error);
    });
  }
  
  getNewPasswordTokenData(token): Observable<any> {
    return this.http.get(environment.apiUrl +"/new-password/"+ token).pipe(map(res => { return res }))
  }

  postNewPassword(data): Observable<any> {
    return this.http.post<any>(environment.apiUrl + '/new-password', data).pipe(map(res => {return res}),catchError(err => this.handleError(err)))
}
  
   //This is needed so we do not lose our authentication on refresh
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
        this.sessionExpiredAlert();
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
      title: 'An error has occurred.',
      icon: 'error',
      html: '<strong>' + error.error.message + '</strong>',
      confirmButtonColor:'#3F51B5',
      allowOutsideClick: false,
    });  
  }

  loadingAlert(alertsKeyword, email) {
    let title, text;
    if(alertsKeyword === 'login') {
      title = 'Logging... ';
      text = 'Please wait a few seconds.'
    } else if (alertsKeyword === 'signup') { 
      title = 'Creating user with ' + email + ' address...';
      text = 'Please wait a few seconds.'
    };
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
    });
    Swal.showLoading();

  }

  sessionExpiredAlert() {
    Swal.fire({
      title: "Your session has expired",
      icon: 'info',
      html: "Please log in again to continue",
      confirmButtonColor:'#3F51B5',
      allowOutsideClick: false,
    });  
  }

  successAlert(alertsKeyword, email) {
    let title, html;
    if(alertsKeyword === 'login') {
      title = 'Welcome!';
      html = '';
    } else if (alertsKeyword === 'signup') {
      title = 'User created';
      html = 'User <strong>' + email + '</strong> was created.';
    }
    Swal.fire({
      title: title,
      icon: 'success',
      confirmButtonColor:'#3F51B5',
      allowOutsideClick: false,
    });  
    Swal.fire({
      title: title,
      icon: 'success',
      html: html,
      confirmButtonColor:'#3F51B5',
      allowOutsideClick: false,
    });  
  }
  public handleError(error: Response | any) {
    let errMsg = error.error.message
    console.log("error ", error)
    Swal.fire({
      title:"There was an error.",
      icon: 'error',
      text:  errMsg,
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonColor: 'blue'
    })
    this.router.navigate(['/auth/login']);

    return observableThrowError(errMsg);
  }

}