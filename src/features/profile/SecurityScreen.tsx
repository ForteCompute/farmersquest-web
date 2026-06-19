import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, ConfirmDialog, LockIcon, PasswordInput } from '@/design-system';
import { changePassword } from '@/services/auth';
import { mapServerToFields } from './mapServerToFields';
import { SettingsLayout } from './SettingsLayout';
import form from './settingsForm.module.css';

// Change the signed-in user's password. Changing a password is sensitive, so a confirmation is shown
// before the change is sent. Posts to /me/change-password with the current and new password; the API
// verifies the current password and is the sole authority.
const MIN_PASSWORD_LENGTH = 8;

export function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!currentPassword) {
      next.currentPassword = 'Enter your current password.';
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      next.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (newPassword !== confirmNew) {
      next.confirmNew = 'Passwords do not match.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    setGeneral(null);
    if (validate()) {
      // Confirm before applying a sensitive change.
      setConfirming(true);
    }
  }

  async function handleConfirm() {
    setConfirming(false);
    setSubmitting(true);
    const result = await changePassword({ currentPassword, newPassword });
    setSubmitting(false);
    if (!result.ok) {
      const mapped = mapServerToFields(result.error.fieldErrors, [
        'currentPassword',
        'newPassword',
      ]);
      setErrors(mapped.fields);
      setGeneral(
        mapped.general ?? (Object.keys(mapped.fields).length ? null : result.error.message),
      );
      return;
    }
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNew('');
  }

  return (
    <SettingsLayout title="Security & Password" subtitle="Change your password.">
      <form className={form.form} onSubmit={handleSubmit} noValidate>
        {general && (
          <p className={[form.banner, form.error].join(' ')} role="alert">
            {general}
          </p>
        )}
        {success && (
          <p className={[form.banner, form.success].join(' ')} role="status">
            Your password has been changed.
          </p>
        )}
        <PasswordInput
          label="Current password"
          leadingIcon={<LockIcon />}
          autoComplete="current-password"
          value={currentPassword}
          error={errors.currentPassword || ''}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <PasswordInput
          label="New password"
          leadingIcon={<LockIcon />}
          autoComplete="new-password"
          value={newPassword}
          error={errors.newPassword || ''}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordInput
          label="Confirm new password"
          leadingIcon={<LockIcon />}
          autoComplete="new-password"
          value={confirmNew}
          error={errors.confirmNew || ''}
          onChange={(e) => setConfirmNew(e.target.value)}
        />
        <Button type="submit" fullWidth loading={submitting} loadingLabel="Saving">
          {submitting ? 'Saving' : 'Change password'}
        </Button>
      </form>

      <ConfirmDialog
        open={confirming}
        title="Change your password?"
        message="You will use the new password the next time you sign in."
        confirmLabel="Change password"
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </SettingsLayout>
  );
}
