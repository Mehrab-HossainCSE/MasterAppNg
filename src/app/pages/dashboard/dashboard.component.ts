import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { App, AppResponse } from 'src/app/modules/Project/Models/AppResponse';
import { CloudPosService } from 'src/app/modules/Project/Services/cloud-pos.service';
import { Project } from 'src/app/modules/Project/Models/Project';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;
  windowObj: any = window;
  fileUrl = this.windowObj.__env.fileUrl;
  @ViewChild('noticeSwal') noticeSwal!: SwalComponent;
  username: string = 'admin';
  password: string = '1';
  projectForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  isOpenAction: number | null = null;
  swalOptions: SweetAlertOptions = {};

  apps: App[] = [];

  spin: boolean;
  isForDeleteId: number;
  constructor(
    private readonly router: Router,
    private readonly cloudPosService: CloudPosService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly modalService: NgbModal,
    private _alertType: AlertTypeService
  ) {}
  openApp(app: any) {
      debugger;
    this.router.navigate([app.navigateUrl]);
  if(app.loginUrl)  {
    window.open(
      app.loginUrl,
      '_blank'
    );
  }
  }


  ngOnInit(): void {
    this.getProjects();
    this.initProjectForm();
  }

  toggleDropdown(index: number, event: Event): void {
    event.stopPropagation();
    if (this.isOpenAction === index) {
      this.isOpenAction = null;
    } else {
      this.isOpenAction = index;
    }
  }

  closeDropdown(): void {
    this.isOpenAction = null;
  }
  private initProjectForm(): void {
    this.projectForm = this.fb.group({
      Title: ['', Validators.required],
      NavigateUrl: ['', [Validators.required]],
      LoginUrl: ['', [Validators.required]],
      LogoFile: [null, Validators.required],
      Password: ['', ],
      UserName: ['', ],
      IsActive: [true],
    });
  }

  getProjects() {
    this.spin = true;
    const data = localStorage.getItem('masterAppMenuList');
    this.apps = data ? JSON.parse(data) : [];
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.projectForm.patchValue({
        LogoFile: file,
      });
    }
  }
  onImageError(event: any) {
    event.target.src = 'assets/media/svg/files/blank-image.svg';
  }

  getFullImageUrl(relativePath: string): string {
    const baseUrl = 'http://localhost:5294'; // your backend url
    return relativePath
      ? baseUrl + relativePath
      : 'assets/media/svg/files/blank-image.svg';
  }
  createOrEditModalPopUp(template: any, data?: Project) {
    this.projectForm.reset({ IsActive: true });
    this.isEditMode = false;
    this.modalService.open(template, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }
  editApp(app: App, modalTemplate: any) {
    debugger;
    this.isEditMode = true;
    this.projectForm.patchValue({
      Title: app.title,
      NavigateUrl: app.navigateUrl,
      LoginUrl: app.loginUrl,
      LogoFile: app.loginUrl,
      UserName: app.userName,
      Password: app.password,
      IsActive: app.isActive,
    });

    (this.projectForm as any).editingId = app.id;

    this.modalService.open(modalTemplate, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }
  deleteApp(id: number) {
    debugger;
    this.isForDeleteId = id;

    this.deleteSwal.fire().then((clicked) => {
      if (clicked.isConfirmed) {
        // Call the actual delete method here
        this.triggerDelete();
      }
    });
  }

  triggerDelete() {
    this.cloudPosService.deleteProject(this.isForDeleteId).subscribe(
      (data) => {
        if (data?.success === true) {
          this.apps = this.apps.filter((app) => app.id !== this.isForDeleteId);
          this.swalOptions.title = 'Success!';

          this.swalOptions.text = data?.Messages?.[0] || 'Delete successful';
          this.swalOptions.icon = 'success';
          this.showAlert(this.swalOptions);
        } else if (data.Warninged) {
          this.swalOptions.title = 'Warning!';
          this.swalOptions.text =
            data.Messages[0] || 'BranchID associate with employee';
          this.swalOptions.icon = 'warning';
          this.showAlert(this.swalOptions);
        } else {
          this.swalOptions.title = 'Error!';
          this.swalOptions.text = data.Messages[0] || 'Delete failed';
          this.swalOptions.icon = 'error';
          this.showAlert(this.swalOptions);
        }
      },
      (err) => {
        console.log(err);
        this.showAlert(this._alertType.errorAlert);
      }
    );
  }

  onSubmit(): void {
    debugger;
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit = !!(this.projectForm as any).editingId;
    const formData = new FormData();

    if (isEdit) {
      const editingId = (this.projectForm as any).editingId;
      formData.append('Id', editingId);
    }

    formData.append('Title', this.projectForm.get('Title')?.value);
    formData.append('NavigateUrl', this.projectForm.get('NavigateUrl')?.value);
    formData.append('IsActive', this.projectForm.get('IsActive')?.value);
    formData.append('LoginUrl', this.projectForm.get('LoginUrl')?.value);
    formData.append('UserName', this.projectForm.get('UserName')?.value);
    formData.append('Password', this.projectForm.get('Password')?.value);
    const logoFile = this.projectForm.get('LogoFile')?.value;
    if (logoFile) {
      formData.append('LogoFile', logoFile);
    }

    const request = isEdit
      ? this.cloudPosService.updateProject(formData)
      : this.cloudPosService.createProject(formData);
    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.success === true;

        if (isSuccess) {
          if (isEdit) {
            const index = this.apps.findIndex((a) => a.id === res?.Data?.Id);
            if (index > -1 && res?.Data) {
              this.apps[index] = { ...this.apps[index], ...res.Data };
            }
            debugger;
            this.swalOptions.title = 'Success!';
            this.swalOptions.text =
              res?.Messages?.[0] ?? 'Project updated successfully.';
            this.swalOptions.icon = 'success';
            this.getProjects();
          } else {
            if (res?.Data) {
              this.apps.push(res.Data);
            }

            this.swalOptions.title = 'Created!';
            this.swalOptions.text =
              res?.Messages?.[0] ?? 'Project created successfully.';
            this.swalOptions.icon = 'success';
            this.getProjects();
          }
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.Messages?.[0] ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.projectForm.reset({ IsActive: true });
      },
      error: (err) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text = 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
  }
  showAlert(swalOptions: SweetAlertOptions) {
    debugger;
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
