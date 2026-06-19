import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, IdCardIcon, Input } from '@/design-system';
import { ChevronDown, CircleCheck, ShieldCheck, StorefrontLayout } from '@/components/storefront';
import { useSession } from '@/app/session';
import { getFarmerKyc } from '@/app/kyc';
import { submitKyc, type SubmitKycInput } from '@/services/auth';
import type { FieldErrors } from '@/services/problemDetails';
import styles from './KycVerifyScreen.module.css';

// The farmer identity-verification (KYC) step at /sell/verify, the destination of the verification
// banner and the selling gate. Signed-in farmers only. It mirrors the CREATE ACCOUNT-4 and -5 frames
// as two steps: identity details (ID type, date of birth, NIN), then the document images (front and
// back of the ID and a photo of the farmer). It submits multipart to POST /api/v1/accounts/me/kyc.
//
// The screen reads verificationStatus from the account: NotSubmitted or Rejected show the form
// (Rejected with the reason and a resubmit), PendingReview shows the under-review state, Verified
// shows the verified state, and Suspended shows an attention state. The API is the sole authority.
const ID_TYPES: { value: number; label: string }[] = [
  { value: 0, label: 'NIN' },
  { value: 1, label: "Voter's Card" },
  { value: 2, label: "Driver's License" },
];
const NIN_PATTERN = /^\d{11}$/;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const KNOWN_FIELDS = ['documentType', 'nin', 'dateOfBirth', 'frontImage', 'backImage', 'photo'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Splits API field errors into the form's fields and a general message, so no server error is lost.
function mapErrors(serverErrors: FieldErrors): {
  fields: Record<string, string>;
  general: string | null;
} {
  const fields: Record<string, string> = {};
  const leftover: string[] = [];
  for (const [key, value] of Object.entries(serverErrors)) {
    if (KNOWN_FIELDS.includes(key)) fields[key] = value;
    else leftover.push(value);
  }
  return { fields, general: leftover.length ? leftover.join(' ') : null };
}

function fileError(file: File | null): string {
  if (!file) return 'Add this image.';
  if (!file.type.startsWith('image/')) return 'Choose an image file.';
  if (file.size > MAX_FILE_BYTES) return 'Image must be 5MB or smaller.';
  return '';
}

export function KycVerifyScreen() {
  const { account, isAuthenticated, updateAccount } = useSession();
  const kyc = getFarmerKyc(account);

  const [step, setStep] = useState<'identity' | 'documents'>('identity');
  const [documentType, setDocumentType] = useState(0);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nin, setNin] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  if (!kyc.isFarmer) {
    return <Navigate to="/" replace />;
  }

  function clearError(field: string) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    if (general) setGeneral(null);
  }

  function continueToDocuments(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!dateOfBirth) next.dateOfBirth = 'Enter your date of birth.';
    else if (dateOfBirth > today()) next.dateOfBirth = 'Date of birth cannot be in the future.';
    if (!NIN_PATTERN.test(nin.trim())) next.nin = 'Your NIN should be 11 digits.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setStep('documents');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const next: Record<string, string> = {};
    next.frontImage = fileError(frontImage);
    next.backImage = fileError(backImage);
    next.photo = fileError(photo);
    const blocking = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    if (Object.keys(blocking).length > 0) {
      setErrors(blocking);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setGeneral(null);

    const input: SubmitKycInput = {
      documentType,
      nin: nin.trim(),
      dateOfBirth,
      frontImage: frontImage as File,
      backImage: backImage as File,
      photo: photo as File,
    };
    const result = await submitKyc(input);
    setSubmitting(false);

    if (!result.ok) {
      const mapped = mapErrors(result.error.fieldErrors);
      setErrors(mapped.fields);
      setGeneral(
        mapped.general ?? (Object.keys(mapped.fields).length ? null : result.error.message),
      );
      // A document error means the problem is on the first step's data or the files; keep the user
      // on the documents step where the file errors show, unless only identity fields failed.
      if (mapped.fields.nin || mapped.fields.dateOfBirth || mapped.fields.documentType) {
        setStep('identity');
      }
      return;
    }

    // Status moves to PendingReview; reflect it so the screen shows the under-review state.
    updateAccount(result.data);
  }

  return (
    <StorefrontLayout showHeaderSearch={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/farmer">Your farm</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Verify your identity</span>
        </nav>

        <div className={styles.card}>
          {kyc.isVerified ? (
            <StatePanel
              ok
              icon={<ShieldCheck size={28} />}
              title="You are verified"
              lead="Your identity has been verified. You can list your produce and sell on FarmersQuest."
              actionTo="/farmer"
              actionLabel="Go to your farm"
            />
          ) : kyc.isPendingReview ? (
            <StatePanel
              ok
              icon={<CircleCheck size={28} />}
              title="Verification in review"
              lead="Thanks. Your details are submitted and under review. We will let you know once your farm is verified."
              actionTo="/farmer"
              actionLabel="Back to your farm"
            />
          ) : kyc.isSuspended ? (
            <StatePanel
              icon={<IdCardIcon size={28} />}
              title="Your verification needs attention"
              lead={
                kyc.reason ??
                'Your verification was withdrawn. Please contact support to keep selling on FarmersQuest.'
              }
              actionTo="/farmer"
              actionLabel="Back to your farm"
            />
          ) : (
            <>
              <header className={styles.header}>
                <span className={styles.stateIcon} aria-hidden="true">
                  <IdCardIcon size={28} />
                </span>
                <h1 className={styles.title}>Verify your identity</h1>
                <p className={styles.lead}>
                  Submit a government ID so buyers can trust your farm. This is required before you
                  can sell.
                </p>
                <p className={styles.stepLabel}>Step {step === 'identity' ? '1' : '2'} of 2</p>
              </header>

              {kyc.isRejected && kyc.reason && (
                <p className={[styles.banner, styles.bannerError].join(' ')} role="alert">
                  Your last submission was not approved: {kyc.reason}
                </p>
              )}
              {general && (
                <p className={[styles.banner, styles.bannerError].join(' ')} role="alert">
                  {general}
                </p>
              )}

              {step === 'identity' ? (
                <form className={styles.form} onSubmit={continueToDocuments} noValidate>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>ID type</span>
                    <span className={styles.selectWrap}>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(Number(e.target.value))}
                      >
                        {ID_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={18} />
                    </span>
                  </label>

                  <Input
                    label="Date of birth"
                    type="date"
                    max={today()}
                    value={dateOfBirth}
                    error={errors.dateOfBirth || ''}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      clearError('dateOfBirth');
                    }}
                  />

                  <Input
                    label="NIN (National Identification Number)"
                    inputMode="numeric"
                    placeholder="11-digit NIN"
                    autoComplete="off"
                    leadingIcon={<IdCardIcon size={24} />}
                    value={nin}
                    error={errors.nin || ''}
                    hint="Your 11-digit National Identification Number."
                    onChange={(e) => {
                      setNin(e.target.value);
                      clearError('nin');
                    }}
                  />

                  <Button type="submit" fullWidth>
                    Continue
                  </Button>
                  <Link to="/farmer" className={styles.secondaryLink}>
                    Do this later
                  </Link>
                </form>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <p className={styles.lead}>
                    Upload clear photos of your {ID_TYPES[documentType]?.label ?? 'ID'} and a photo
                    of yourself.
                  </p>
                  <FileField
                    label="Front of ID"
                    file={frontImage}
                    error={errors.frontImage || ''}
                    onSelect={(f) => {
                      setFrontImage(f);
                      clearError('frontImage');
                    }}
                  />
                  <FileField
                    label="Back of ID"
                    file={backImage}
                    error={errors.backImage || ''}
                    onSelect={(f) => {
                      setBackImage(f);
                      clearError('backImage');
                    }}
                  />
                  <FileField
                    label="Your photo"
                    hint="A clear selfie or passport photo."
                    file={photo}
                    error={errors.photo || ''}
                    onSelect={(f) => {
                      setPhoto(f);
                      clearError('photo');
                    }}
                  />

                  <Button type="submit" fullWidth loading={submitting} loadingLabel="Submitting">
                    {submitting ? 'Submitting' : 'Submit for verification'}
                  </Button>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => setStep('identity')}
                  >
                    Back
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}

function StatePanel({
  ok = false,
  icon,
  title,
  lead,
  actionTo,
  actionLabel,
}: {
  ok?: boolean;
  icon: ReactNode;
  title: string;
  lead: string;
  actionTo: string;
  actionLabel: string;
}) {
  return (
    <div className={styles.state}>
      <span
        className={[styles.stateIcon, ok ? styles.stateIconOk : ''].join(' ')}
        aria-hidden="true"
      >
        {icon}
      </span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
      <Link to={actionTo} className={styles.primaryLink}>
        {actionLabel}
      </Link>
    </div>
  );
}

function FileField({
  label,
  hint,
  file,
  error,
  onSelect,
}: {
  label: string;
  hint?: string;
  file: File | null;
  error: string;
  onSelect: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onSelect(event.target.files?.[0] ?? null);
  }

  return (
    <div className={styles.fileField}>
      <span className={styles.fieldLabel}>{label}</span>
      {hint && <span className={styles.fileHint}>{hint}</span>}
      <label className={[styles.fileDrop, error ? styles.fileDropError : ''].join(' ')}>
        {preview ? (
          <img className={styles.fileThumb} src={preview} alt="" />
        ) : (
          <span className={styles.fileIcon} aria-hidden="true">
            <IdCardIcon size={24} />
          </span>
        )}
        <span className={styles.fileText}>{file ? file.name : 'Tap to choose an image'}</span>
        <input
          className={styles.fileInput}
          type="file"
          accept="image/*"
          aria-label={label}
          onChange={handleChange}
        />
      </label>
      {error && (
        <span className={styles.fileError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
