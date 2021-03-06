import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { RoomModel } from '../../../models/room/room.model';
import { Subject } from 'rxjs';
import { ManageRoomsInterface } from '../../../interfaces/rooms/manage-rooms.interface';
import { RoomsNotifInterface } from '../../../interfaces/rooms/rooms-notif.interface';
import { LOCAL_STORAGE_ID, ROOMS_PER_PAGE } from '../../../constants/rooms.constant';
import { PaginatorComponent } from '../../paginator/paginator.component';
import { RoomsResultModel } from '../../../models/room/rooms-result.model';
import { RedirectionInterface } from '../../../interfaces/utilities/redirection.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.scss']
})
export class RoomsListComponent implements OnInit {
  public roomList: RoomModel[] = [];
  public totalRooms: number;
  public selectedPage = 1;
  public showReloadBtn = false;
  public userId: string;
  @Input() $roomCreated = new Subject();
  @ViewChild(PaginatorComponent) paginator: PaginatorComponent;
  constructor(@Inject('ManageRoomsInterface') private manageRoomsInt: ManageRoomsInterface,
              @Inject('RoomsNotifInterface') private roomsNotifInt: RoomsNotifInterface,
              @Inject('RedirectionInterface') private redirect: RedirectionInterface,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getRooms();
    this.listenToRoomCreation();
    this.userId = localStorage.getItem(LOCAL_STORAGE_ID);
  }

  openRoom(room: RoomModel): void {
    this.manageRoomsInt.setRoomName(room.name)
    this.redirect.redirectTo(`${room._id}`, this.activeRoute);
  }

  listenToRoomCreation(): void {
    this.$roomCreated.subscribe(() => {
      if (this.selectedPage !== 1) {
        this.selectPage(1);
        this.paginator.selectedPage = 1;
      }
    });
  }

  getRooms(): void {
    this.roomsNotifInt.getRoomsSockNotif().subscribe(result => {
      if (this.selectedPage === 1) {
        this.applyRoomsResult(result);
      } else {
        this.showReloadBtn = true;
      }
    });
  }

  private applyRoomsResult(result: RoomsResultModel): void {
    this.roomList = result.rooms;
    this.totalRooms = result.total;
  }

  selectPage(page: number): void {
    this.selectedPage = page;
    this.getRoomsByPage((page - 1) * ROOMS_PER_PAGE, (page * ROOMS_PER_PAGE) - 1);
  }

  getRoomsByPage(start: number, end: number): void {
    this.manageRoomsInt.getRoomsByPage(start, end).subscribe(result => {
      this.applyRoomsResult(result);
      this.showReloadBtn = false;
    });
  }

  initPagination(): void {
    this.selectedPage = 1;
    this.paginator.selectedPage = 1;
  }

  reloadRooms(): void {
    this.getRoomsByPage(0, ROOMS_PER_PAGE - 1);
    this.initPagination();
  }

  deleteRoom(roomId: string): void {
    this.manageRoomsInt.deleteRoom(roomId, this.userId).subscribe(() => {
      this.selectPage(1);
      this.initPagination();
      this.roomsNotifInt.emitRoomNotif();
    });
  }
}
