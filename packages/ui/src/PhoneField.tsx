import { TextField, type TextFieldProps } from './TextField';

/** Egyptian mobile: +20 prefix, then the 10 digits. Accepts Latin and Arabic-Indic digits. */
export function PhoneField(props: Omit<TextFieldProps, 'prefix' | 'type' | 'inputMode' | 'autoComplete' | 'dir'>) {
  return <TextField {...props} prefix="🇪🇬 +20" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10 1234 5678" dir="ltr" />;
}
