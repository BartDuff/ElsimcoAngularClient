import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
document.write(`<link rel="icon" type="image/x-icon" href="../${environment.base}/assets/icons/favicon.ico">`);
document.write(`<Base href=${environment.base}>`);
platformBrowserDynamic().bootstrapModule(AppModule).then(()=>{
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.register('/ngsw-worker.js');
  }
}).catch(err => console.error(err));
