import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from './login/login.component';
import { NewPasswordComponent } from "./new-password/new-password.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'new-password/:token', component: NewPasswordComponent },
]

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class AuthRoutingModule { }