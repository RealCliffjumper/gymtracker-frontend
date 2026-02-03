import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { UserService } from '../../../core/services/user.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { notifications, themePreference, workoutInProgress } from '../../signals/signals';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { dynamicNotifications } from '../../signals/notifications';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [
    RouterLink,
    NzMenuModule,
    NzIconModule,
    NzModalModule,
    RouterLinkActive,
    NzBadgeModule,
    NzPopoverModule,
    NzButtonModule,
    NzListComponent,
    NzListItemComponent
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  visible: boolean = false;
  _workoutInProgress = workoutInProgress
  _notifications = dynamicNotifications
  themePref = themePreference()

  constructor(private userService: UserService, private route: Router, private modal: NzModalService, private themeService: ThemeService) { }

  logout(): void {
    this.modal.confirm({
        nzTitle: '<i>Logout</i>',
        nzContent: '<b style="var(--ant-text-highlight)">Are you sure you want to logout?</b>',
        nzOkText: 'Yes',
        nzOnOk: () => this.userService.logout()
    });
  }

  themeChange(){
    this.themeService.setTheme(this.themePref !== 'dark')
    this.themePref = themePreference()
    this.userService.changeThemePreference(this.userService.currentUser()!.userId, themePreference() !== 'light').subscribe({})
  }

  change(value: boolean): void {
  }
}