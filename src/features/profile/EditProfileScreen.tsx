import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, PhoneIcon, Spinner, UserIcon } from '@/design-system';
import { useSession } from '@/app/session';
import { updateProfile } from '@/services/auth';
import { mapServerToFields } from './mapServerToFields';
import { SettingsLayout } from './SettingsLayout';
import form from './settingsForm.module.css';

// Edit the signed-in user's own profile: full name and phone number, the fields the contract allows.
// Posts to PUT /me and refreshes the session account. The API owns who "me" is, so a user can only
// edit their own profile.
export function EditProfileScreen() {
  const navigate = useNavigate();
  const { account, updateAccount } = useSession();

  const [fullName, setFullName] = useState(account?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(account?.phoneNumber ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (!fullName.trim()) {
      setErrors({ fullName: 'Enter your name.' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setGeneral(null);

    const result = await updateProfile({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim() || null,
    });

    setSubmitting(false);
    if (!result.ok) {
      const mapped = mapServerToFields(result.error.fieldErrors, ['fullName', 'phoneNumber']);
      setErrors(mapped.fields);
      setGeneral(
        mapped.general ?? (Object.keys(mapped.fields).length ? null : result.error.message),
      );
      return;
    }

    if (result.data) {
      updateAccount(result.data);
    } else if (account) {
      updateAccount({ ...account, fullName: fullName.trim(), phoneNumber: phoneNumber.trim() });
    }
    navigate('/profile');
  }

  return (
    <SettingsLayout title="Edit Profile" subtitle="Update your name and phone number.">
      <form className={form.form} onSubmit={handleSubmit} noValidate>
        {general && (
          <p className={[form.banner, form.error].join(' ')} role="alert">
            {general}
          </p>
        )}
        <Input
          label="Full name"
          leadingIcon={<UserIcon />}
          autoComplete="name"
          value={fullName}
          error={errors.fullName || ''}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          leadingIcon={<PhoneIcon />}
          autoComplete="tel"
          value={phoneNumber}
          error={errors.phoneNumber || ''}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? <Spinner label="Saving" /> : 'Save changes'}
        </Button>
      </form>
    </SettingsLayout>
  );
}
