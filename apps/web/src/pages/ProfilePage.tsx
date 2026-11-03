import { Badge, Button, Card, ListRow, Icon, Skeleton } from '@benben/ui';
import { useNavigate } from 'react-router';
import { useI18n } from '../i18n/I18nProvider';
import { useLatestKyc, useProfile } from '../data';
import { getSupabase } from '../supabase';

export default function ProfilePage() {
  const { t, num, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const profile = useProfile();
  const kyc = useLatestKyc();
  const status = kyc.data?.status;
  const tone = status === 'approved' ? 'ok' : status === 'rejected' ? 'danger' : status === 'pending' ? 'warn' : 'neutral';
  const label = status === 'approved' ? t('kyc.approved') : status === 'rejected' ? t('kyc.rejected') : status === 'pending' ? t('kyc.pending') : t('profile.kyc');

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-h2 text-ink">{t('profile.title')}</h1>
      <Card className="p-0">
        {profile.isLoading ? (
          <div className="p-4"><Skeleton className="h-5 w-40" /></div>
        ) : (
          <>
            <ListRow title={t('profile.phone')} subtitle={profile.data ? `+${num(profile.data.phone)}` : ''} leading={<Icon name="user" />} />
            <ListRow title={t('profile.tier')} trailing={<Badge tone={profile.data?.kyc_tier === 'T0' ? 'neutral' : 'ok'}>{profile.data?.kyc_tier ?? 'T0'}</Badge>} leading={<Icon name="shield" />} />
            <ListRow
              title={t('profile.kyc')}
              leading={<Icon name="id" />}
              trailing={<Badge tone={tone}>{label}</Badge>}
              onClick={() => void navigate('/profile/kyc')}
            />
          </>
        )}
      </Card>
      <Card className="p-0">
        <ListRow
          title={t('profile.language')}
          leading={<Icon name="globe" />}
          trailing={t('profile.langOther')}
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
        />
      </Card>
      <Button variant="secondary" block onClick={() => void getSupabase()?.auth.signOut()}>
        <Icon name="logout" size={18} />
        {t('profile.logout')}
      </Button>
    </div>
  );
}
