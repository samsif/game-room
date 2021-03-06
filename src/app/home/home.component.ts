import { Component, Inject, OnInit } from '@angular/core';
import { DisconnectUserInterface } from '../interfaces/user/disconnect-user.interface';
import { RedirectionInterface } from '../interfaces/utilities/redirection.interface';
import { LoggedUserInterface } from '../interfaces/user/logged-user.interface';
import { LOCAL_STORAGE_ID } from '../constants/rooms.constant';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  public userName: string;
  constructor(@Inject('DisconnectionInterface') private disconnectInt: DisconnectUserInterface,
              @Inject('RedirectionInterface') private  redirect: RedirectionInterface,
              @Inject('LoggedUserInterface') private  loggedUser: LoggedUserInterface) { }

  ngOnInit(): void {
    this.getUserName();
  }

  getUserName(): void {
    this.userName = this.loggedUser.getUserName();
  }

  disconnect(): void {
    const userId = localStorage.getItem(LOCAL_STORAGE_ID);
    if (userId) {
      this.disconnectInt.disconnectUser().subscribe(() => {
        this.logOutAction();
      });
    } else {
      this.logOutAction();
    }
  }

  logOutAction(): void {
    localStorage.removeItem(LOCAL_STORAGE_ID);
    this.redirect.redirectTo('/');
  }
}
