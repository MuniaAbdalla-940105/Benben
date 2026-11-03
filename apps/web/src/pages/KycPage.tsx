import { toErrorCode } from '@benben/shared';
import { Badge, Button, Card, EmptyState, Icon, Skeleton, useToast } from '@benben/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useLatestKyc } from '../data';
import { useI18n } from '../i18n/I18nProvider';
import { errorKey } from '../i18n/messages';
import { getSupabase } from '../supabase';

type Slot = 'front' | 'back' | 'selfie';
const SLOTS: Slot[] = ['front', 'back', 'selfie'];
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export default function KycPage() {
  const { t } = useI18n();
  const toast = useToast();
  const qc = useQueryClient();
  const { session } = useAuth();
  const kyc = useLatestKyc();
  const [files, setFiles] = useState<Partial<Record<Slot, File>>>({});
  const [retry, setRetry] = useState(false);
  const [busy, setBusy] = useState(false);

  if (kyc.isLoading) return <div className="p-4"><Skeleton className="h-24" /></div>;

  const status = kyc.data?.status;
  if ((status === 'pending' || status === 'approved') || (status === 'rejected' && !retry)) {
    const ok = status === 'approved';
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="font-display text-h2 text-ink">{t('kyc.title')}</h1>
        <EmptyState
          icon={ok ? 'check' : status === 'pending' ? 'clock' : 'alert'}
          title={ok ? t('kyc.approved') : status === 'pending' ? t('kyc.pending') : t('kyc.rejected')}
          body={ok ? t('kyc.approvedBody') : status === 'pending' ? t('kyc.pendingBody') : (kyc.data?.reject_reason ?? '')}
          action={status === 'rejected' ? <Button onClick={() => setRetry(true)}>{t('kyc.retry')}</Button> : undefined}
        />
      </div>
    );
  }

  const ready = SLOTS.every((s) => files[s]);

  const submit = async () => {
    const supabase = getSupabase();
    const uid = session?.user.id;
    if (!supabase || !uid || !ready) return;
    setBusy(true);
    try {
      const paths: Record<Slot, string> = { front: '', back: '', selfie: '' };
      for (const slot of SLOTS) {
        const file = files[slot];
        if (!file) throw new Error('FILES_MISSING');
        const ext = EXT[file.type];
        if (!ext) throw new Error('INVALID_PATH');
        const path = `${uid}/${slot}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const { error } = await supabase.storage.from('kyc-documents').upload(path, file, { contentType: file.type });
        if (error) throw error;
        paths[slot] = path;
      }
      const { error } = await supabase.rpc('kyc_submit', { p_front: paths.front, p_back: paths.back, p_selfie: paths.selfie });
      if (error) throw error;
      setRetry(false);
      await qc.invalidateQueries({ queryKey: ['kyc'] });
    } catch (err) {
      toast(t(errorKey(toErrorCode(err))), 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="font-display text-h2 text-ink">{t('kyc.title')}</h1>
      <p className="text-sm text-ink-muted">{t('kyc.intro')}</p>
      {SLOTS.map((slot) => (
        <Card key={slot} className="flex items-center gap-3">
          <Icon name={slot === 'selfie' ? 'camera' : 'id'} size={24} />
          <span className="flex-1 text-base text-ink">{t(`kyc.${slot}`)}</span>
          {files[slot] ? <Badge tone="ok">{t('kyc.chosen')}</Badge> : null}
          <label className="inline-flex min-h-target cursor-pointer items-center rounded-md border border-line-strong px-4 text-sm font-semibold text-ink focus-within:outline focus-within:outline-2 focus-within:outline-focus">
            {t('kyc.choose')}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              {...(slot === 'selfie' ? { capture: 'user' as const } : {})}
              className="sr-only"
              data-testid={`kyc-file-${slot}`}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFiles((cur) => ({ ...cur, [slot]: f }));
              }}
            />
          </label>
        </Card>
      ))}
      <Button block loading={busy} disabled={!ready} onClick={() => void submit()}>
        {busy ? t('kyc.uploading') : t('kyc.submit')}
      </Button>
    </div>
  );
}
