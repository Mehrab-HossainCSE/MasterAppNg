import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { UserCreateService } from '../../Services/user-create.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
})
export class UserCreateComponent implements OnInit {
  userForm!: FormGroup;
  isSubmitting = false;

  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;

  @ViewChild('rolesSelect') rolesSelect!: NgSelectComponent;

  swalOptions: SweetAlertOptions = {};

  constructor(
    private fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly userService: UserCreateService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      MenuList: [[], Validators.required],
      projectJsonDtos: [[], Validators.required],
    });

    this.userForm.patchValue({
      MenuList: [
        'title:UserCreate,navigateUrl:project/UserCreate',
        'title:RoleCreate,navigateUrl:project/RoleCreate',
      ],
    });
  }

  processSubmit(): void {
    debugger;
    //this.userForm.markAllAsTouched();
    const menuListArray = this.userForm.get('MenuList')?.value;

    if (Array.isArray(menuListArray)) {
      this.userForm.get('MenuList')?.setValue(menuListArray.join(',')); // convert only once
    }

    const selectedProjects = localStorage.getItem('selectedProjects');
    this.userForm
      .get('projectJsonDtos')
      ?.setValue(selectedProjects ? JSON.parse(selectedProjects) : []);

    if (this.userForm.valid) {
      this.isSubmitting = true;
      this.userService.createUser(this.userForm.value).subscribe({
        next: (res) => {
          const isSuccess = res?.succeeded === true;
          this.swalOptions.title = isSuccess ? 'Success!' : 'Error';
          this.swalOptions.text = isSuccess
            ? res?.data ?? 'User created successfully.'
            : res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = isSuccess ? 'success' : 'error';
          this.isSubmitting = false;

          if (isSuccess) {
            this.userForm.reset();
            localStorage.removeItem('selectedProjects');
          }

          this.showAlert(this.swalOptions);
        },
        error: (error) => {
          this.swalOptions.title = 'Error';
          this.swalOptions.text =
            error?.error?.message || 'Server error occurred. Please try again.';
          this.swalOptions.icon = 'error';
          2010;

          this.isSubmitting = false;
          this.showAlert(this.swalOptions);
        },
      });
    } else {
      this.swalOptions.title = 'Validation Error';
      this.swalOptions.text = 'Please fill all required fields correctly.';
      this.swalOptions.icon = 'warning';
      this.showAlert(this.swalOptions);
    }
  }

  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    } else if (swalOptions.icon === 'warning') {
      style = 'warning';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }
}
