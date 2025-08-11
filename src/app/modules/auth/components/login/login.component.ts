import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:
  defaultAuth: any = {
    email: 'systemuser@gmail.com',
    password: '...',
  };
  //uiVersion = environment.version;

  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  private authLocalStorageToken = `currentTailoringUser`;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    //private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      UserName: [this.defaultAuth.email],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  getMenu() {
    
        this.router.navigate([this.returnUrl]);
      
     
  }



  submit() {
    this.hasError = false;
    const loginSubscr = this.authService
      .login(this.f.UserName.value, this.f.password.value)
      .subscribe(
        (user: any | undefined) => {
          if (user && user.UserId != '') {
            console.log(user);
            const result = this.setAuthFromLocalStorage(user);
              this.getMenu();
          }
        },
        (err) => {
          console.log(err);
          this.hasError = true;
          this.errorMessage = err.error;
        }
      );
    this.unsubscribe.push(loginSubscr);
  }

  private setAuthFromLocalStorage(auth: any): boolean {
    if (auth && auth.AccessToken) {
      debugger;
      localStorage.setItem('company', JSON.stringify(auth.CompanyInfoDtos));
      // Store AccessToken, RefreshToken, BranchId, and BranchName in local storage
      localStorage.setItem(
        this.authLocalStorageToken,
        JSON.stringify({
          AccessToken: auth.AccessToken,
          RefreshToken: auth.RefreshToken,
          UserId: auth.UserId,
          EmployeeName: auth.EmployeeName,
          BranchId: auth.BranchId,
          BranchName: auth.BranchName,
        })
      );
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}