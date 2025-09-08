import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { VATProService } from '../../Services/vat-pro.service';

@Component({
  selector: 'app-vat-pro',
  standalone: false,
  templateUrl: './vat-pro.component.html',
  styleUrl: './vat-pro.component.scss',
})
export class VATProComponent implements OnInit {
  selectedTab: string = 'nav';
  isEditMode: boolean = false;
  navList: any[] = [];
  UserCreateForm!: FormGroup;
  RoleCreateForm!: FormGroup;
  spin: boolean;
  isOpenAction: number | null = null;
  parentMenuList: any[] = [];
  branchList: any[] = [];
  childMenuList: any[] = [];
   roleWiseMenu: any[]=[];
  isSubmitting: boolean;
  addedRoles: any[] = [];
  menusByRole: any[] = [];
  selectedRoleId: any = 0;
  allUsers: any[] = [];
  currentUserId: any = 0;
  currentUserName: any = null;
  isLoading = false;
  hierarchicalMenus: any[] = [];
  swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  constructor(
    private readonly vATProService: VATProService,
    private readonly cdr: ChangeDetectorRef,
    private readonly _modalService: NgbModal,
    private readonly fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.initUserCreateForm();
    // this.getNavList();
  
     this.initRoleCreateForm();
    // this.getAllUser();
    debugger;
     const vatToken = localStorage.getItem('vatProToken');
  if (vatToken) {
    const tokenData = JSON.parse(vatToken);
    const now = new Date().getTime();
    console.log('Current Time:', now);
    console.log('Token Expiry:', tokenData.expiry);
    
    if (now <= tokenData.expiry) {
        this.loadParentMenus();
        this.loadChildMenus();
        this.getRole();
        this.getAllUser();
      // Token is still valid, no need to get new one
      console.log('Token still valid, skipping API call');
      return; // Exit the entire method
    } else {
      // Token expired, remove it
      console.log('Token expired, removing...');
      localStorage.removeItem('vatProToken');
    }
  }

    const menuListJson = localStorage.getItem('masterAppMenuList');
    if (!menuListJson) return;
    debugger;
    const menuList = JSON.parse(menuListJson);
    const vatPro = menuList.find((p: any) => p.id === 30);
    if (!vatPro) return;

    const username = vatPro.userName;
    const encryptedPassword = vatPro.password;

    const decryptedPassword = this.vATProService.decrypt(encryptedPassword);
    console.log('Decrypted Password:', decryptedPassword); // For debugging only, remove in production
    this.getTokenVatPro(username, decryptedPassword);
      this.loadParentMenus();
     this.loadChildMenus();
     this.getRole();
      this.getAllUser();
  }

 
  getTokenVatPro(username: any, password: any) {
    this.vATProService.vatProToken(username, password).subscribe({
      next: (data: any) => {
        const now = new Date();
        const expiry = now.getTime() + 15 * 60 * 1000; // 15 minutes in ms

        const tokenData = {
          token: data.token,
          expiry: expiry,
        };
        debugger;
        localStorage.setItem('vatProToken', JSON.stringify(tokenData));
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }

  getNavList() {
    this.vATProService.getAllNav().subscribe({
      next: (data: any) => {
        this.navList = data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  private initRoleCreateForm(): void {
    this.RoleCreateForm = this.fb.group({
      RoleId: [0],
      RoleName: ['', Validators.required],
      Description: ['', Validators.required],
      IsActive: [true],
    });
  }
  private initUserCreateForm(): void {
    this.UserCreateForm = this.fb.group({
  USER_ID: [null, Validators.required],
  USER_NAME: [null, Validators.required],
  USER_PASS: [null],  // string, not boolean
  MOBILE: ['', Validators.required],
  EMAIL: [null],
  ADDRESS: [null],
  DES_ID: [null, Validators.required],
  FullName: [null, Validators.required],
  BranchID: [null, Validators.required],
  ExcelPermission: [false],   // boolean
  NID: [null],
  RoleId: [null, Validators.required],
  IsActive: [true],           // boolean

  // Nested FormGroup for userImages
  userImages: this.fb.group({
    UserImageId: [null],
    USER_ID: [null],
    UserImageData: [null],
    NIDImageData: [null]
  }),

  // Optional audit fields
  OldPassword: [null],
  BranchName: [null],
  DES_TITLE: [null],
  RecordCount: [null],
  RecordFilter: [null],
  CREATE_BY: [null],
  CREATE_DATE: [null],
  UPDATE_BY: [null],
  UPDATE_DATE: [null]
});
  }
  createOrEditRoleModal(roleCreateOrUpdateModal: any, data?: any) {
    if (data?.RoleId != null) {
      this.isEditMode = true;
      this.RoleCreateForm.patchValue({
        RoleId: data.RoleId,
        RoleName: data.RoleName ?? null,
        Description: data.Description || '',
        IsActive: data.IsActive ?? false,
      });
    } else {
      this.RoleCreateForm.reset({
        RoleId: 0,
        RoleName: '',
        Description: '',

        isActive: true,
      });
    }

    const modalRef = this._modalService.open(roleCreateOrUpdateModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result
      .then(
        (result) => {},
        (reason) => {}
      )
      .finally(() => {
        this.isEditMode = false;
        this.RoleCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
      });
  }
  onGivePrivilege(privilegeModal: any, user: any) {
    debugger;
    this.menusByRole = [];
    this.currentUserName = user.USER_NAME;
    this.currentUserId = user.USER_ID;
    const modalRef = this._modalService.open(privilegeModal, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-fullscreen-modal',
    });
   this. getUserByID();
    modalRef.result
      .then(
        (result) => {},
        (reason) => {}
      )
      .finally(() => {});
  }
  roleSumbit() {
    debugger;
    if (!this.selectedRoleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: ' Role not selected!',
      });
      return;
    }
    const payload = {
  ...this.UserCreateForm.value,   // take all form values
  RoleId: this.selectedRoleId,    // override with selected role
  Id: this.currentUserId          // extra field if backend needs it
};
    const request = this.vATProService.updateRolePerUser(payload);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.Status === true; // note: backend uses `Succeeded`

        if (isSuccess) {
          this.swalOptions.title = 'Updated!';
          this.swalOptions.text =
            res?.messages?.[0] ?? 'Role updated successfully.';
          this.swalOptions.icon = 'success';

          this.getRole();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.messages?.[0] ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.RoleCreateForm.reset({ isActive: false });
        this.isEditMode = false;
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

  // createOrEditModalPopUp(createOrUpdateModal: any, data?: any) {
  //   debugger;
  //   if (data?.menuId != null) {
  //     this.isEditMode = true;
  //     this.NavCreateForm.patchValue({
  //       menuId: data.menuId,
  //       parentMenuId: data.parentMenuId ?? null,
  //       menuName: data.menuName || '',
  //       url: data.url || '',
  //       sorting: data.sorting || '',
  //       applicationId: data.applicationId || '',
  //       creatorId: data.creatorId,

  //       isActive: data.isActive ?? false,
  //     });
  //   } else {
  //     this.NavCreateForm.reset({
  //       menuId: 0,
  //       parentMenuId: 0,
  //       menuName: '',
  //       url: '',
  //       createDate: new Date(),
  //       sorting: 0,
  //       creatorId: '',
  //       applicationId: 0,
  //       isActive: true,
  //     });
  //   }

  //   const modalRef = this._modalService.open(createOrUpdateModal, {
  //     size: 'lg',
  //     centered: true,
  //     backdrop: 'static',
  //     keyboard: false,
  //   });

  //   modalRef.result
  //     .then(
  //       (result) => {},
  //       (reason) => {}
  //     )
  //     .finally(() => {
  //       this.isEditMode = false;
  //       this.NavCreateForm.reset({
  //         IsParent: false,
  //         SHOW_EDIT_PERMISSION: false,
  //       });
  //     });
  // }
  onRoleChange() {
    debugger;
    this.menusByRole = [];
    // 👉 in real app, call API here
    this.vATProService.assignMenu(this.selectedRoleId).subscribe({
      next: (data: any) => {
       
        this.menusByRole = this.buildMenuTree(data.Data);
        console.log('menusByRole list loaded:', this.menusByRole);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
    console.log('Selected RoleId:', this.selectedRoleId);
  }
   getUserByID() {
  debugger;
  this.vATProService.getUserByID(this.currentUserId).subscribe({
    next: (data: any) => {
      const user = data.Data;   // backend returned user object

      if (user) {
        this.UserCreateForm.patchValue({
          USER_ID: user.USER_ID,
          USER_NAME: user.USER_NAME,
          USER_PASS: user.USER_PASS,
          MOBILE: user.MOBILE,
          EMAIL: user.EMAIL,
          ADDRESS: user.ADDRESS,
          DES_ID: user.DES_ID,
          FullName: user.FullName,
          BranchID: user.BranchID,
          ExcelPermission: user.ExcelPermission,
          NID: user.NID,
          RoleId: user.RoleId,
          IsActive: user.IsActive,

          userImages: {
            UserImageId: user.userImages?.UserImageId,
            USER_ID: user.userImages?.USER_ID,
            UserImageData: user.userImages?.UserImageData,
            NIDImageData: user.userImages?.NIDImageData
          },

          OldPassword: user.OldPassword,
          BranchName: user.BranchName,
          DES_TITLE: user.DES_TITLE,
          RecordCount: user.RecordCount,
          RecordFilter: user.RecordFilter,
          CREATE_BY: user.CREATE_BY,
          CREATE_DATE: user.CREATE_DATE,
          UPDATE_BY: user.UPDATE_BY,
          UPDATE_DATE: user.UPDATE_DATE
        });
      }

      console.log('User loaded:', user);
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Failed to load user', err);
    },
  });
}


  getRole() {
    debugger;
    this.vATProService.getRole().subscribe({
      next: (data: any) => {
        this.addedRoles = data.Data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  loadChildMenus(): void {
    this.vATProService.GetChildNav().subscribe({
      next: (res) => {
        this.childMenuList = res.Data;
      },
      error: (err) => {
        console.error('Error fetching child menus:', err);
      },
    });
  }
  loadParentMenus(): void {
    this.vATProService.GetParentNav().subscribe({
      next: (res) => {
        this.parentMenuList = res.Data;
      },
      error: (err) => {
        console.error('Error fetching parent menus:', err);
      },
    });
  }
  
  toggleParentCheckbox(menu: any) {
    console.log('Toggling parent checkbox for menu:', menu);
    menu.isChecked = !menu.isChecked;
    debugger;
    if (menu.children) {
      menu.children.forEach((child: any) => {
        child.isChecked = menu.isChecked;
      });
    }
    this.cdr.detectChanges();
  }

  getAllUser(): void {
    this.vATProService.getAllUser().subscribe({
      next: (res) => {
        this.allUsers = res.Data ?? [];
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  UpdateNav() {
    debugger;
    const checkedMenus = this.navList
      .map((parent) => {
        const checkedChildren = (parent.children || []).filter(
          (children: { isChecked: any }) => children.isChecked
        );

        if (parent.isChecked || checkedChildren.length > 0) {
          return {
            ...parent,
            children: checkedChildren,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    console.log('Checked Menu:', checkedMenus);
    this.vATProService.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';

          this.getNavList();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;

        // this.NavCreateForm.reset({
        //   IsParent: false,
        //   SHOW_EDIT_PERMISSION: false,
        // });
        this.isEditMode = false;
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
  toggleChildCheckbox(child: any, parent: any) {
    debugger;

    child.isChecked = !child.isChecked;

    if (!Array.isArray(parent.children)) {
      console.error('parent.Children is not an array:', parent.Children);
      return;
    }

    const allChildrenChecked = parent.children.every(
      (c: { isChecked: any }) => c.isChecked
    );

    const noChildrenChecked = parent.children.every(
      (c: { isChecked: any }) => !c.isChecked
    );

    if (allChildrenChecked) {
      parent.isChecked = true;
    } else if (noChildrenChecked) {
      parent.isChecked = false;
    } else {
      parent.isChecked = true;
    }

    this.cdr.detectChanges();
  }
  roleOnSubmit(): void {
    if (this.RoleCreateForm.invalid) {
      this.RoleCreateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit = this.isEditMode;

    // ✅ Build plain JSON object instead of FormData
    const rolePayload = {
      RoleId: this.RoleCreateForm.get('RoleId')?.value,
      RoleName: this.RoleCreateForm.get('RoleName')?.value ?? '',
      Description: this.RoleCreateForm.get('Description')?.value ?? '',
      IsActive: this.RoleCreateForm.get('IsActive')?.value ? 1 : 0,
      CreatorId: '1',
      CreateDate: new Date().toISOString(),
      UpdatorId: '1',
      UpdateDate: new Date().toISOString(),
    };

    const request = isEdit
      ? this.vATProService.updateRole(rolePayload)
      : this.vATProService.createRole(rolePayload);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.Status === true; 

        if (isSuccess) {
          this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
          this.swalOptions.text =
            res?.messages?.[0] ??
            (isEdit
              ? 'Role updated successfully.'
              : 'Role created successfully.');
          this.swalOptions.icon = 'success';

          this.getRole();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.messages?.[0] ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.RoleCreateForm.reset({ isActive: false });
        this.isEditMode = false;
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
buildMenuTree(menus: any[]): any[] {
  const map: any = {};
  const roots: any[] = [];

  menus.forEach(menu => {
    map[menu.ID] = { ...menu, children: [] };
  });

  menus.forEach(menu => {
    if (menu.ParentID && map[menu.ParentID]) {
      map[menu.ParentID].children.push(map[menu.ID]);
    } else {
      roots.push(map[menu.ID]);
    }
  });

  return roots;
}
  // onSubmit(): void {
  //   debugger;
  //   if (this.NavCreateForm.invalid) {
  //     this.NavCreateForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   const isEdit = this.isEditMode;
  //   const formData = new FormData();

  //   formData.append('MenuId', this.NavCreateForm.get('menuId')?.value);
  //   formData.append(
  //     'ParentMenuId',
  //     this.NavCreateForm.get('parentMenuId')?.value ?? ''
  //   );
  //   formData.append('IsParent', this.NavCreateForm.get('IsParent')?.value);
  //   formData.append('MenuName', this.NavCreateForm.get('menuName')?.value);
  //   formData.append('URL', this.NavCreateForm.get('url')?.value ?? '');
  //   formData.append('Sorting', this.NavCreateForm.get('sorting')?.value);
  //   formData.append(
  //     'ApplicationId',
  //     this.NavCreateForm.get('applicationId')?.value
  //   );

  //   formData.append(
  //     'CreatorId',
  //     this.NavCreateForm.get('creatorId')?.value ?? ''
  //   );

  //   formData.append('IsActive', this.NavCreateForm.get('isActive')?.value);

  //   const request = isEdit
  //     ? this.vATProService.updateNav(formData)
  //     : this.vATProService.createNav(formData);

  //   request.subscribe({
  //     next: (res: any) => {
  //       const isSuccess = res?.success === true;

  //       if (isSuccess) {
  //         this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
  //         this.swalOptions.text =
  //           res?.Messages?.[0] ??
  //           (isEdit ? 'Navigation updated.' : 'Navigation created.');
  //         this.swalOptions.icon = 'success';

  //         this.getNavList();
  //       } else {
  //         this.swalOptions.title = 'Error';
  //         this.swalOptions.text = res?.message ?? 'Something went wrong.';
  //         this.swalOptions.icon = 'error';
  //       }

  //       this.showAlert(this.swalOptions);
  //       this.isSubmitting = false;
  //       this.NavCreateForm.reset({
  //         IsParent: false,
  //         SHOW_EDIT_PERMISSION: false,
  //       });
  //       this.isEditMode = false;
  //     },
  //     error: (error) => {
  //       this.swalOptions.title = 'Error';
  //       this.swalOptions.text =
  //         error?.error?.message || 'Server error occurred. Please try again.';
  //       this.swalOptions.icon = 'error';
  //       this.showAlert(this.swalOptions);
  //       this.isSubmitting = false;
  //     },
  //   });
  // }


   assignMenu( menuModal: any,ID: number): void {
    this.spin = true;
    debugger;
    this.vATProService.assignMenu(ID).subscribe({
      next: (data: any) => {
        this.roleWiseMenu = data.Data;
        this.buildHierarchicalMenus();   
        console.log('Projects loaded:', this.roleWiseMenu);
        this.spin = false;
        this.selectedRoleId = ID;
        this.cdr.detectChanges();
        this._modalService.open(menuModal, {
          size: 'xl',
          keyboard: false,
          backdrop: 'static',
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.spin = false;
      },
    });
  }


   // Build hierarchical menu structure with children
  buildHierarchicalMenus() {
    debugger;
    console.log('Building hierarchical menus with:', this.parentMenuList, this.childMenuList);
    // Start with parent menus
    try{
      this.hierarchicalMenus = this.parentMenuList.map(parent => {
      // Find children for this parent
      const children = this.childMenuList.filter(child => child.ParentID === parent.ID);
      
      // Check if parent or any child has permissions in roleWiseMenu
      const parentRoleData = this.roleWiseMenu.find(r => r.ID === parent.ID);
      const childrenWithRoles = children.map(child => {
        const childRoleData = this.roleWiseMenu.find(r => r.ID === child.ID);
        return {
          ...child,
          isChecked: this.hasAnyPermission(childRoleData),
          permissions: childRoleData || child,
          children: []
        };
      });

      return {
        ...parent,
        isChecked: this.hasAnyPermission(parentRoleData) || childrenWithRoles.some(c => c.isChecked),
        permissions: parentRoleData || parent,
        children: childrenWithRoles,
        isIndeterminate: this.getParentIndeterminateState(childrenWithRoles)
      };
    });
    } catch (error) {
      console.error('Error building hierarchical menus:', error);
    }
  }

  hasAnyPermission(menuData: any): boolean {
    if (!menuData) return false;
    return menuData.CanAdd || menuData.CanEdit || menuData.CanView || 
           menuData.CanApprove || menuData.CanDownload;
  }

  // Get indeterminate state for parent checkbox
  getParentIndeterminateState(children: any[]): boolean {
    const checkedCount = children.filter(child => child.isChecked).length;
    return checkedCount > 0 && checkedCount < children.length;
  }

  // Toggle parent menu checkbox
  toggleParentMenu(parent: any) {
    parent.isChecked = !parent.isChecked;
    parent.isIndeterminate = false;
    
    // Update all children to match parent
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child: any) => {
        child.isChecked = parent.isChecked;
        this.updateChildPermissions(child, parent.isChecked);
      });
    }
    
    // Update parent permissions
    this.updateParentPermissions(parent, parent.isChecked);
  }

  // Toggle child menu checkbox
  toggleChildMenu(child: any, parent: any) {
    child.isChecked = !child.isChecked;
    this.updateChildPermissions(child, child.isChecked);
    
    // Update parent state based on children
    const checkedChildren = parent.children.filter((c: any) => c.isChecked).length;
    const totalChildren = parent.children.length;
    
    if (checkedChildren === 0) {
      parent.isChecked = false;
      parent.isIndeterminate = false;
      this.updateParentPermissions(parent, false);
    } else if (checkedChildren === totalChildren) {
      parent.isChecked = true;
      parent.isIndeterminate = false;
      this.updateParentPermissions(parent, true);
    } else {
      parent.isChecked = false;
      parent.isIndeterminate = true;
      this.updateParentPermissions(parent, true); // Parent should have some access if children do
    }
  }

  // Toggle specific permission for a menu item
  togglePermission(menu: any, permissionType: string) {
    menu.permissions[permissionType] = !menu.permissions[permissionType];
    
    // If any permission is granted, check the menu
    const hasAnyPerm = this.hasAnyPermission(menu.permissions);
    menu.isChecked = hasAnyPerm;
    
    // Update parent state if this is a child
    if (menu.ParentID) {
      const parent = this.hierarchicalMenus.find(p => p.ID === menu.ParentID);
      if (parent) {
        this.updateParentStateFromChildren(parent);
      }
    }
  }

  // Update parent permissions
  updateParentPermissions(parent: any, hasAccess: boolean) {
    if (hasAccess) {
      // Grant at least view permission to parent
      parent.permissions.CanView = true;
    } else {
      // Remove all permissions if no children are checked
      parent.permissions.CanAdd = false;
      parent.permissions.CanEdit = false;
      parent.permissions.CanView = false;
      parent.permissions.CanApprove = false;
      parent.permissions.CanDownload = false;
    }
  }

  // Update child permissions
  updateChildPermissions(child: any, hasAccess: boolean) {
    if (hasAccess) {
      // Grant at least view permission
      child.permissions.CanView = true;
    } else {
      // Remove all permissions
      child.permissions.CanAdd = false;
      child.permissions.CanEdit = false;
      child.permissions.CanView = false;
      child.permissions.CanApprove = false;
      child.permissions.CanDownload = false;
    }
  }

  // Update parent state based on children states
  updateParentStateFromChildren(parent: any) {
    const checkedChildren = parent.children.filter((c: any) => c.isChecked).length;
    const totalChildren = parent.children.length;
    
    if (checkedChildren === 0) {
      parent.isChecked = false;
      parent.isIndeterminate = false;
      this.updateParentPermissions(parent, false);
    } else if (checkedChildren === totalChildren) {
      parent.isChecked = true;
      parent.isIndeterminate = false;
      this.updateParentPermissions(parent, true);
    } else {
      parent.isChecked = false;
      parent.isIndeterminate = true;
      this.updateParentPermissions(parent, true);
    }
  }

  // Get selected menus for submission
 getSelectedMenus(): any[] {
  const selectedMenus: any[] = [];
  const roleId = 1; // Set your actual role ID here
  
  this.hierarchicalMenus.forEach(parent => {
    // Check if parent is selected or has any permissions
    if (parent.isChecked || this.hasAnyPermission(parent.permissions)) {
      selectedMenus.push({
        PageId: parent.ID.toString(), // Backend expects string
        RoleId: roleId,
        CanAdd: parent.permissions?.CanAdd || false,
        CanEdit: parent.permissions?.CanEdit || false,
        CanView: parent.permissions?.CanView || false,
        CanApprove: parent.permissions?.CanApprove || false,
        CanDownload: parent.permissions?.CanDownload || false
      });
    }
    
    // Check children
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child: any) => {
        if (child.isChecked || this.hasAnyPermission(child.permissions)) {
          selectedMenus.push({
            PageId: child.ID.toString(), // Backend expects string
            RoleId: roleId,
            CanAdd: child.permissions?.CanAdd || false,
            CanEdit: child.permissions?.CanEdit || false,
            CanView: child.permissions?.CanView || false,
            CanApprove: child.permissions?.CanApprove || false,
            CanDownload: child.permissions?.CanDownload || false
          });
        }
      });
    }
  });
  
  return selectedMenus;
}



menuOnSubmit(a:any,b:any){
  debugger;
  const selectedMenus = this.getSelectedMenus();
  if(selectedMenus.length==0){
    Swal.fire({
      icon: 'warning',
      title: 'Oops...',
      text: ' Please select at least one menu!',
    });
    return;
  }
  console.log('Selected Menus for submission:', selectedMenus);
  this.vATProService.menuOnSubmit(selectedMenus).subscribe({
    next: (res) => {
      const isSuccess = res?.Status === true;
      this.swalOptions.title = isSuccess ? 'Success!' : 'Error';
      this.swalOptions.text =
        res?.message ?? (isSuccess ? 'Updated.' : 'Failed.');
        this.swalOptions.icon = isSuccess ? 'success' : 'error';
        this.showAlert(this.swalOptions);

        if (isSuccess) {
          this.getNavList();
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isLoading = false;
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
