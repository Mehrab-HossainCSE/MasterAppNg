import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel extends AuthModel {
 

  id: number;
  userId: string;
  username: string;
  password: string;
  fullname: string;
   fullName: string;
  email: string;
  pic: string;
  roles: number[] = [];
  occupation: string;
  companyName: string;
  phone: string;
  address?: AddressModel;
  socialNetworks?: SocialNetworksModel;
   inActive: boolean;
  firstname: string;
  lastname: string;
  website: string;
 mobileNo: string;
  language: string;
  timeZone: string;
   shopId: string;
   employeeId: string;
  communication: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };

  emailSettings?: {
    emailNotification: boolean;
    sendCopyToPersonalEmail: boolean;
    activityRelatesEmail: {
      youHaveNewNotifications: boolean;
      youAreSentADirectMessage: boolean;
      someoneAddsYouAsAsAConnection: boolean;
      uponNewOrder: boolean;
      newMembershipApproval: boolean;
      memberRegistration: boolean;
    };
    updatesFromKeenthemes: {
      newsAboutKeenthemesProductsAndFeatureUpdates: boolean;
      tipsOnGettingMoreOutOfKeen: boolean;
      thingsYouMissedSindeYouLastLoggedIntoKeen: boolean;
      newsAboutMetronicOnPartnerProductsAndOtherServices: boolean;
      tipsOnMetronicBusinessProducts: boolean;
    };
  };

  setUser(_user: unknown) {
    const user = _user as UserModel;
    this.id = user.id;
    this.username = user.username || '';
    this.password = user.password || '';
    this.fullname = user.fullname || '';
    this.email = user.email || '';
    this.pic = user.pic || './assets/media/avatars/blank.png';
    this.roles = user.roles || [];
    this.occupation = user.occupation || '';
    this.companyName = user.companyName || '';
    this.phone = user.phone || '';
    this.address = user.address;
    this.socialNetworks = user.socialNetworks;
  }
}


// export class UserModel {
//   userId: string;
//   userName: string;
//   fullName: string;
//   email: string;
//   employeeId: string;
//   shopId: string;
//   mobileNo: string;
//   address: string;
//   inActive: boolean;
  
//   constructor() {
//     this.userId = '';
//     this.userName = '';
//     this.fullName = '';
//     this.email = '';
//     this.employeeId = '';
//     this.shopId = '';
//     this.mobileNo = '';
//     this.address = '';
//     this.inActive = false;
//   }
// }