import { Injectable, ErrorHandler } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ErrorHelper } from '../_helpers';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService extends ErrorHandler {

  constructor(
    private firebase: FirebaseX,
    private config: ConfigService,
    private errorHelper: ErrorHelper,
  ) {
    super();
  }

  async handleError(error: any): Promise<void> {
    this.firebase.logError("[GLOBAL ERROR HANDLER] " + JSON.stringify(error));
    console.log("GLOBAL error handler ran: ", error);

    if (this.config.debugging)
      this.errorHelper.presentAlert(error);

    super.handleError(error);
  }

}
