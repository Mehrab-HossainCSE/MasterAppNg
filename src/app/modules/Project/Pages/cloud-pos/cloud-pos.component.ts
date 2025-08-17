import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cloud-pos',
  standalone: false,

  templateUrl: './cloud-pos.component.html',
  styleUrl: './cloud-pos.component.scss',
})
export class CloudPosComponent implements OnInit {
  selectedTab: string = 'nav';
  spin: boolean;
  navList: any[] = [];
  isLoading = false;
  NavCreateForm!: FormGroup;
  companyInfoCreateForm!: FormGroup;
  swalOptions: SweetAlertOptions = {};
  isEditMode: boolean = false;
  parentMenuList: any[] = [];
  isOpenAction: number | null = null;
  selectedRole: string = '';
  addedRoles: any[] = [];
  addedRole: string | null = null;
  roleMenu: any[] = [];
  selectedRoleId: number | null = null;
  allUsers: any[] = [];
  allPrivilege: any[] = [];
  privilegeModalRef: any;
  assignedMenus1: any[] = [];
  availableMenus1: any[] = [];
  currentUserID: any = null;
  currentUser: any = null;
  companyInfo: any = null;
  selectedRoles1Grouped: { rolename: string; menuRoles: any[] }[] = [];
  allRoles: string[] = [
    'Accounts Manager',
    'Administrator',
    'Executive Accounts',
    'Executive Director',
    'Executive IT',
    'Executive POS',
    'Executive Purchase',
    'Executive Store',
    'Floor Manager',
    'IT Manager',
    'Purchase Manager',
    'StoreManager',
    'Supervisor Floor',
    'Supervisor Sub Store',
  ];
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  isSubmitting: boolean;

  constructor(
    private readonly cloudPosService: CloudPosService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly _alertType: AlertTypeService,
    private readonly _modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.selectedTab = 'nav';
    this.initNavCreateForm();
    this.loadParentMenus();
    this.getRole();
    this.getNavList();
    this.getAllUser();
    this.getAllPrivilege();
    this.getCompanyInfo();
    this.initCompanyInfoCreateForm();
  }
  private initNavCreateForm(): void {
    this.NavCreateForm = this.fb.group({
      SERIAL: [null, Validators.required],
      PARENT_ID: [null],
      IsParent: [false],
      DESCRIPTION: ['', Validators.required],
     
      URL: ['#', [
      Validators.required,
      Validators.pattern('^(https?:\\/\\/|#).+')
    ]],
      PER_ROLE: ['', Validators.required],
      ENTRY_BY: ['', Validators.required],
      ORDER_BY: [null, Validators.required],
      FA_CLASS: [''],
      MENU_TYPE: ['', Validators.required],
      SHOW_EDIT_PERMISSION: [false],
    });
  }


private initCompanyInfoCreateForm(): void {
    this.companyInfoCreateForm = this.fb.group({
      COMPANY_CODE: ['', [Validators.required, Validators.maxLength(10)]],
    COMPANY_NAME: ['', [Validators.required, Validators.maxLength(100)]],
    ADDRESS1: ['', [Validators.required, Validators.maxLength(255)]],
    ADDRESS2: ['', Validators.maxLength(255)],
    POSTAL_CODE: ['', [Validators.maxLength(20)]],
    CITY: ['', [Validators.required, Validators.maxLength(100)]],
    COUNTRY: ['', [Validators.required, Validators.maxLength(100)]],
    OWNER_NAME: ['', [Validators.required, Validators.maxLength(100)]],
    VATREGNO: ['', Validators.maxLength(50)],
    TIN: ['', Validators.maxLength(50)],
    TRADE_LICENSE_NO: ['', Validators.maxLength(50)],
    DRUG_LICENSE_NO: ['', Validators.maxLength(50)],
    CONTACT_NO: ['', [Validators.required, Validators.maxLength(100)]],
    EMAIL: ['', [Validators.email, Validators.maxLength(100)]],
    WEBSITE: ['', Validators.maxLength(100)],
    PREFIX: ['', [Validators.required, Validators.maxLength(10)]],
    DOE: ['', Validators.required], // Date of Establishment
    DATE_OF_EXPIRE: ['', Validators.required],
    NUM_OF_STORE: [0, [Validators.required, Validators.min(0)]],
    NUM_OF_USER: [0, [Validators.required, Validators.min(0)]],
    CENTRALSTOREENABLED: [false, Validators.required],
    CENTRALSTORESALE: [false, Validators.required],
    SALE_VAT_PRCNT: [0, [Validators.required, Validators.min(0)]],
    CREDIT_SALES_ALLOW: [false, Validators.required],
    NUM_OF_TERMINAL: [0, [Validators.required, Validators.min(0)]],
    BARCODE_LEN: [0, [Validators.required, Validators.min(0)]],
    LOGO_URL: ['', Validators.maxLength(255)],
    INV_TPL_ID: [0, Validators.required],
    PO_TPL_ID: [0, Validators.required],
    PR_TPL_ID: [0, Validators.required],
    STATUS: ['', [Validators.required, Validators.maxLength(20)]],
    ENTRY_BY: ['', Validators.required],
    ENTRY_DATE: ['', Validators.required],
    UPDATED_BY: [''],
    UPDATED_DATE: [''],
    BARCODE_PRINT_OPT: ['', Validators.maxLength(20)],
    MP_ENABLED: [false],
    MEM_CRD_ENABLED: [false],
    GIFT_VOUCHER_ENABLED: [false],
    PUR_VAT_PRCNT: [0, Validators.min(0)],
    IS_PRICE_INCLD_VAT: [false],
    IS_SUB_CAT_WISE_VARIANCE: [false],
    IS_SHOP_WISE_SAL_PRICE: [false],
    IS_VAT_BEFORE_DISC: [false],
    IS_CUSTOMER_WISE_PRICE: [false],
    IS_OVERWRITE_CD: [false],
    IS_BRAND_WISE_STORE: [false],
    ALLOW_CARTONWISE_SALE: [false],
    CPU_CHANGE_ON_RECEIVE: [false],
    MRP_CHANGE_ON_RECEIVE: [false],
    VENDOR_APPROVAL: [false],
    STORE_REQ_APPROVAL: [false],
    PO_APPROVAL: [false],
    PUR_RCV_APPROVAL: [false],
    WH_DELIVERY_APPROVAL: [false],
    STR_DELIVERY_APPROVAL: [false],
    DML_APPROVAL: [false],
    PUR_RTN_APPROVAL: [false],
    PRICE_CHANGE_APPROVAL: [false],
    PROMOTION_APPROVAL: [false],
    IS_SUB_SUBCAT_WISE_VARIANCE: [false],
    SHOW_SUB_SUBCATEGORY: [false],
    DEPARTMENT_LABEL: ['', Validators.maxLength(50)],
    SUB_DEPARTMENT_LABEL: ['', Validators.maxLength(50)],
    CATEGORY_LABEL: ['', Validators.maxLength(50)],
    SUB_CATEGORY_LABEL: ['', Validators.maxLength(50)],
    SUB_SUBCATEGORY_LABEL: ['', Validators.maxLength(50)],
    SHOW_DEPARTMENT: [false],
    MIN_PROFIT_MAR_DISC: [0, Validators.min(0)],
    SDC_VAT_CODE: ['', Validators.maxLength(50)],
    SDC_SD_CODE: ['', Validators.maxLength(50)],
    SDC_PKG_VAT_CODE: ['', Validators.maxLength(50)],
    SDC_PKG_SD_CODE: ['', Validators.maxLength(50)],
    IS_MANUFACTURER_REQUIRED: [false],
    IS_STYLE_CODE_REQUIRED: [false],
    IS_MANAGE_ARTICLE: [false],
    IS_BATCHWISE_RECEIVE: [false],
    ALLOW_MANUAL_BATCH_INPUT: [false],
    MANAGE_VENDORWISE_STOCK: [false],
    IS_IMEI_ENABLED: [false],
    BNK_COMM_RDC_ON_SAL_RTN: [false],
    SHOW_CONSOLE: [false],
    VENDOR_ACCT_HEAD_ENABLED: [false],
    VENDOR_ACCT_HEAD: ['', Validators.maxLength(100)],
    MRP_CHANGE_ON_PO: [false],
    MANAGE_DONORWISE_STOCK: [false],
    AREA_LABEL: ['', Validators.maxLength(50)],
    PRINT_DELIVERY_PICK_LIST: [false],
    IS_RANDOM_GV_SERIAL: [false],
    GV_SERIAL_LEN: [0],
    POINT_REDEEMP_OTP: [false],
    GV_REDEEMP_OTP: [false],
    SMS_ON_INVOICE: [false],
    SMS_INCLD_INV_NO: [false],
    SMS_INCLD_INV_AMT: [false],
    SMS_INCLD_EARN_POINT: [false],
    SMS_INCLD_REDEEMED_POINT: [false],
    SMS_TEMPLATE: ['', Validators.maxLength(255)],
    VENDOR_WISE_CHALLAN_SL: [false],
    CUSTOMER_REQ_ON_SALE: [false],
    CUSTOMER_TYPE_LABEL: ['', Validators.maxLength(50)],
    PRODUCT_NAME_LABEL: ['', Validators.maxLength(50)],
    PACK_SIZE_LABEL: ['', Validators.maxLength(50)],
    STYLE_CODE_LABEL: ['', Validators.maxLength(50)],
    MANAGE_PV_USER_BARCODE: [false],
    FIFO_METHOD: [false],
    ThirdPartyCreditCustomerEnable: [false],
    ThridPartyCCFor: [null],
    ThirdPartyCC_Url: [null],
    CUSTOMER_DISC_OTP_REQUIRED: [false],
    IS_BATCH_AUTO_SERIAL: [false],
    IS_REASON_TEXT: [false],
    IS_SHOW_VEHICLE_IN_DELIVERY: [false],
    ENABLE_EXCESS_CREDIT_LIMIT: [false],
    IS_REPRINT_DELIVERT_ORDER: [false],
    IS_REPRINT_ALLOCATION_CHALLAN: [false],
    IS_REPRINT_GIFT_VOUCHER_GEN_CHALLAN: [false],
    ALLOW_PUR_DISCOUNT_CPU: [false],
    IS_ECOM_AUTO_TRANSFER: [false],
    IS_STORE_WISE_ORDER_LOADING: [false],
    IS_MULTIPLE_MRP: [false],
    IS_AUTO_SCAN_RECEIVE: [false],
    MULTI_VEN_NOT_VEN_WISE_STOCK: [false],
    IS_RCV_CHALLAN_STORE_DELIVERY: [false],
    IS_TRNS_RCV_CHALLAN_STORE_DELIVERY: [false],
    VAT_INCLUDING_BARCODE: [false],
    IS_SHOW_QRCODE_PRINT: [false],
    PRODUCT_APPROVAL: [false],
    RECEIVE_CHALLAN_AUTO_DELIVERY: [false],
    MULTIPLE_VENDOR: [false],
    CPU_CHECKING_IN_STORE_DELIVERY: [false],
    SAL_BARCODE_WISE_PRICE_CHANGE: [false],
    CRM_ENABLE: [false],
    CRM_FOR: [null],
    CRM_URL: [null],
    CRM_USER: [null],
    CRM_PASS: [null],
    MAIN_CHANNEL_LABEL: ['', Validators.maxLength(50)],
    ZONE_LABEL: ['', Validators.maxLength(50)],
    CUSTOMER_GROUP_LABEL: ['', Validators.maxLength(50)],
    CUSTOMER_CATEGORY_LABEL: ['', Validators.maxLength(50)],
    CUSTOMER_SUB_CATEGORY_LABEL: ['', Validators.maxLength(50)],
    DELIVERY_MAN_IN_STORE_DELIVERY: [false],
    REF_NO_IN_STORE_DELIVERY: [false],
    SOFTWARE_VERSION: ['', Validators.maxLength(20)],
    SMS_ON_GV_SALE: [false],
    SMS_GV_INCLD_INV_NO: [false],
    SMS_GV_TEMPLATE: ['', Validators.maxLength(255)],
    SHOP_CONNECTION_CHECK: [false],
    DIRECT_RECEIVE: [false],
    CPU_EDIT_ON_PUR_RTN: [false],
    REF_REQ_PUR_RCV: [false],
    STORE_WISE_CUSTOMER_ON_SALE: [false],
    PO_EMAIL: [false],
    CPU_EDIT_ON_DMG_LOST: [false],
    RabbitMQ: [false],
    EC_OREDR_EDIT_BEFORE_DELIVERY: [false],
    CPU_CHECK_ON_CIRCULAR_PRICE_CHANGE: [false],
    VENDOR_CODE_SHOW_VENDOR_DD: [false],
    SAL_VAT_PERCENT_IN_CATEGORY: [false],
    SAL_VAT_PERCENT_IN_SUB_SUBCATEGORY: [false],
    FLEX_ORDER_PROCESS: [false],
    VENDOR_WISE_USER_BARCODE: [false],
    Courier_Selection_on_Order_Created: [false],
    BRAND_LABEL: ['', Validators.maxLength(50)],
    Store_Select_on_Order: [false],
    OrderMargetoDelivery: [false],
    OrderCreatetoReq: [false],
    CusAccountsHeadCreation: [false],
    SupAccountsHeadCreation: [false],
    SimpleQuickSearch: [false],
    ReasonTextRequired: [false],
    SHOW_CUSTOMER_CATEGORY: [false],
    SHOW_SHOPTYPE: [false],
    PUR_RCV_SHOP: [false],
    ENABLE_PHARMACY_COLLECTION_BOOTH: [false],
    PRODUCT_WISE_DISCOUNT: [false],
    InvoiceUrlSms: [false],
    CATEGORY_WISE_COST_PRICE_CHANGE: [false],
    EFFECT_PRICE_CHANGE_ALL_TRANSECTION: [false],
    RELEASE_VERSION: [0],
    MAIL_SENDING_IN_CUSTOMER_PRICE_SETUP: [false],
    SMS_ON_PURCHASE_ORDER: [false],
    CATEGORY_WISE_CIRCULAR_DISCOUNT: [false],
    IsOrderTypeDefault: [false],
    CITY_BANK_INTEGRATION: [false],
    SAL_QTY_IN_DESIRED_STOCK: [false],
    SAL_PRICE_FROM_PUR_RCV_IN_RCV: [false],
    PUR_PRICE_FROM_PUR_RCV_IN_RCV: [false],
    SMS_INCLD_BALANCE_POINT: [false],
    POINT_WITH_DISCOUNT: [false],
    QuickSearchWithStock: [false],
    BARCODE_WISE_EXEC_ON_SALE: [false],
    AUTO_SERIAL_CUSTOMER_ID: [false],
    VENDOR_WISE_SALE_WITH_STOCK: [false],
    SMS_INV_NO_TEXT: [null],
    SMS_INV_AMT_TEXT: [null],
    SMS_EARN_POINT_TEXT: [null],
    SMS_REDEEMED_POINT_TEXT: [null],
    SMS_BALANCE_POINT_TEXT: [null],
    MONTH_WISE_PERIODICAL_STOCK_REPORT: [false],
    SMS_TEMPLATE_END: [''],
    NO_VAT_SAL: [false],
    WEB_SALE: [false],
    DOCTOR_NAME_LABEL: [null],
    HOSPITAL_NAME_LABEL: [null],
    FIELD1_LABEL: [null],
    FIELD2_LABEL: [null],
    SHOW_CUSTOMER_SEARCH: [false],
    WITHOUT_PAYMENT: [false],
    ECOMMERCE_URL: [''],
    WELCOME_SMS: [false],
    WELCOME_SMS_TEXT: [''],
    SDC_VAT_CODE_LABEL: [''],
    SDC_SD_CODE_LABEL: [''],
    CPU_CHECK_IN_DISCOUNT: [false],
    CHK_STOCK_EDIT_ATTRIBUTE: [false],
    STORE_REQ_APPROVAL1_FOR_PO: [false],
    SHOW_STOCK_IN_INVENTORY: [false],
    DISABLE_INVENTORY_ITEM_OPERATION: [false],
    COUNTRY_CODE_IN_PHONE: [false],
    BARCODE_PREFIX: [''],
    WEB_POS_VERSION: [null],
    VAT_PRO_ENABLE: [false],
    VAT_PRO_URL: [''],
    VAT_PRO_USER: [''],
    VAT_PRO_PASS: [''],
    CHECK_STOCK_REQ_APPROVAL: [false],
    STORE_WISE_CUSTOMER_TYPE: [false],
    CUSTOMER_PHONE_ELEVEN_DIGIT: [false],
    DELIVERY_METHOD: [''],
    OFFLINE_SALE: [false],
    SMS_BIRTHDAY_TEMPLATE: [''],
    CUSTOMER_WISE_INVOICE_SERIAL: [false],
    SMS_BIRTHDAY: [false],
    PUR_VAT_BFOR_DISC_FOR_SHOP: [false],
    EXPIRED_STOCK_TRANSFER: [false],
    STORE_REQ_APPROVAL3: [false],
    PRODUCTION_SETUP: [false],
    HerlanApiIntegration: [''],
    PRINT_COUPON_INVOICE: [''],
    Herlan_API_BASE_URL: [''],
    Herlan_API_EMAIL: [''],
    Herlan_API_PASSWORD: [''],
    VAT_TYPE_REQUIRED_FOR_MIS: [false],
    IS_ORDER_AUTO_TRANSFER_BACKGROUND: [false],
    PRINT_DELIVERY_CHALLAN: [false],
    BUSINESS_TYPE: [''],
    GPStarEnable: [''],
    GPStarUrl: [''],
    GPStarCustomerKey: [''],
    GPStarCustomerSecret: [''],
    VSChallanBaseUrl: [''],
    VSChallanClientId: [''],
    VSChallanClientSecret: [''],
    VSChallanEnable: [false],
    LicenseKey: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }
 getCompanyInfo(): void {
    this.cloudPosService.getCompanyInfo().subscribe({
      next: (res) => {
        debugger;
          this.companyInfoCreateForm.patchValue(res);
      },
      error: (error) => {
        console.error('Error fetching company info:', error);
      },
    });
  }
     
     

  getSelectedOptions(selectElement: HTMLSelectElement): string[] {
    const selectedValues: string[] = [];
    for (const option of Array.from(selectElement.selectedOptions)) {
      selectedValues.push(option.value);
    }
    return selectedValues;
  }

  get availableRoles(): string[] {
    return this.allRoles.filter(
      (role) => !this.addedRoles?.some((added) => added.rolename === role)
    );
  }
  onGivePrivilege(user: any, privilegeModal: any): void {
    debugger;
    this.availableMenus1 = [];
    this.assignedMenus1 = [];

    this.currentUser = user.userId;
    this.currentUserID = user.id;
    this.privilegeModalRef = this._modalService.open(privilegeModal, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    this.privilegeModalRef.result
      .then(
        (result: any) => {
        
        },
        (reason: any) => {
         
        }
      )
      .finally(() => {
        this.availableMenus1 = [];
        this.assignedMenus1 = [];
        this.selectedRoles1Grouped = [];
        this.NavCreateForm.reset();
        this.privilegeModalRef = null;
      });
  }

  onRoleSelectionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;

    debugger;

    const selectedRoleNames: string[] = Array.from(
      selectElement.selectedOptions
    ).map((opt) => opt.value);

    for (const rolename of selectedRoleNames) {
      const privilege = this.allPrivilege.find((p) => p.rolename === rolename);

      if (privilege && privilege.menuRoles) {
        const alreadyExists = this.selectedRoles1Grouped.find(
          (p) => p.rolename === rolename
        );
        if (!alreadyExists) {
          this.selectedRoles1Grouped.push({
            rolename: privilege.rolename,
            menuRoles: privilege.menuRoles,
          });
        }
      }
    }
  }

  getAllUser(): void {
    this.cloudPosService.getAllUser().subscribe({
      next: (res) => {
        this.allUsers = res ?? [];
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }
  getAllPrivilege(): void {
    this.cloudPosService.getAllPrivilege().subscribe({
      next: (res) => {
        this.allPrivilege = res ?? [];
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      },
    });
  }
  
  addRole(): void {
    if (this.selectedRole) {
      debugger;
      this.addedRole = this.selectedRole;
      this.selectedRole = '';
      const dto = {
        ID: 0,
        ROLENAME: this.addedRole,
        MENULISTID: null,
      };
      this.cloudPosService.addRole(dto).subscribe({
        next: (res) => {
          const isSuccess = res?.success === true;

          if (isSuccess) {
            this.swalOptions.title = 'Success!';
            this.swalOptions.text = res?.data ?? 'Role added successfully.';
            this.swalOptions.icon = 'success';
            this.getRole();
          } else {
            this.swalOptions.title = 'Error';
            this.swalOptions.text = res?.Message ?? 'Something went wrong.';
            this.swalOptions.icon = 'error';
          }

          this.showAlert(this.swalOptions);
          this.isSubmitting = false;

          this.NavCreateForm.reset({
            IsParent: false,
            SHOW_EDIT_PERMISSION: false,
          });
          this.isEditMode = false;
        },
        error: (error) => {
          this.swalOptions.title = 'Error';
          this.swalOptions.text =
            error?.error?.Message || 'Server error occurred. Please try again.';
          this.swalOptions.icon = 'error';
          this.showAlert(this.swalOptions);
          this.isSubmitting = false;
        },
      });
    }
  }

  menuOnSubmit(event?: Event, myForm?: NgForm) {
    if (event) event.preventDefault();
    if (myForm?.invalid) return;
    debugger;
    this.isLoading = true;

    const selectedMenuIds: number[] = [];

    for (const parent of this.roleMenu) {
      if (parent.isChecked) selectedMenuIds.push(parent.serial);
      if (parent.children?.length > 0) {
        for (const child of parent.children) {
          if (child.isChecked) selectedMenuIds.push(child.serial);
        }
      }
    }

    const dto = {
      ID: this.selectedRoleId,
      MENULISTID: selectedMenuIds.join(','),
    };

    this.cloudPosService.menuOnSubmit(dto).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true;
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

  assignMenu(ID: number, menuModal: any): void {
    this.spin = true;
    debugger;
    this.cloudPosService.assignMenu(ID).subscribe({
      next: (data: any) => {
        this.roleMenu = data;
        console.log('Projects loaded:', this.roleMenu);
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

  loadParentMenus(): void {
    this.cloudPosService.GetParentNavCloudPosDBKMART().subscribe({
      next: (res) => {
        this.parentMenuList = res;
      },
      error: (err) => {
        console.error('Error fetching parent menus:', err);
      },
    });
  }

  createOrEditModalPopUp(createOrUpdateModal: any, data?: any) {
    debugger;
    if (data?.serial != null) {
      this.isEditMode = true;
      this.NavCreateForm.patchValue({
        SERIAL: data.serial,
        PARENT_ID: data.parenT_ID ?? null,
        DESCRIPTION: data.description || '',
        URL: data.url || '',
        PER_ROLE: data.peR_ROLE || '',
        ENTRY_BY: data.entrY_BY || '',
        ENTRY_DATE: data.entrY_DATE ? new Date(data.ENTRY_DATE) : new Date(),
        ORDER_BY: data.ordeR_BY || 0,
        FA_CLASS: data.fA_CLASS || '',
        ID: data.id || 0,
        MENU_TYPE: data.menU_TYPE || '',
        SHOW_EDIT_PERMISSION: data.shoW_EDIT_PERMISSION ?? false,
      });
    } else {
      this.NavCreateForm.reset({
        SERIAL: 0,
        PARENT_ID: 0,
        DESCRIPTION: '',
        URL: '',
        PER_ROLE: '',
        ENTRY_BY: '',
        ENTRY_DATE: new Date(),
        ORDER_BY: 0,
        FA_CLASS: '',
        ID: 0,
        MENU_TYPE: '',
        SHOW_EDIT_PERMISSION: false,
      });
    }

    const modalRef = this._modalService.open(createOrUpdateModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result
      .then(
        (result) => {
          
        },
        (reason) => {
         
        }
      )
      .finally(() => {
        this.isEditMode = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
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

  UpdateNav() {
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
    this.cloudPosService.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true ;

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

        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
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

  onSubmit(): void {
    debugger;
    if (this.NavCreateForm.invalid) {
      this.NavCreateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit = this.isEditMode;
    const formData = new FormData();

    formData.append('SERIAL', this.NavCreateForm.get('SERIAL')?.value);
    formData.append(
      'PARENT_ID',
      this.NavCreateForm.get('PARENT_ID')?.value ?? ''
    );
    formData.append('IsParent', this.NavCreateForm.get('IsParent')?.value);
    formData.append(
      'DESCRIPTION',
      this.NavCreateForm.get('DESCRIPTION')?.value
    );
    formData.append('URL', this.NavCreateForm.get('URL')?.value ?? '');
    formData.append('PER_ROLE', this.NavCreateForm.get('PER_ROLE')?.value);
    formData.append('ENTRY_BY', this.NavCreateForm.get('ENTRY_BY')?.value);
    formData.append('ORDER_BY', this.NavCreateForm.get('ORDER_BY')?.value);
    formData.append(
      'FA_CLASS',
      this.NavCreateForm.get('FA_CLASS')?.value ?? ''
    );
    formData.append(
      'MENU_TYPE',
      this.NavCreateForm.get('MENU_TYPE')?.value ?? ''
    );
    formData.append(
      'SHOW_EDIT_PERMISSION',
      this.NavCreateForm.get('SHOW_EDIT_PERMISSION')?.value
    );

    const request = isEdit
      ? this.cloudPosService.updateNav(formData)
      : this.cloudPosService.createNav(formData);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.success === true ;

        if (isSuccess) {
          this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
          this.swalOptions.text =
            res?.Messages?.[0] ??
            (isEdit ? 'Navigation updated.' : 'Navigation created.');
          this.swalOptions.icon = 'success';

          this.getNavList();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
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

  getNavList() {
    this.cloudPosService.getAllNav().subscribe({
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
  getRole() {
    this.cloudPosService.getRoleCloudPosDBKMART().subscribe({
      next: (data: any) => {
        this.addedRoles = data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }

  moveToAssigned(menu: any) {
    this.availableMenus1 = this.availableMenus1.filter(
      (m) => m.serial !== menu.serial
    );

    if (!this.assignedMenus1.find((m) => m.serial === menu.serial)) {
      this.assignedMenus1.push(menu);
    }
  }

  onAssignAllMenusToggle(event: any) {
    const isChecked = event.target.checked;
    debugger;

    if (isChecked) {
      this.selectedRoles1Grouped.forEach((group) => {
        group.menuRoles.forEach((menu) => {
          const menuWithRole = { ...menu, rolename: group.rolename };

          const exists = this.assignedMenus1.some(
            (m) => m.serial === menu.serial
          );

          if (!exists) {
            this.assignedMenus1.push(menuWithRole);
          }
        });
      });
    } else {
      this.assignedMenus1 = [];
    }
  }

  moveToAvailable(menu: any) {
    this.assignedMenus1 = this.assignedMenus1.filter(
      (m) => m.serial !== menu.serial
    );

    const existsInSelectedRoles = this.selectedRoles1Grouped.some((role) =>
      role.menuRoles.some((roleMenu: any) => roleMenu.serial === menu.serial)
    );

    if (
      existsInSelectedRoles &&
      !this.availableMenus1.find((m) => m.serial === menu.serial)
    ) {
      this.availableMenus1.push(menu);
    }
  }

  onPrivilegeSubmit() {
    debugger;
    if (this.assignedMenus1.length === 0) {
      return;
    }

    this.isSubmitting = true;

    const dto = {
      ID: this.currentUserID,
      MenuIdList: this.assignedMenus1.map((menu) => menu.serial).join(','),
    };
    console.log('Submitting privilege data:', dto);
    this.cloudPosService.assignedUserMenus(dto).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;

        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
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
  closeModal(): void {
    if (this.privilegeModalRef) {
      this.privilegeModalRef.close('success');
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
