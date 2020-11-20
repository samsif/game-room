import { NgModule } from '@angular/core';
import { RoomsComponent } from './rooms.component';
import { RoomsListComponent } from './rooms-list/rooms-list.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { RoomsService } from '../services/rooms/rooms.service';
import { environment } from '../../environments/environment';
import { RoomsRoutingModule } from './rooms-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SocketRoomService } from '../services/rooms/socket-room.service';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

const config: SocketIoConfig = { url: environment.socketUrl, options: {transports: ['websocket', 'polling', 'flashsocket']} };

@NgModule({
  declarations: [
    RoomsComponent,
    CreateRoomComponent,
    RoomsListComponent],
  imports: [
    RoomsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [
    {provide: 'GetRoomsNotifInterface', useClass: SocketRoomService},
    {provide: 'AddRoomInterface', useClass: RoomsService},
    {provide: 'GetRoomsInterface', useClass: RoomsService},
    {provide: 'API_BASE_URL', useValue: environment.baseUrl}
  ]
})
export class RoomsModule { }