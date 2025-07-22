import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  constructor(private platform: Platform) {}

  async pushNotification(): Promise<void> {
    if (this.platform.is('capacitor')) {
      try {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive === 'granted') {
          await PushNotifications.register();
        }
      } catch (error) {
        console.error('Error en PushNotifications:', error);
        throw error;
      }
    }
  }
}