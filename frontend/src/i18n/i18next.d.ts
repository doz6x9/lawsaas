import 'react-i18next';
import { resources } from './config';

// react-i18next versions lower than 11.11.0
declare module 'react-i18next' {
  // and extend them!
  interface CustomTypeOptions {
    // custom namespace type if you changed it
    defaultNS: 'translation';
    // custom resources type
    resources: typeof resources['en'];
  }
}
