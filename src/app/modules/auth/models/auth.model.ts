export class AuthModel {
 accessToken: string;
  refreshToken: string;
  userName: string;

  setAuth(auth: AuthModel) {
    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;
    this.userName = auth.userName;
  }
}
