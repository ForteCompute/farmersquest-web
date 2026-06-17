import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Checkbox, Spinner } from '@/design-system';
import { useSession } from '@/app/session';
import { updateNotificationPreferences } from '@/services/auth';
import { SettingsLayout } from './SettingsLayout';
import form from './settingsForm.module.css';

// Manage the signed-in user's own notification preferences (email, SMS, WhatsApp). Posts to
// PUT /me/notification-preferences and reflects the result on the session account.
export function NotificationsScreen() {
  const { account, updateAccount } = useSession();
  const prefs = account?.notificationPreferences;

  const [email, setEmail] = useState(prefs?.email ?? false);
  const [sms, setSms] = useState(prefs?.sms ?? false);
  const [whatsApp, setWhatsApp] = useState(prefs?.whatsApp ?? false);
  const [general, setGeneral] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setGeneral(null);
    setSuccess(false);

    const result = await updateNotificationPreferences({ email, sms, whatsApp });
    setSubmitting(false);
    if (!result.ok) {
      setGeneral(result.error.message);
      return;
    }
    if (result.data) {
      updateAccount(result.data);
    } else if (account) {
      updateAccount({ ...account, notificationPreferences: { email, sms, whatsApp } });
    }
    setSuccess(true);
  }

  return (
    <SettingsLayout title="Notifications" subtitle="Choose how we reach you.">
      <form className={form.form} onSubmit={handleSubmit} noValidate>
        {general && (
          <p className={[form.banner, form.error].join(' ')} role="alert">
            {general}
          </p>
        )}
        {success && (
          <p className={[form.banner, form.success].join(' ')} role="status">
            Your preferences have been saved.
          </p>
        )}
        <div className={form.toggles}>
          <div className={form.toggleRow}>
            <Checkbox label="Email" checked={email} onChange={(e) => setEmail(e.target.checked)} />
            <span className={form.toggleHint}>Order updates and account notices by email.</span>
          </div>
          <div className={form.toggleRow}>
            <Checkbox label="SMS" checked={sms} onChange={(e) => setSms(e.target.checked)} />
            <span className={form.toggleHint}>Text messages to your phone number.</span>
          </div>
          <div className={form.toggleRow}>
            <Checkbox
              label="WhatsApp"
              checked={whatsApp}
              onChange={(e) => setWhatsApp(e.target.checked)}
            />
            <span className={form.toggleHint}>Messages on WhatsApp.</span>
          </div>
        </div>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? <Spinner label="Saving" /> : 'Save preferences'}
        </Button>
      </form>
    </SettingsLayout>
  );
}
