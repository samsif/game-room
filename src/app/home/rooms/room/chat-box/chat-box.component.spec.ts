import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ChatBoxComponent } from './chat-box.component';
import { ChatMessageMock } from '../../../../tests-spec-mocks/chat-message.mock';
import { LoggedUserInterfaceMock } from '../../../../tests-spec-mocks/logged-user.mock';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserWriterStatusModel } from '../../../../models/user/user-writer-status.model';
import { By } from '@angular/platform-browser';
import { ChatMessagesSpecHelper } from '../../../../tests-spec-mocks/helpers/chat-messages.spec.helper';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('ChatBoxComponent', () => {
  let fixture: ComponentFixture<ChatBoxComponent>;
  let chatBoxComponent: ChatBoxComponent;
  let chatMessageInterface: ChatMessageMock;
  let loggedUserInterface: LoggedUserInterfaceMock;
  const activeRoute = {snapshot: {paramMap: {get: (x) =>  'room1' }}} as ActivatedRoute;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        ChatBoxComponent
      ],
      providers: [
        {provide: ChangeDetectorRef, useValue: {detectChanges: () => {}}},
        {provide: ActivatedRoute, useValue: activeRoute},
        {provide: 'ChatMessageInterface', useClass: ChatMessageMock},
        {provide: 'LoggedUserInterface', useClass: LoggedUserInterfaceMock}
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ChatBoxComponent);
    chatBoxComponent = fixture.componentInstance;
    chatMessageInterface = TestBed.get('ChatMessageInterface');
    loggedUserInterface = TestBed.get('LoggedUserInterface');
    chatBoxComponent.chatContent = {nativeElement: {scrollHeight: 500, scrollTop: 0}} as ElementRef;
    chatBoxComponent.chatMessages = [];
  });

  it('should create chat box component', () => {
    expect(chatBoxComponent).toBeTruthy();
  });

  describe('onInit Method', () => {
    it('should set roomId from active route', () => {
      chatBoxComponent.ngOnInit();
      expect(chatBoxComponent.roomId).toEqual('room1');
    });

    it('should call getMessagesInRoom', () => {
      spyOn(chatBoxComponent, 'getMessagesInRoom');
      chatBoxComponent.ngOnInit();
      expect(chatBoxComponent.getMessagesInRoom).toHaveBeenCalled();
    });

    it('should call listenToNewMessages', () => {
      spyOn(chatBoxComponent, 'listenToNewMessages');
      chatBoxComponent.ngOnInit();
      expect(chatBoxComponent.listenToNewMessages).toHaveBeenCalled();
    });

    it('should call getWriterStatusInRoom', () => {
      spyOn(chatBoxComponent, 'getWriterStatusInRoom');
      chatBoxComponent.ngOnInit();
      expect(chatBoxComponent.getWriterStatusInRoom).toHaveBeenCalledWith('room1');
    });

    it('should set userId', () => {
      localStorage.setItem('g-r-userId', 'samet');
      chatBoxComponent.ngOnInit();
      expect(chatBoxComponent.userId).toEqual('samet');
    });
  });

  describe('sendMessages method', () => {
    it('should not send message if empty', () => {
      spyOn(chatMessageInterface, 'sendMessage').and.callThrough();
      chatBoxComponent.message = '';
      chatBoxComponent.sendMessage();
      expect(chatMessageInterface.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send message if contains onl spaces', () => {
      spyOn(chatMessageInterface, 'sendMessage');
      chatBoxComponent.message = '  ';
      chatBoxComponent.sendMessage();
      expect(chatMessageInterface.sendMessage).not.toHaveBeenCalled();
    });

    it('should call send message from int', () => {
      spyOn(chatMessageInterface, 'sendMessage').and.callThrough();
      chatBoxComponent.message = 'hello';
      chatBoxComponent.roomId = 'room1';
      chatBoxComponent.sendMessage();
      expect(chatMessageInterface.sendMessage).toHaveBeenCalledWith('hello', 'room1');
    });

    it('should call requestMessagesInRoom when responding from int', () => {
      spyOn(chatMessageInterface, 'requestMessageInRoom').and.callThrough();
      chatBoxComponent.message = 'hello';
      chatBoxComponent.roomId = 'room1';
      chatBoxComponent.sendMessage();
      expect(chatMessageInterface.requestMessageInRoom).toHaveBeenCalledWith('room1');
    });

    it('should init message when responding', () => {
      chatBoxComponent.message = 'hello';
      chatBoxComponent.roomId = 'room1';
      chatBoxComponent.sendMessage();
      expect(chatBoxComponent.message).toEqual('');
    });

    it('should call sendUpdateWriterStatus responding', () => {
      spyOn(chatBoxComponent, 'sendUpdateWriterStatus').and.callThrough();
      chatBoxComponent.message = 'hello';
      chatBoxComponent.roomId = 'room1';
      chatBoxComponent.sendMessage();
      expect(chatBoxComponent.sendUpdateWriterStatus).toHaveBeenCalled();
    });
  });

  describe('getMessagesInRoom method', () => {
    it('should call getMessagesInRoom from int', () => {
      spyOn(chatMessageInterface, 'getMessagesByPage').and.callThrough();
      chatBoxComponent.roomId = 'aze';
      chatBoxComponent.getMessagesInRoom(0, 14);
      expect(chatMessageInterface.getMessagesByPage).toHaveBeenCalledWith('aze', 0, 14);
    });

    it('should set isloading true', () => {
      chatBoxComponent.isLoading = true;
      chatBoxComponent.getMessagesInRoom(0, 10);
      expect(chatBoxComponent.isLoading).toBeFalsy();
    });

    it('should set totalElement', () => {
      chatBoxComponent.getMessagesInRoom(0, 10);
      expect(chatBoxComponent.totalElement).toEqual(2);
    });

    it('should set chatMessages from response', () => {
      chatBoxComponent.getMessagesInRoom(0, 5);
      const expectedChatKeys = ['pseudo', 'userId', 'dateTimeParsed', 'message'].sort();
      expect(Object.keys(chatBoxComponent.chatMessages[0]).sort()).toEqual(expectedChatKeys);
      expect(chatBoxComponent.chatMessages[0].pseudo).toEqual('yasmin');
      expect(chatBoxComponent.chatMessages[1].pseudo).toEqual('samet');
      expect(chatBoxComponent.chatMessages[0].dateTimeParsed).toEqual('11:35');
      expect(chatBoxComponent.chatMessages[1].dateTimeParsed).toEqual('11:55');
      expect(chatBoxComponent.chatMessages[0].message).toEqual('hello there');
      expect(chatBoxComponent.chatMessages[1].message).toEqual('hello');
      expect(chatBoxComponent.chatMessages[0].userId).toEqual('popoe');
      expect(chatBoxComponent.chatMessages[1].userId).toEqual('azeaze');
    });

    it('should concat chatMessages from response', () => {
      chatBoxComponent.chatMessages = [{
        pseudo: 'samet2',
        dateTimeParsed: '10:22',
        message: 'aaa',
        userId: '789'
      }];
      chatBoxComponent.getMessagesInRoom(0, 5);
      expect(chatBoxComponent.chatMessages[0].pseudo).toEqual('samet2');
      expect(chatBoxComponent.chatMessages[1].pseudo).toEqual('yasmin');
      expect(chatBoxComponent.chatMessages[2].pseudo).toEqual('samet');
      expect(chatBoxComponent.chatMessages[0].dateTimeParsed).toEqual('10:22');
      expect(chatBoxComponent.chatMessages[1].dateTimeParsed).toEqual('11:35');
      expect(chatBoxComponent.chatMessages[2].dateTimeParsed).toEqual('11:55');
      expect(chatBoxComponent.chatMessages[1].message).toEqual('hello there');
      expect(chatBoxComponent.chatMessages[0].message).toEqual('aaa');
      expect(chatBoxComponent.chatMessages[2].message).toEqual('hello');
      expect(chatBoxComponent.chatMessages[1].userId).toEqual('popoe');
      expect(chatBoxComponent.chatMessages[2].userId).toEqual('azeaze');
      expect(chatBoxComponent.chatMessages[0].userId).toEqual('789');
    });

    it('should call manageScrollChatBox when responding', () => {
      spyOn(chatBoxComponent.ref, 'detectChanges');
      chatBoxComponent.getMessagesInRoom(0, 5);
      expect(chatBoxComponent.ref.detectChanges).toHaveBeenCalled();
    });

    it('should not call manageScrollChatBox when responding', () => {
      spyOn(chatBoxComponent.ref, 'detectChanges');
      chatBoxComponent.getMessagesInRoom(10, 15);
      expect(chatBoxComponent.ref.detectChanges).not.toHaveBeenCalled();
    });

    it('should set chatContent scrollTop', () => {
      chatBoxComponent.getMessagesInRoom(0, 5);
      expect(chatBoxComponent.chatContent.nativeElement).toBeTruthy();
    });
  });

  describe('listenToNewMessages method', () => {
    it('should call getMessageInRoom from int', () => {
      spyOn(chatMessageInterface, 'getMessageInRoom').and.callThrough();
      chatBoxComponent.listenToNewMessages();
      expect(chatMessageInterface.getMessageInRoom).toHaveBeenCalled();
    });

    it('should set chatMessages from response with unshfit', fakeAsync(() => {
      chatBoxComponent.listenToNewMessages();
      const expectedChatKeys = ['pseudo', 'userId', 'dateTimeParsed', 'message'].sort();
      of(true).pipe(delay(2001)).subscribe(() => {
        expect(Object.keys(chatBoxComponent.chatMessages[0]).sort()).toEqual(expectedChatKeys);
        expect(chatBoxComponent.chatMessages[0].pseudo).toEqual('marwa');
        expect(chatBoxComponent.chatMessages[0].dateTimeParsed).toEqual('13:35');
        expect(chatBoxComponent.chatMessages[0].message).toEqual('zzz there');
        expect(chatBoxComponent.chatMessages[0].userId).toEqual('zzz');
        flush();
      });
      tick(2001);
    }));

    it('should call manageScrollChatBox when responding', fakeAsync(() => {
      spyOn(chatBoxComponent.ref, 'detectChanges');
      chatBoxComponent.isScrollBottom = true;
      chatBoxComponent.listenToNewMessages();
      of(true).pipe(delay(2001)).subscribe(() => {
        expect(chatBoxComponent.ref.detectChanges).toHaveBeenCalled();
      });
      tick(2001);
    }));

    it('should not call manageScrollChatBox when responding', fakeAsync(() => {
      spyOn(chatBoxComponent.ref, 'detectChanges');
      chatBoxComponent.isScrollBottom = false;
      chatBoxComponent.listenToNewMessages();
      of(true).pipe(delay(2001)).subscribe(() => {
        expect(chatBoxComponent.ref.detectChanges).not.toHaveBeenCalled();
      });
      tick(2001);
    }));

    it('should increment totalElement when responding', fakeAsync(() => {
      chatBoxComponent.totalElement = 6;
      chatBoxComponent.listenToNewMessages();
      of(true).pipe(delay(2001)).subscribe(() => {
        expect(chatBoxComponent.totalElement).toEqual(7);
      });
      tick(2001);
    }));

    it('should show new Message alert when responding', fakeAsync(() => {
      chatBoxComponent.showNewMessagesAlert = false;
      chatBoxComponent.isScrollBottom = false;
      chatBoxComponent.chatContent = {nativeElement: {scrollHeight: 500, scrollTop: 0, clientHeight: 56}} as ElementRef;
      chatBoxComponent.listenToNewMessages();
      of(true).pipe(delay(2001)).subscribe(() => {
        expect(chatBoxComponent.showNewMessagesAlert).toBeTruthy();
      });
      tick(2001);
    }));

    it('should not show new Message alert when responding', fakeAsync(() => {
      chatBoxComponent.showNewMessagesAlert = false;
      chatBoxComponent.isScrollBottom = true;
      chatBoxComponent.listenToNewMessages();
      of(true).pipe(delay(2001)).subscribe(() => {
        expect(chatBoxComponent.showNewMessagesAlert).toBeFalsy();
      });
      tick(2001);
    }));
  });

  describe('textChanged method', () => {
    it('should set message like text', () => {
      chatBoxComponent.textChanged('text');
      expect(chatBoxComponent.message).toEqual('text');
    });

    it('should call sendUpdateWriterStatus', () => {
      spyOn(chatBoxComponent, 'sendUpdateWriterStatus');
      chatBoxComponent.textChanged('text');
      expect(chatBoxComponent.sendUpdateWriterStatus).toHaveBeenCalled();
    });

    it('should not call sendUpdateWriterStatus', () => {
      spyOn(chatBoxComponent, 'sendUpdateWriterStatus');
      chatBoxComponent.message = 'tesss';
      chatBoxComponent.textChanged('text');
      expect(chatBoxComponent.sendUpdateWriterStatus).not.toHaveBeenCalled();
    });

    it('should not call sendUpdateWriterStatus scn 2', () => {
      spyOn(chatBoxComponent, 'sendUpdateWriterStatus');
      chatBoxComponent.message = '';
      chatBoxComponent.textChanged('');
      expect(chatBoxComponent.sendUpdateWriterStatus).not.toHaveBeenCalled();
    });
  });

  describe('loadMoreMessages method', () => {
    beforeEach(() => {
      chatBoxComponent.totalElement = 5;
      chatBoxComponent.chatMessages = ChatMessagesSpecHelper.ChatMessages;
    });

    it('should set isLoading', () => {
      chatBoxComponent.isLoading = true;
      chatBoxComponent.loadMoreMessages();
      expect(chatBoxComponent.isLoading).toBeFalsy();
    });

    it('should call getMessagesINRoom', () => {
      spyOn(chatBoxComponent, 'getMessagesInRoom');
      chatBoxComponent.loadMoreMessages();
      expect(chatBoxComponent.getMessagesInRoom).toHaveBeenCalledWith(2, 16);
    });

    it('should not call getMessagesINRoom', () => {
      chatBoxComponent.totalElement = 2;
      spyOn(chatBoxComponent, 'getMessagesInRoom');
      chatBoxComponent.loadMoreMessages();
      expect(chatBoxComponent.getMessagesInRoom).not.toHaveBeenCalled();
    });
  });

  describe('scrollToBottomEvent method', () => {
    it('should set isScrollBottom', () => {
      chatBoxComponent.scrollToBottomEvent(true);
      expect(chatBoxComponent.isScrollBottom).toBeTruthy();
    });

    it('should set showNewMessagesAlert to false', () => {
      chatBoxComponent.scrollToBottomEvent(true);
      expect(chatBoxComponent.showNewMessagesAlert).toBeFalsy();
    });

    it('should not set showNewMessagesAlert', () => {
      chatBoxComponent.showNewMessagesAlert = true;
      chatBoxComponent.scrollToBottomEvent(false);
      expect(chatBoxComponent.showNewMessagesAlert).toBeTruthy();
    });
  });

  describe('showNewMessages method', () => {
    it('should set showNewMessagesAlert to false', () => {
      chatBoxComponent.showNewMessages();
      expect(chatBoxComponent.showNewMessagesAlert).toBeFalsy();
    });

    it('should call  manageScrollChatBox', () => {
      spyOn(chatBoxComponent.ref, 'detectChanges');
      chatBoxComponent.showNewMessages();
      expect(chatBoxComponent.ref.detectChanges).toHaveBeenCalled();
    });
  });

  describe('sendUpdateWriterStatus method', () => {
    let userStatus: UserWriterStatusModel;
    beforeEach(() => {
      chatBoxComponent.message = 'text';
      chatBoxComponent.userId = 'aze';
      chatBoxComponent.roomId = '789';
      loggedUserInterface.setUserName('samet');
      userStatus = {_id: 'aze', pseudo: 'samet', roomId: '789', status: true};
    });
    it('should call updateWriterInRoomStatus if message exist', () => {
      spyOn(chatBoxComponent, 'updateWriterInRoomStatus');
      chatBoxComponent.sendUpdateWriterStatus();
      expect(chatBoxComponent.updateWriterInRoomStatus).toHaveBeenCalledWith(userStatus);
    });

    it('should call updateWriterInRoomStatus if message dont exist', () => {
      chatBoxComponent.message = '';
      spyOn(chatBoxComponent, 'updateWriterInRoomStatus');
      chatBoxComponent.sendUpdateWriterStatus();
      userStatus.status = false;
      expect(chatBoxComponent.updateWriterInRoomStatus).toHaveBeenCalledWith(userStatus);
    });
  });

  describe('updateWriterInRoomStatus method', () => {
    let userStatus: UserWriterStatusModel;
    beforeEach(() => {
      userStatus = {_id: 'aze', pseudo: 'samet', roomId: '789', status: true};
      chatBoxComponent.roomId = '789';
    });

    it('should call updateWriterStatusInRoom from int', () => {
      spyOn(chatMessageInterface, 'updateWriterStatusInRoom');
      chatBoxComponent.updateWriterInRoomStatus(userStatus);
      expect(chatMessageInterface.updateWriterStatusInRoom).toHaveBeenCalledWith(userStatus);
    });

    it('should call requestWritersInToom from int', () => {
      spyOn(chatMessageInterface, 'requestWritersInToom');
      chatBoxComponent.updateWriterInRoomStatus(userStatus);
      expect(chatMessageInterface.requestWritersInToom).toHaveBeenCalledWith('789');
    });
  });

  describe('getWriterStatusInRoom method', () => {
    it('should call requestWritersInToom from int', () => {
      spyOn(chatMessageInterface, 'requestWritersInToom');
      chatBoxComponent.getWriterStatusInRoom('78');
      expect(chatMessageInterface.requestWritersInToom).toHaveBeenCalledWith('78');
    });

    it('should call getWriterStatusInRoom from int', () => {
      spyOn(chatMessageInterface, 'getWriterStatusInRoom').and.callThrough();
      chatBoxComponent.getWriterStatusInRoom('78');
      expect(chatMessageInterface.getWriterStatusInRoom).toHaveBeenCalled();
    });

    it('should set writers from int with right params', () => {
      chatBoxComponent.getWriterStatusInRoom('78');
      const expectedKeys = ['_id', 'status', 'pseudo', 'roomId'].sort();
      expect(Object.keys(chatBoxComponent.writers[0]).sort()).toEqual(expectedKeys);
      expect(chatBoxComponent.writers[0]._id).toEqual('78999');
      expect(chatBoxComponent.writers.length).toEqual(2);
      expect(chatBoxComponent.writers[0].status).toEqual(true);
      expect(chatBoxComponent.writers[0].pseudo).toEqual('samet');
      expect(chatBoxComponent.writers[0].roomId).toEqual('aze');
      expect(chatBoxComponent.writers[1]._id).toEqual('4566');
      expect(chatBoxComponent.writers[1].status).toEqual(true);
      expect(chatBoxComponent.writers[1].pseudo).toEqual('yasmine');
      expect(chatBoxComponent.writers[1].roomId).toEqual('aze');
    });

    it('should set writers filtred ', () => {
      chatBoxComponent.userId = '4566';
      chatBoxComponent.getWriterStatusInRoom('78');
      expect(chatBoxComponent.writers.length).toEqual(1);
    });
  });

  describe('HTML DOM test', () => {
    describe('chat bloc', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('should show messageScroll elem', () => {
        const messageScroll = fixture.debugElement.queryAll(By.css('.messages-scroll-container'));
        expect(messageScroll).toBeTruthy();
      });

      it('should point to directive scroll-event', () => {
        const messageScroll = fixture.nativeElement.querySelector('.messages-scroll-container');
        expect(messageScroll.getAttribute('appScrollEvent')).not.toEqual(null);
      });

      it('should call loadMoreMessages', () => {
        spyOn(chatBoxComponent, 'loadMoreMessages');
        const messageScroll = fixture.debugElement.query(By.css('.messages-scroll-container'));
        messageScroll.triggerEventHandler('scrollTopEvent', 'test');
        fixture.detectChanges();
        expect(chatBoxComponent.loadMoreMessages).toHaveBeenCalled();
      });

      it('should call scrollToBottomEvent', () => {
        spyOn(chatBoxComponent, 'scrollToBottomEvent');
        const messageScroll = fixture.debugElement.query(By.css('.messages-scroll-container'));
        messageScroll.triggerEventHandler('isScrollBottom', true);
        fixture.detectChanges();
        expect(chatBoxComponent.scrollToBottomEvent).toHaveBeenCalledWith(true);
      });

      it('should show loader', () => {
        chatBoxComponent.isLoading = true;
        fixture.detectChanges();
        const loader = fixture.nativeElement.querySelector('.loader');
        fixture.detectChanges();
        expect(loader).toBeTruthy();
      });

      it('should not show loader', () => {
        chatBoxComponent.isLoading = false;
        fixture.detectChanges();
        const loader = fixture.nativeElement.querySelector('.loader');
        fixture.detectChanges();
        expect(loader).toBeFalsy();
      });

      it('should show chat blocs', () => {
        const messageBlocs = fixture.debugElement.queryAll(By.css('.message-bloc'));
        expect(messageBlocs.length).toEqual(2);
      });

      it('should add class is-user-msg if user message', () => {
        chatBoxComponent.userId = 'popoe';
        fixture.detectChanges();
        const chatBlocs = fixture.debugElement.queryAll(By.css('.message-bloc'));
        expect(chatBlocs[0].nativeElement.classList.contains('is-user-msg')).toBeTruthy();
        expect(chatBlocs[1].nativeElement.classList.contains('is-user-msg')).toBeFalsy();
      });

      it('should contain author def', () => {
        const chatBloc = fixture.debugElement.queryAll(By.css('.message-bloc .author-def'));
        expect(chatBloc[0].nativeElement.textContent.trim()).toEqual('yasmin');
        expect(chatBloc[1].nativeElement.textContent.trim()).toEqual('samet');
      });

      it('should contain date-text', () => {
        const chatBloc = fixture.debugElement.queryAll(By.css('.message-bloc .date-text'));
        expect(chatBloc[0].nativeElement.textContent.trim()).toEqual('11:35');
        expect(chatBloc[1].nativeElement.textContent.trim()).toEqual('11:55');
      });

      it('should contain message', () => {
        const chatBloc = fixture.debugElement.queryAll(By.css('.message-bloc .message-text'));
        expect(chatBloc[0].nativeElement.textContent.trim()).toEqual('hello there');
        expect(chatBloc[1].nativeElement.textContent.trim()).toEqual('hello');
      });
    });

    describe('new messages button', () => {
      it('should show new messages button', () => {
        chatBoxComponent.showNewMessagesAlert = true;
        fixture.detectChanges();
        const newMessages = fixture.nativeElement.querySelector('.new-messages');
        expect(newMessages).toBeTruthy();
      });

      it('should not show new messages button', () => {
        chatBoxComponent.showNewMessagesAlert = false;
        fixture.detectChanges();
        const newMessages = fixture.nativeElement.querySelector('.new-messages');
        expect(newMessages).toBeFalsy();
      });

      it('should contain message new Messages', () => {
        chatBoxComponent.showNewMessagesAlert = true;
        fixture.detectChanges();
        const newMessages = fixture.nativeElement.querySelector('.new-messages');
        expect(newMessages.textContent.trim()).toEqual('New messages');
      });

      it('should contain icon', () => {
        chatBoxComponent.showNewMessagesAlert = true;
        fixture.detectChanges();
        const newMessagesIcn = fixture.nativeElement.querySelector('.new-messages i.chev-down-icn');
        expect(newMessagesIcn).toBeTruthy();
      });
    });

    describe('writer bloc', () => {
      beforeEach(() => {
        chatBoxComponent.writers = ChatMessagesSpecHelper.usersInRoom;
        fixture.detectChanges();
      });
      it('should not show writers bloc', () => {
        chatBoxComponent.writers = [];
        fixture.detectChanges();
        const writerBloc = fixture.nativeElement.querySelector('.writer-box');
        expect(writerBloc).toBeFalsy();
      });

      it('should show writers bloc', () => {
        const writerBloc = fixture.nativeElement.querySelector('.writer-box');
        expect(writerBloc).toBeTruthy();
      });

      it('should show writers in writer bloc with two writers', () => {
        const writerBloc = fixture.nativeElement.querySelector('.writer-box');
        expect(writerBloc.textContent.trim()).toEqual('samet  , and yasmine are writing ...');
      });

      it('should show writers in writer bloc with only one writer', () => {
        chatBoxComponent.writers = [ChatMessagesSpecHelper.usersInRoom[0]];
        fixture.detectChanges();
        const writerBloc = fixture.nativeElement.querySelector('.writer-box');
        expect(writerBloc.textContent.trim()).toEqual('samet is writing ...');
      });
    });

    describe('textarea bloc', () => {
      it('should show textarea', () => {
        const textArea = fixture.nativeElement.querySelector('textarea');
        expect(textArea).toBeTruthy();
      });

      it('should apply autofocus', () => {
        const textArea = fixture.nativeElement.querySelector('textarea');
        expect(textArea.getAttribute('autofocus')).not.toEqual(null);
      });

      it('should bind message with ng model', () => {
        chatBoxComponent.message = 'Hello';
        fixture.detectChanges();
        const textArea = fixture.nativeElement.querySelector('textarea');
        expect(textArea.getAttribute('ng-reflect-model')).toEqual('Hello');
      });

      it('should call textChanged', () => {
        spyOn(chatBoxComponent, 'textChanged');
        const textArea = fixture.debugElement.query(By.css('textarea'));
        textArea.triggerEventHandler('ngModelChange', 'test');
        fixture.detectChanges();
        expect(chatBoxComponent.textChanged).toHaveBeenCalledWith('test');
      });

      it('should call sendMessage on ke enter', () => {
        spyOn(chatBoxComponent, 'sendMessage');
        const textArea = fixture.debugElement.query(By.css('textarea'));
        textArea.triggerEventHandler('keyup.enter', 'test');
        fixture.detectChanges();
        expect(chatBoxComponent.sendMessage).toHaveBeenCalled();
      });
    });

    describe('send button', () => {
      it('should show send button', () => {
        const sendBtn = fixture.nativeElement.querySelector('.send-btn');
        expect(sendBtn).toBeTruthy();
      });

      it('should call send send button', () => {
        spyOn(chatBoxComponent, 'sendMessage');
        const sendBtn = fixture.nativeElement.querySelector('.send-btn');
        sendBtn.click();
        fixture.detectChanges();
        expect(chatBoxComponent.sendMessage).toHaveBeenCalled();
      });
    });
  });
});
