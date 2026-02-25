import { Component, OnInit } from '@angular/core';
import { UnifiedSdkService } from './unified-sdk.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Angular 5 + UnifiedSDK Demo</h1>
      
      <div class="config-section" *ngIf="!isConnected">
        <h2>Configuration</h2>
        <div class="form-group">
          <label>WebSocket URL:</label>
          <input [(ngModel)]="config.serverUrl" placeholder="wss://voice.metechvn.com:7443">
        </div>
        <div class="form-group">
          <label>User:</label>
          <input [(ngModel)]="config.user" placeholder="100000">
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" [(ngModel)]="config.password" placeholder="password">
        </div>
        <div class="form-group">
          <label>Realm:</label>
          <input [(ngModel)]="config.realm" placeholder="demo.metechvn.com">
        </div>
        <button (click)="connect()" [disabled]="isConnecting">
          {{ isConnecting ? 'Connecting...' : 'Connect' }}
        </button>
      </div>

      <div class="call-section" *ngIf="isConnected">
        <h2>Call Controls</h2>
        <div class="form-group">
          <label>Destination:</label>
          <input [(ngModel)]="destination" placeholder="0817720890" [disabled]="currentCall">
        </div>
        <button (click)="makeCall()" [disabled]="!destination || currentCall">Call</button>
        <button (click)="disconnect()" class="btn-disconnect">Disconnect</button>
        
        <div class="call-info" *ngIf="currentCall">
          <p><strong>Status:</strong> {{ currentCall.state }}</p>
          <p><strong>Leg ID:</strong> {{ currentCall.legId }}</p>
          <div class="call-actions">
            <button (click)="hangup()">Hangup</button>
            <button (click)="mute()">Mute</button>
            <button (click)="unmute()">Unmute</button>
          </div>
        </div>
      </div>

      <div class="events-section">
        <h2>Events Log</h2>
        <button (click)="clearEvents()">Clear</button>
        <div class="events-list">
          <div *ngIf="events.length === 0" class="no-events">No events yet</div>
          <div *ngFor="let event of events" class="event-item">
            <div class="event-header">
              <span class="event-type">{{ event.type }}</span>
              <span class="event-time">{{ event.time }}</span>
            </div>
            <pre>{{ event.data }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 20px auto; padding: 20px; font-family: Arial, sans-serif; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 20px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
    .form-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    button { padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.btn-disconnect { background: #dc3545; }
    .call-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px; }
    .call-actions button { background: #28a745; }
    .events-section { margin-top: 30px; }
    .events-list { max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
    .event-item { margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
    .event-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .event-type { font-weight: bold; color: #007bff; }
    .event-time { color: #666; font-size: 0.9em; }
    .no-events { text-align: center; color: #999; padding: 20px; }
    pre { background: #2d2d2d; color: #f8f8f2; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 0.85em; }
  `]
})
export class AppComponent implements OnInit {
  config = {
    serverUrl: 'wss://voice.metechvn.com:7443',
    user: '100000',
    password: 'YzIyNGJhMjJiYWMzMmE4ZjY=',
    realm: 'superxayah.metechvn.com',
  };

  isConnected = false;
  isConnecting = false;
  destination = '';
  currentCall: any = null;
  events: any[] = [];

  constructor(private sdkService: UnifiedSdkService) { }

  ngOnInit() {
    const eventTypes = this.sdkService.getEventTypes();

    this.sdkService.onEvent(eventTypes.SDK_READY, (event: any) => {
      this.addEvent('SDK_READY', event);
      this.isConnected = true;
      this.isConnecting = false;
      this.sdkService.attachRemoteAudio('audio-element');
    });

    this.sdkService.onEvent(eventTypes.CALL_CREATED, (event: any) => {
      this.addEvent('CALL_CREATED', event);
      this.currentCall = { legId: event.legId, state: 'RINGING' };
    });

    this.sdkService.onEvent(eventTypes.CALL_PROGRESSING, (event: any) => {
      this.addEvent('CALL_PROGRESSING', event);
      this.currentCall = { legId: event.legId, state: 'RINGING' };
    });

    this.sdkService.onEvent(eventTypes.CALL_CONNECTED, (event: any) => {
      this.addEvent('CALL_CONNECTED', event);
      if (this.currentCall) {
        this.currentCall.state = 'CONNECTED';
      }
    });

    this.sdkService.onEvent(eventTypes.CALL_ENDED, (event: any) => {
      this.addEvent('CALL_ENDED', event);
      this.currentCall = null;
    });

    this.sdkService.onEvent(eventTypes.CALL_MUTED, (event: any) => {
      this.addEvent('CALL_MUTED', event);
    });

    this.sdkService.onEvent(eventTypes.CALL_UNMUTED, (event: any) => {
      this.addEvent('CALL_UNMUTED', event);
    });
  }

  async connect() {
    this.isConnecting = true;
    try {
      await this.sdkService.initialize(this.config);
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Connection failed: ' + error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    this.isConnected = false;
    this.currentCall = null;
    this.events = [];
  }

  async makeCall() {
    try {
      await this.sdkService.makeCall(this.destination);
    } catch (error) {
      console.error('Failed to make call:', error);
      alert('Call failed: ' + error);
    }
  }

  async hangup() {
    if (this.currentCall) {
      try {
        await this.sdkService.hangup(this.currentCall.legId);
      } catch (error) {
        console.error('Failed to hangup:', error);
      }
    }
  }

  async mute() {
    if (this.currentCall) {
      try {
        await this.sdkService.mute(this.currentCall.legId);
      } catch (error) {
        console.error('Failed to mute:', error);
      }
    }
  }

  async unmute() {
    if (this.currentCall) {
      try {
        await this.sdkService.unmute(this.currentCall.legId);
      } catch (error) {
        console.error('Failed to unmute:', error);
      }
    }
  }

  addEvent(type: string, data: any) {
    this.events.unshift({
      type,
      time: new Date().toLocaleTimeString(),
      data: JSON.stringify(data, null, 2)
    });
    if (this.events.length > 50) {
      this.events.pop();
    }
  }

  clearEvents() {
    this.events = [];
  }
}
