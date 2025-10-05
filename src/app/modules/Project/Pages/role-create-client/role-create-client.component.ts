import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { SorolSoftService } from '../../Services/sorol-soft.service';
import { SweetAlertOptions } from 'sweetalert2';
import { RoleCreateClientService } from '../../Services/role-create-client.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-role-create-client',
  templateUrl: './role-create-client.component.html',
  styleUrl: './role-create-client.component.scss',
})
export class RoleCreateClientComponent implements OnInit {
  navListCloudPos: any[] = [];
  navListSorolSoft: any[] = [];
  getAllRole: any[] = [];
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  activeTab = '';
  newRoleName = '';
  isSubmitting: boolean;
  constructor(
    private readonly cloudPosService: CloudPosService,
    private readonly sorolSoftwareServie: SorolSoftService,
    private readonly cdr: ChangeDetectorRef,
    private readonly roleCreateClientService: RoleCreateClientService
  ) {}

  ngOnInit(): void {
    debugger;
    this.getAllRoles();

    // Get project list from local storage
    const projects = localStorage.getItem('masterAppMenuList');

    if (projects) {
      const projectArray = JSON.parse(projects);

      // Ensure we have a valid array
      if (Array.isArray(projectArray) && projectArray.length > 0) {
        // Loop through all projects
        for (const project of projectArray) {
          if (project.id === 1) {
            this.getNavListCloudPos();
          } else if (project.id === 2) {
            this.getNavListSorolSoft();
          }
        }
      }
    }
  }

  getNavListCloudPos() {
    this.cloudPosService.getAllNav().subscribe({
      next: (data: any) => {
        this.navListCloudPos = data;
        console.log('Navigation list loaded:', this.navListCloudPos);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }

  getNavListSorolSoft() {
    this.sorolSoftwareServie.getAllNav().subscribe({
      next: (data: any) => {
        this.navListSorolSoft = data;
        console.log('Navigation list loaded:', this.navListSorolSoft);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  onProjectChange() {
    //console.log('Selected Project:', this.selectedProject);
  }

  getAllRoles(): void {
    this.roleCreateClientService.getAllRoles().subscribe({
      next: (res) => {
        this.getAllRole = res ?? [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      },
    });
  }

  addRole() {
    if (!this.newRoleName.trim()) {
      this.showAlert({
        title: 'Error',
        text: 'Please enter a role name before adding.',
        icon: 'warning',
      });
      return;
    }

    this.isSubmitting = true;

    const payload = {
      roleName: this.newRoleName,
      description: 'Created from UI',
    };
    const request = this.roleCreateClientService.createRoleMaster(payload);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.succeeded === true; // note: backend uses `Succeeded`

        if (isSuccess) {
          this.swalOptions.title = 'Updated!';
          this.swalOptions.text =
            res?.messages?.[0] ?? 'Role updated successfully.';
          this.swalOptions.icon = 'success';
          this.getAllRoles();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.messages?.[0] ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
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
