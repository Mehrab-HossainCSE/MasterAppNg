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
  navListBilling: any[] = [];
  projectArray: any[] = [];
  selectedRoleId: number | null = null;
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
      this.projectArray = JSON.parse(projects);

      // Ensure we have a valid array
      if (Array.isArray(this.projectArray) && this.projectArray.length > 0) {
        // Loop through all projects
        for (const project of this.projectArray) {
          if (project.id === 1) {
            this.getNavListCloudPos();
          } else if (project.id === 6) {
            this.getNavListSorolSoft();
          } else if (project.id === 4) {
            this.getNavListBillingSoft();
          }
        }
      }
    }
  }
  onParentChangeCloudPos(parent: any, event: any): void {
    parent.isChecked = event.target.checked;

    // 🔹 Set all children same as parent
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach(
        (child: any) => (child.isChecked = parent.isChecked)
      );
    }
  }

  onChildChangeCloudPos(parent: any, child: any, event: any): void {
    child.isChecked = event.target.checked;

    // 🔹 If any child checked → parent checked
    if (parent.children.some((c: any) => c.isChecked)) {
      parent.isChecked = true;
    } else {
      // 🔹 If all children unchecked → parent unchecked
      parent.isChecked = false;
    }
  }
  onParentChangeBilling(parent: any, event: any): void {
    parent.isChecked = event.target.checked;

    // 🔹 When parent checked/unchecked → apply same to all children
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach(
        (child: any) => (child.isChecked = parent.isChecked)
      );
    }
  }

  onChildChangeBilling(parent: any, child: any, event: any): void {
    child.isChecked = event.target.checked;

    // 🔹 If any child is checked → parent must be checked
    if (parent.children.some((c: any) => c.isChecked)) {
      parent.isChecked = true;
    } else {
      // 🔹 If all children unchecked → uncheck parent
      parent.isChecked = false;
    }
  }

  onParentChange(parent: any): void {
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child: any) => {
        child.isChecked = parent.isChecked;
      });
    }
  }

  onChildChange(parent: any): void {
    if (!parent.children || parent.children.length === 0) return;

    const allChecked = parent.children.every((c: any) => c.isChecked);
    const anyChecked = parent.children.some((c: any) => c.isChecked);

    // Parent checked if all or any child checked (you can adjust behavior)
    parent.isChecked = anyChecked;

    // Optional: if you only want parent checked when ALL children are checked, use:
    // parent.isChecked = allChecked;
  }

  getNavListBillingSoft() {
    this.roleCreateClientService.getAllNav().subscribe({
      next: (data: any) => {
        this.navListBilling = data;
        console.log('Navigation list loaded:', this.navListBilling);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
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
  onTabChange(tabId: string): void {
    this.activeTab = tabId;
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

  // 🔹 Collect checked menu IDs recursively
  getCheckedMenuIdsCloudPos(menuList: any[]): number[] {
    let ids: number[] = [];
    for (let item of menuList) {
      if (item.isChecked) ids.push(item.serial);
      if (item.children?.length > 0) {
        ids = ids.concat(this.getCheckedMenuIdsCloudPos(item.children));
      }
    }
    return ids;
  }

  getCheckedMenuIdsBilling(menuList: any[]): number[] {
    let ids: number[] = [];
    for (let item of menuList) {
      if (item.isChecked) ids.push(item.menuId);
      if (item.children?.length > 0) {
        ids = ids.concat(this.getCheckedMenuIdsBilling(item.children));
      }
    }
    return ids;
  }

  getCheckedMenuIdsSorolSoft(menuList: any[]): number[] {
    let ids: number[] = [];
    for (let item of menuList) {
      if (item.isChecked) ids.push(item.menuID);
      if (item.children?.length > 0) {
        ids = ids.concat(this.getCheckedMenuIdsSorolSoft(item.children));
      }
    }
    return ids;
  }

  // 🔹 Submit Final Payload
  onSaveMenus(): void {
    if (!this.selectedRoleId) {
      alert('Please select a role first.');
      return;
    }
    debugger;
    const projectMenus: any[] = [];

    for (const project of this.projectArray) {
      let menuIds: any[] = [];

      if (project.id === 1) {
        menuIds = this.getCheckedMenuIdsCloudPos(this.navListCloudPos);
      } else if (project.id === 6) {
        menuIds = this.getCheckedMenuIdsSorolSoft(this.navListSorolSoft);
      } else if (project.id === 4) {
        menuIds = this.getCheckedMenuIdsBilling(this.navListBilling);
      }

      // only add if there are any checked menu ids
      if (menuIds.length > 0) {
        projectMenus.push({
          projectId: project.id,
          menuIds: menuIds,
        });
      }
    }
    const storedProjects = JSON.parse(localStorage.getItem('masterAppMenuList') || '[]');
    const storedProjectIds = storedProjects.map((p: any) => p.id.toString());
    const payload = {
      projectId: (projectMenus || [])
    .map(p => p?.projectId?.toString() ?? '0')
    .join(','),
      roleId: this.selectedRoleId ? this.selectedRoleId.toString() : '0',
      projectMenus: (projectMenus || []).map((p) => ({
        projectId: p?.projectId?.toString() ?? '0',
        menuIds: (p?.menuIds || []).map((id: any) => id?.toString() ?? ''),
      })),
    };

    console.log('✅ Final Payload:', payload);

    this.roleCreateClientService.TempRoleCreate(payload).subscribe({
      next: (res: any) => {
        const isSuccess = res?.isSuccess === true; // note: backend uses `Succeeded`

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
