import { TestBed } from '@angular/core/testing';
import { Socket } from 'ngx-socket-io';
import { DataInterface } from '../../interfaces/utilities/data.interface';
import { ChatService } from './chat.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { URLS } from '../../constants/urls.constant';
import { SocketMock } from '../../tests-spec-mocks/socket.mock';
import { DataInterfaceMock } from '../../tests-spec-mocks/data.mock';
import { ChatModel } from '../../models/chat/chat.model';
import { UserWriterStatusModel } from '../../models/user/user-writer-status.model';
import {ChatMessagesSpecHelper} from "../../tests-spec-mocks/helpers/chat-messages.spec.helper";
import {ChatResultModel} from "../../models/chat/chat-result.model";

describe('ChatService', () => {
  let chatService: ChatService;
  let socket: Socket;
  let dataInt: DataInterface;
  let httpTestingController: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {provide: Socket, useClass: SocketMock},
        {provide: 'DataInterface', useClass: DataInterfaceMock},
        {
          provide: 'API_BASE_URL',
          useValue: environment.baseUrl
        }, {
          provide: 'API_URLS',
          useValue: URLS
        }
       ]
    }).compileComponents();
    chatService = TestBed.get(ChatService);
    socket = TestBed.get(Socket);
    dataInt = TestBed.get('DataInterface');
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should create the socketrooms service', () => {
    expect(chatService).toBeTruthy();
  });

  describe('sendMessage method', () => {
    const roomId: string = 'azeaze'
    const chatUrl = `http://localhost:3000/chat/${roomId}`;
    afterEach(() => {
      httpTestingController.verify();
    });

    it('should send post request to add message', () => {
      chatService.sendMessage('message', roomId).subscribe(() => {
        expect(req.request.method).toEqual('POST');
      });
      const req = httpTestingController.expectOne(chatUrl);
      req.flush({} as ChatModel);
    });

    it('should send message as bod', () => {
      chatService.sendMessage('message', roomId).subscribe(() => {
        expect(req.request.body).toEqual({message: 'message'});
      });
      const req = httpTestingController.expectOne(chatUrl);
      req.flush({} as ChatModel);
    });

    it('should get chat model response', () => {
      const expectedKeys: string[] = ['pseudo', 'userId', 'message', 'dateTimeParsed'].sort();
      chatService.sendMessage('message', roomId).subscribe((res) => {
        expect(res.pseudo).toEqual('samet');
        expect(res.userId).toEqual('456456');
        expect(res.message).toEqual('message');
        expect(res.dateTimeParsed).toEqual('10:15');
        expect(Object.keys(res).sort()).toEqual(expectedKeys);
      });
      const req = httpTestingController.expectOne(chatUrl);
      const chatModel = {} as ChatModel;
      chatModel.pseudo = 'samet';
      chatModel.userId = '456456';
      chatModel.message = 'message';
      chatModel.dateTimeParsed = '10:15';
      req.flush(chatModel);
    });
  });

  describe('getMessagesByPage method', () => {
    const roomId: string = 'azeaze';
    const chatUrl = `http://localhost:3000/chat/${roomId}?start=10&end=15`;
    afterEach(() => {
      httpTestingController.verify();
    });

    it('should send get request to get message', () => {
      chatService.getMessagesByPage(roomId, 10, 15).subscribe(() => {
        expect(req.request.method).toEqual('GET');
      });
      const req = httpTestingController.expectOne(chatUrl);
      req.flush(ChatMessagesSpecHelper.getChatMessageByPage());
    });

    it('should get chat array response', () => {
      const expectedKeys: string[] = ['pseudo', 'userId', 'message', 'dateTimeParsed'].sort();
      chatService.getMessagesByPage(roomId, 10, 15).subscribe((res) => {
        expect(res.messages[0].pseudo).toEqual('samet');
        expect(res.messages[0].userId).toEqual('456');
        expect(res.messages[0].message).toEqual('aze');
        expect(res.messages[0].dateTimeParsed).toEqual('18:02');
        expect(Object.keys(res.messages[0]).sort()).toEqual(expectedKeys);
        expect(res.total).toEqual(1);
      });
      const req = httpTestingController.expectOne(chatUrl);
      req.flush(ChatMessagesSpecHelper.getChatMessageByPage());
    });
  });

  describe('requestMessagesInRoom / getMessagesInRoom method', () => {
    it('should emit request Chat msg by socket', () => {
      spyOn(socket, 'emit');
      chatService.requestMessageInRoom('roomId');
      expect(socket.emit).toHaveBeenCalledWith('reqChatMessagesInRoom','roomId');
    });

    it('should get data from dataint', done => {
      const expectedKeys: string[] = ['pseudo', 'userId', 'message', 'dateTimeParsed'].sort();
      chatService.getMessageInRoom().subscribe(msg => {
        expect(msg.pseudo).toEqual('samet');
        expect(msg.userId).toEqual('123456');
        expect(msg.message).toEqual('message');
        expect(msg.dateTimeParsed).toEqual('03:55');
        expect(Object.keys(msg).sort()).toEqual(expectedKeys);
        done();
      });
    });
  });

  describe('users writers Methods', () => {
    it('should call emit from socket to update writers', () => {
      spyOn(socket, 'emit');
      const statusModel = {pseudo: 'samet', roomId: '123456789', status: true, _id: 'asc123'} as UserWriterStatusModel;
      chatService.updateWriterStatusInRoom(statusModel);
      expect(socket.emit).toHaveBeenCalledWith('pushWriterStateInRoom', statusModel);
    });

    it('should call emit from socket to request writers', () => {
      spyOn(socket, 'emit');
      chatService.requestWritersInToom('55555');
      expect(socket.emit).toHaveBeenCalledWith('reqWritersInRoom', '55555');
    });

    it('should get data from dataint', done => {
      const expectedKeys: string[] = ['_id', 'status', 'roomId', 'pseudo'].sort();
      chatService.getWriterStatusInRoom().subscribe(writerStatus => {
        expect(writerStatus[0]._id).toEqual('456456');
        expect(writerStatus[0].status).toEqual(true);
        expect(writerStatus[0].roomId).toEqual('123456');
        expect(writerStatus[0].pseudo).toEqual('samet');
        expect(writerStatus[1]._id).toEqual('33333');
        expect(writerStatus[1].status).toEqual(true);
        expect(writerStatus[1].roomId).toEqual('564564');
        expect(writerStatus[1].pseudo).toEqual('yasmine');
        expect(Object.keys(writerStatus[0]).sort()).toEqual(expectedKeys);
        done();
      });
    });
  });
});


