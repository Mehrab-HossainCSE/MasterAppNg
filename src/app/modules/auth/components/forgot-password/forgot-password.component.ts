import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  resetPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
    this.initResetPasswordForm() 
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: [
        'admin@demo.com',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
    });
  }

initResetPasswordForm() {
  this.resetPasswordForm = this.fb.group({
    UserName: [
      '', // user will input their username
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
    ],
    previousPassword: [
      '', // user will input their current password
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(128), // depending on your password policy
      ]),
    ],
    newPassword: [
      '', // user will input new password
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(128),
      ]),
    ],
    confirmNewPassword: [
      '', // optional: to confirm new password
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(128),
      ]),
    ],
  }, {
    validator: this.passwordMatchValidator // custom validator to match passwords
  });
}
passwordMatchValidator(formGroup: FormGroup) {
  const newPassword = formGroup.get('newPassword')?.value;
  const confirmNewPassword = formGroup.get('confirmNewPassword')?.value;
  return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
}

submit() {
  this.errorState = ErrorStates.NotSubmitted;

   if (this.resetPasswordForm.hasError('passwordMismatch')) {
    this.errorState = ErrorStates.HasError;
    alert('❌ New password and Confirm password do not match.');
    return;
  }
  if (this.resetPasswordForm.invalid) {
    this.resetPasswordForm.markAllAsTouched();
    this.errorState = ErrorStates.HasError;
    return;
  }

  const formValue = this.resetPasswordForm.value;
  console.log('Form Data login:', formValue);

  const resetPasswordSubscr = this.authService
    .forgotPassword(formValue)
    .pipe(first())
    .subscribe({
      next: (response:any) => {
        console.log('API Response:', response);

        // ✅ Handle API response
        if (response.succeeded && !response.hasError) {
          this.errorState = ErrorStates.NoError;

          // Show success message (use your toast/snackbar here)
          alert(response.messages?.join('\n') || 'Password updated successfully');
        } else {
          this.errorState = ErrorStates.HasError;
          alert(response.messages?.join('\n') || 'Password update failed');
        }
      },
      error: (err) => {
        this.errorState = ErrorStates.HasError;
        console.error('Error:', err);
        alert('Server error occurred while changing password.');
      },
    });

  this.unsubscribe.push(resetPasswordSubscr);
}


}
