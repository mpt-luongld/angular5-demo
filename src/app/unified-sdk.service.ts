import { Injectable } from '@angular/core';

declare const OmiccUnifiedSDK: any;

@Injectable()
export class UnifiedSdkService {
  private sdk: any;

  constructor() {
    this.sdk = OmiccUnifiedSDK.UnifiedSDK.getInstance();
  }

  async initialize(config: any): Promise<void> {
    await this.sdk.initialize({
      vendor: OmiccUnifiedSDK.VendorType.MPCC,
      orgId: config.realm,
      vendorConfig: {
        vendor: OmiccUnifiedSDK.VendorType.MPCC,
        version: 'v1',
        serverUrl: config.serverUrl,
        user: config.user,
        password: config.password,
        realm: config.realm,
        mediaConfig: {
          audio: true,
          video: false
        }
      },
      logger: {
        type: 'console'
      }
    });
  }

  onEvent(eventType: string, callback: (event: any) => void): void {
    this.sdk.on(eventType, callback);
  }

  async makeCall(destination: string): Promise<any> {
    return this.sdk.makeCall({ destination });
  }

  async hangup(legId: string): Promise<void> {
    return this.sdk.hangup({ legId });
  }

  async mute(legId: string): Promise<void> {
    return this.sdk.mute({ legId });
  }

  async unmute(legId: string): Promise<void> {
    return this.sdk.unmute({ legId });
  }

  getEventTypes() {
    return OmiccUnifiedSDK.UnifiedEventType;
  }

  attachRemoteAudio(id: string) {
    return this.sdk.attachRemoteAudio(id);
  }
}
