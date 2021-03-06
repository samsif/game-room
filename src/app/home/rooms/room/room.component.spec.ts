import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomComponent } from './room.component';
import { UserInRoomComponentMock } from '../../../tests-spec-mocks/components-mock/user-in-room.component.mock';
import { ChatBoxComponentMock } from '../../../tests-spec-mocks/components-mock/chat-box.component.mock';
import { ActivatedRoute } from '@angular/router';
import { RedirectionInterfaceMock } from '../../../tests-spec-mocks/redirection.mock';
import { GetUsersInRoomNotifMock } from '../../../tests-spec-mocks/get-users-in-room-notif.mock';
import { ManageRoomsMock } from '../../../tests-spec-mocks/manage-rooms.mock';
import { RoomsHelper } from '../../../tests-spec-mocks/helpers/room.service.spec.helper';
import { RoomsNotifInterface } from '../../../interfaces/rooms/rooms-notif.interface';
import { RoomsNotifMock } from '../../../tests-spec-mocks/rooms-notif.mock';

describe('RoomComponent', () => {
  let fixture: ComponentFixture<RoomComponent>;
  let roomComponent: RoomComponent;
  let redirectInt: RedirectionInterfaceMock;
  let roomsNotifInterface: RoomsNotifInterface;
  let getUsersInRoomNotifInterface: GetUsersInRoomNotifMock;
  let manageRoomsMock: ManageRoomsMock;
  const activeRoute = {snapshot: {paramMap: {get: (x) =>  'room1'}}} as ActivatedRoute;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RoomComponent,
        UserInRoomComponentMock,
        ChatBoxComponentMock
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activeRoute},
        {provide: 'RedirectionInterface', useClass: RedirectionInterfaceMock},
        {provide: 'RoomsNotifInterface', useClass: RoomsNotifMock},
        {provide: 'GetUsersInRoomNotifInterface', useClass: GetUsersInRoomNotifMock},
        {provide: 'ManageRoomsInterface', useClass: ManageRoomsMock},

      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RoomComponent);
    redirectInt = TestBed.get('RedirectionInterface');
    roomsNotifInterface = TestBed.get('RoomsNotifInterface');
    getUsersInRoomNotifInterface = TestBed.get('GetUsersInRoomNotifInterface');
    manageRoomsMock = TestBed.get('ManageRoomsInterface');
    roomComponent = fixture.componentInstance;
  });

  it('should create room component', () => {
    expect(roomComponent).toBeTruthy();
  });

  describe('ngOnInit / ngOnDestroy method', () => {
    it('should call addUserInRoom method', () => {
      spyOn(roomComponent, 'addUserInRoom');
      roomComponent.ngOnInit();
      expect(roomComponent.addUserInRoom).toHaveBeenCalled();
    });

    it('should call getRoomName method', () => {
      spyOn(roomComponent, 'getRoomName');
      roomComponent.ngOnInit();
      expect(roomComponent.getRoomName).toHaveBeenCalled();
    });

    it('should call getOutFromRoom method on destroy', () => {
      spyOn(roomComponent, 'getOutFromRoom');
      roomComponent.ngOnDestroy();
      expect(roomComponent.getOutFromRoom).toHaveBeenCalled();
    });
  });

  describe('getRoomName method', () => {
    it('should set roomName', () => {
      roomComponent.getRoomName();
      expect(roomComponent.roomName).toEqual('room1');
    });
  });

  describe('addUserInRoom', () => {
    it('should set roomId from active route', () => {
      roomComponent.addUserInRoom();
      expect(roomComponent.roomId).toEqual('room1');
    });

    it('should call addUserInRoom from int', () => {
      spyOn(manageRoomsMock, 'addUserToRoom').and.callThrough();
      roomComponent.addUserInRoom();
      expect(manageRoomsMock.addUserToRoom).toHaveBeenCalledWith('room1');
    });

    it('should call emitRoomNotif from int', () => {
      spyOn(roomsNotifInterface, 'emitRoomNotif').and.callThrough();
      roomComponent.addUserInRoom();
      expect(roomsNotifInterface.emitRoomNotif).toHaveBeenCalled();
    });

    it('should call getUsersConnected', () => {
      spyOn(roomComponent, 'getUsersConnected').and.callThrough();
      roomComponent.addUserInRoom();
      expect(roomComponent.getUsersConnected).toHaveBeenCalled();
    });

    it('should call goBack if service return error', () => {
      spyOn(roomComponent, 'goBack').and.callThrough();
      manageRoomsMock.setError(true);
      roomComponent.addUserInRoom();
      expect(roomComponent.goBack).toHaveBeenCalled();
    });
  });

  describe('getUsersConnected method', () => {
    it('should call getUsersInRoomNotif from int', () => {
      roomComponent.roomId = 'room2';
      spyOn(getUsersInRoomNotifInterface, 'getUsersInRoomNotif').and.callThrough();
      roomComponent.getUsersConnected();
      expect(getUsersInRoomNotifInterface.getUsersInRoomNotif).toHaveBeenCalledWith('room2');
    });

    it('should set userConnected', () => {
      roomComponent.roomId = 'room2';
      roomComponent.getUsersConnected();
      const expectedUserKeys = ['pseudo', '_id'].sort();
      expect(Object.keys(roomComponent.usersConnected[0]).sort()).toEqual(expectedUserKeys);
      expect(roomComponent.usersConnected[0]._id).toEqual('54654');
      expect(roomComponent.usersConnected[0].pseudo).toEqual('samet');
      expect(roomComponent.usersConnected[1]._id).toEqual('5254');
      expect(roomComponent.usersConnected[1].pseudo).toEqual('yasmine');
      expect(roomComponent.usersConnected[2]._id).toEqual('54699');
      expect(roomComponent.usersConnected[2].pseudo).toEqual('marwa');
    });
  });

  describe('getOutFromRoom method', () => {
    it('should call removeUserFromRoom from int', () => {
      spyOn(manageRoomsMock, 'removeUserFromRoom').and.callThrough();
      roomComponent.roomId = 'room2';
      roomComponent.getOutFromRoom();
      expect(manageRoomsMock.removeUserFromRoom).toHaveBeenCalledWith('room2');
    });

    it('should call emitRoomNotif from int', () => {
      spyOn(roomsNotifInterface, 'emitRoomNotif').and.callThrough();
      roomComponent.roomId = 'room2';
      roomComponent.getOutFromRoom();
      expect(roomsNotifInterface.emitRoomNotif).toHaveBeenCalled();
    });

    it('should call emitUsersLeaveRoomNotif from int', () => {
      spyOn(getUsersInRoomNotifInterface, 'emitUsersLeaveRoomNotif').and.callThrough();
      roomComponent.roomId = 'room2';
      roomComponent.getOutFromRoom();
      expect(getUsersInRoomNotifInterface.emitUsersLeaveRoomNotif).toHaveBeenCalledWith('room2');
    });
  });

  describe('goBack method', () => {
    it('should call redirectTo from int', () => {
      spyOn(redirectInt, 'redirectTo');
      roomComponent.goBack();
      expect(redirectInt.redirectTo).toHaveBeenCalledWith('../', activeRoute);
    });
  });

  describe('HTML DOM', () => {
    it('should show room Name', () => {
      roomComponent.roomName = 'room1';
      fixture.detectChanges();
      const roomNameDiv = fixture.nativeElement.querySelector('.room-title');
      expect(roomNameDiv.textContent).toEqual('room1');
    });

    it('should show chat box in 9/12 part of screen width', () => {
      const chatBoxContent = fixture.nativeElement.querySelector('.chat-box-content .row div');
      expect(chatBoxContent.classList.toString().includes('col-9')).toBeTruthy();
      expect(chatBoxContent.classList.toString().includes('h-100')).toBeTruthy();
    });

    it('should show chat box component', () => {
      const chatBoxComponent = fixture.nativeElement.querySelector('app-chat-box');
      expect(chatBoxComponent).toBeTruthy();
    });

    it('should usersInRoom in 3/12 part of screen width', () => {
      const usersInRoomContent = fixture.nativeElement.querySelector('.chat-box-content .row div:not(:first-child)');
      expect(usersInRoomContent.classList.toString().includes('col-3')).toBeTruthy();
    });

    it('should show userInRoomComponent', () => {
      const usersInRoomComponent = fixture.nativeElement.querySelector('app-user-in-room');
      expect(usersInRoomComponent).toBeTruthy();
    });

    it('should apply userConnected to input userInRoomComponent', () => {
      roomComponent.usersConnected = new RoomsHelper().users;
      fixture.detectChanges();
      const usersInRoomComponent = fixture.nativeElement.querySelector('app-user-in-room');
      expect(usersInRoomComponent.getAttribute('ng-reflect-users')).toBeTruthy();
    });
  });
});
