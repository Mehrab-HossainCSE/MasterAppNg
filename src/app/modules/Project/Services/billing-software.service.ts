import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { App } from '../Models/AppResponse';

@Injectable({
  providedIn: 'root'
})
export class BillingSoftwareService {
  onCollegeCreated: Subject<any> = new Subject<any>();

  constructor(private readonly httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly baseUrl = environment.apiUrl;

 
createRole(project: any): Observable<any> {
  return this.httpClient.post(
    `${this.baseUrl}/BillingSoftware/CreateRole`,
    project,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}


  createNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/CreateNav`,
      project
    );
  }
    assignedUserMenus(UserDto: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/AssignUserMenu`,
      UserDto
    );
  }
assignMenu(ID:any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetRoleWiseMenuCloudPosDBKMART`,
      ID
    );
  }
  GetParentNav(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetParentNav`,
      {}
    );
  }
   getRole(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetRoles`,
      {}
    );
  }
  updateNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/UpdateNav`,
      project
    );
  }
    updateRole(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/updateRole`,
      project
    );
  }
   updateRolePerUser(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/updateRolePerUser`,
      project
    );
  }
 
  getAllNav(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetNav`,
      {}
    );
  }
   getAllUser(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetAllUser`,
      {}
    );
  }
  getAllPrivilege(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/GetAllRole`,
      {}
    );
  }
 getCompanyInfo(): Observable<App> {
  return this.httpClient
    .get<App>(`${this.baseUrl}/BillingSoftware/getCompanyInfo`)
    .pipe(catchError(this.handleError));
}

  updateCheckedNavItems(checkedMenus: any[]): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/BillingSoftware/UpdateDatabaseNav`,
      checkedMenus
    );
  }
getRoleByRoleID(roleId: number) {
  return this.httpClient
        .get<any[]>(`${this.baseUrl}/BillingSoftware/RoleWiseMenu?RoleId=${roleId}`)
        .pipe(
          catchError(this.handleError)
        );
}
  getNavs() {
    return this.httpClient
      .get<any>(`${this.baseUrl}Navs/GetAll`, {})
      .pipe(map((response: any) => response));
  }

  updateNavs(data: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}navs/Update`, data);
  }
  addRole(dto: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/BillingSoftware/RoleCreateCloudPosDBKMART`, dto);
 
  }
  menuOnSubmit(dto: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/BillingSoftware/UpdateMenuIdToTheRoleCloudPosDBKMART`, dto);
 
  }
  delete(MenuId: number): Observable<any> {
    return this.httpClient
      .delete<void>(this.baseUrl + 'navs/Delete?MenuId=' + MenuId)
      .pipe(map((response: any) => response));
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Client Side Error: ', errorResponse.error);
    } else {
      console.error('Server Side error', errorResponse);
    }
    return throwError('There is a problem with the service');
  }
}
