import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { LoginResponseModel } from '../models/LoginResponse.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpHeaders ,HttpClient} from '@angular/common/http';
export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `currentTailoringUser`;
  jwtHelper = new JwtHelperService();
  // public fields
  currentUser$: Observable<any>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<any>;
  isLoadingSubject: BehaviorSubject<boolean>;
  private jWToken = 'JWToken';
  private refToken = 'RefreshToken';

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: any) {
    this.currentUserSubject.next(user);
  }
  windowObj: any = window;
  baseUrl = this.windowObj.__env.apiUrl;
  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
 
    
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<any>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
     const auth = this.getAuthFromLocalStorage();
  if (auth?.accessToken && !this.jwtHelper.isTokenExpired(auth.accessToken)) {
    this.currentUserSubject.next(auth);
  }
  }

  // login(email: string, password: string) {
  //   var loginInfo = {
  //     AppId:"WEBAPP",
  //     DeviceToken: "null",
  //     Email:email,
  //     Password:password
  //   }
  //   return this.http.post<AuthModel>(`${API_USERS_URL}Login/Authenticate`, loginInfo);
  // }
  login(UserName: string, password: string): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(UserName, password).pipe(
      map((auth: any) => {
        this.currentUserSubject.next(auth);
        const result = this.setAuthFromLocalStorage(auth);
        
        return auth;
      }),

      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  loggedIn() {
    const user = localStorage.getItem(this.authLocalStorageToken);
    if (!user) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(JSON.parse(user)?.AccessToken);
  }

  public getSession(): boolean {
    return this.loggedIn();
  }

  getUser(): Observable<any> {
    return this.currentUserSubject.pipe(
      map((user: any) => {
        if (user) {
          // this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        console.log(user);

        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  

  // public methods
  // login(email: string, password: string): Observable<UserType> {
  //   this.isLoadingSubject.next(true);
  //   return this.authHttpService.login(email, password).pipe(
  //     map((auth: AuthModel) => {
  //       const result = this.setAuthFromLocalStorage(auth);
  //       return result;
  //     }),
  //     switchMap(() => this.getUserByToken()),
  //     catchError((err) => {
  //       console.error('err', err);
  //       return of(undefined);
  //     }),
  //     finalize(() => this.isLoadingSubject.next(false))
  //   );
  // }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.accessToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.accessToken).pipe(
      map((user: UserType) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(user.email, user.password)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.accessToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  // refreshToken(): Observable<any> {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //     }),
  //   };
  //   // ;
  //   var users = {
  //     RefreshToken: localStorage.getItem(this.refToken),
  //     AccessToken: localStorage.getItem(this.jWToken),
  //   };
  //   return this.http.post<any>(
  //     this.baseUrl + 'Login/RefreshToken',
  //     users,
  //     httpOptions
  //   );
    
  // }
  private saveToken(token: string, refreshToken: string): void {
    localStorage.setItem(this.jWToken, token);
    localStorage.setItem(this.refToken, refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.jWToken);
  }

  
  logout() {
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
    localStorage.removeItem('currentTailoringUser');

    // this.http.get<any>(API_USERS_URL + "Login/Revoke").subscribe((result) => {
    //   setTimeout(() => {
    //     this._toastrService.success("You have successfully Logout", "", {
    //       toastClass: "toast ngx-toastr",
    //       closeButton: true,
    //     });
    //   }, 1000);
    //   localStorage.removeItem("currentUser");
    //   localStorage.removeItem("JWToken");
    //   localStorage.removeItem("RefreshToken");

    //   this.currentUserSubject.next(null);
    // });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}

