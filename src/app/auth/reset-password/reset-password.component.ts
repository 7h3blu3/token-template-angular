import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  domain = '';
  constructor(@Inject(DOCUMENT) private document: any, public authService: AuthService,) { }

  ngOnInit(): void {
    this.domain = this.document.location.hostname;
    if(this.domain.includes("localhost")) this.domain = "http://localhost:4200/"
  }

  resetPassword(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.authService.resetPassword(form.value.email, this.domain)
  }

}
