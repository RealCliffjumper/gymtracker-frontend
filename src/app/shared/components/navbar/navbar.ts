import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { UserService } from '../../../core/services/user.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [
    RouterLink,
    NzMenuModule,
    NzIconModule,
    NzModalModule,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  
constructor(private userService: UserService, private route: Router, private modal: NzModalService) { }

logout(): void {
  this.modal.confirm({
      nzTitle: '<i>Logout</i>',
      nzContent: '<b>Are you sure you want to logout?</b>',
      nzOkText: 'Yes',
      nzOnOk: () => this.userService.logout()
  });
}
}