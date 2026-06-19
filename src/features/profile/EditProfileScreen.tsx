import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, PhoneIcon, UserIcon } from '@/design-system';
import { useSession } from '@/app/session';
import { updateProfile, type UpdateProfileInput } from '@/services/auth';
import { mapServerToFields } from './mapServerToFields';
import { SettingsLayout } from './SettingsLayout';
import form from './settingsForm.module.css';

// Edit the signed-in user's own profile. Everyone can edit their name, phone, and location; farmers
// can also edit their farm name and primary crops. Posts to PUT /me and refreshes the session
// account. The API owns who "me" is and re-validates every field, so a user only ever edits their
// own profile. Live validation, inline errors, and loading, success, and error states.
const KNOWN_FIELDS = ['fullName', 'phoneNumber', 'state', 'region', 'farmName', 'crops'];

export function EditProfileScreen() {
  const { account, role, updateAccount } = useSession();
  const isFarmer = role === 'farmer';

  const [fullName, setFullName] = useState(account?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(account?.phoneNumber ?? '');
  const [state, setState] = useState(account?.state ?? '');
  const [region, setRegion] = useState(account?.region ?? '');
  const [farmName, setFarmName] = useState(account?.farmName ?? '');
  const [crops, setCrops] = useState((account?.crops ?? []).join(', '));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = fullName.trim() !== '';

  function clearStatus() {
    if (general) setGeneral(null);
    if (success) setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!isValid) {
      setErrors({ fullName: 'Enter your name.' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    setGeneral(null);
    setSuccess(false);

    const body: UpdateProfileInput = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim() || null,
      state: state.trim() || null,
      region: region.trim() || null,
    };
    if (isFarmer) {
      body.farmName = farmName.trim() || null;
      body.crops = crops
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    }

    const result = await updateProfile(body);
    setSubmitting(false);

    if (!result.ok) {
      const mapped = mapServerToFields(result.error.fieldErrors, KNOWN_FIELDS);
      setErrors(mapped.fields);
      setGeneral(
        mapped.general ?? (Object.keys(mapped.fields).length ? null : result.error.message),
      );
      return;
    }

    if (result.data) {
      updateAccount(result.data);
    } else if (account) {
      updateAccount({ ...account, ...body });
    }
    setSuccess(true);
  }

  return (
    <SettingsLayout
      title="Edit profile"
      subtitle={
        isFarmer
          ? 'Update your name, contact, location, and farm details.'
          : 'Update your name, contact, and location.'
      }
    >
      <form className={form.form} onSubmit={handleSubmit} noValidate>
        {general && (
          <p className={[form.banner, form.error].join(' ')} role="alert">
            {general}
          </p>
        )}
        {success && (
          <p className={[form.banner, form.success].join(' ')} role="status">
            Your profile has been saved.{' '}
            <Link className={form.bannerLink} to="/profile">
              Back to account
            </Link>
          </p>
        )}

        <Input
          label="Full name"
          leadingIcon={<UserIcon />}
          autoComplete="name"
          value={fullName}
          error={errors.fullName || ''}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
            clearStatus();
          }}
        />
        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          leadingIcon={<PhoneIcon />}
          autoComplete="tel"
          placeholder="08030000000"
          value={phoneNumber}
          error={errors.phoneNumber || ''}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            clearStatus();
          }}
        />
        <div className={form.row}>
          <Input
            label="State"
            autoComplete="address-level1"
            value={state}
            error={errors.state || ''}
            onChange={(e) => {
              setState(e.target.value);
              clearStatus();
            }}
          />
          <Input
            label="Region or town"
            autoComplete="address-level2"
            value={region}
            error={errors.region || ''}
            onChange={(e) => {
              setRegion(e.target.value);
              clearStatus();
            }}
          />
        </div>

        {isFarmer && (
          <>
            <Input
              label="Farm name"
              value={farmName}
              error={errors.farmName || ''}
              onChange={(e) => {
                setFarmName(e.target.value);
                clearStatus();
              }}
            />
            <Input
              label="Primary crops"
              placeholder="Maize, Cassava, Yam"
              hint="Separate crops with a comma."
              value={crops}
              error={errors.crops || ''}
              onChange={(e) => {
                setCrops(e.target.value);
                clearStatus();
              }}
            />
          </>
        )}

        <Button
          type="submit"
          fullWidth
          disabled={!isValid}
          loading={submitting}
          loadingLabel="Saving"
        >
          {submitting ? 'Saving' : 'Save changes'}
        </Button>
      </form>
    </SettingsLayout>
  );
}
