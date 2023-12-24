import { Injectable } from '@angular/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token, } from '@capacitor/push-notifications';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  constructor() {

   }


   pushNotification() {

    console.log('Iniciando Registro HomePage');

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      // alert('Registro push exitoso, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      // alert('Error de registro: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // alert('Push recivido: ' + JSON.stringify(notification));
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // alert('Push acción realizada: ' + JSON.stringify(notification));
      },
    );
  }

  }

