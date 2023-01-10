import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

export interface tokenData{
  userId: String;
  passwordToken: String;
}

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
  token: any;
  userId: any;
  constructor(public authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token')
    this.getTokenData();
  }

  newPassword(form: NgForm) {
    if(form.invalid)  {
      return;
    } 
    let passwordData = this.newPasswordData(form);
    this.authService.postNewPassword(passwordData).subscribe(result =>{
      this.router.navigate(['/auth/login']);
      Swal.fire({
        title: "Password changed successfully.",
        icon: 'success',
        confirmButtonColor:'#3F51B5',
        allowOutsideClick: false,
      });  
    });
  }

  getTokenData() {
    this.authService.getNewPasswordTokenData(this.token).subscribe(tokenData =>{
      this.userId = tokenData.userId
    });
  }

  newPasswordData(form) {
    let newPasswordData = {};
    newPasswordData["password"] = form.value.password;
    newPasswordData["userId"] = this.userId;
    newPasswordData["passwordToken"] = this.token;

    return newPasswordData;
  }
}
