import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
document.write(`<link rel="icon" type="image/x-icon" href="../${environment.base}/assets/images/logo.ico">`);
document.write(`<Base href=${environment.base}>`);
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
