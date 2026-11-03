import { EmptyState } from '@benben/ui';
import { useI18n } from '../i18n/I18nProvider';

export default function ComingSoon() {
  const { t } = useI18n();
  return <EmptyState icon="clock" title={t('soon.title')} body={t('soon.body')} />;
}
