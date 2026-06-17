import { useNavigate } from 'react-router-dom';
import { Button, CameraIcon } from '@/design-system';
import { AuthLayout } from './AuthLayout';
import styles from './wizard.module.css';

// "Government ID Submission" step from the CREATE ACCOUNT frame: capture the front and back of the
// ID. Visual-only preview, since the contract has no document-upload endpoint yet; the dropzones and
// Continue are inert.
export function UploadIdScreen() {
  const navigate = useNavigate();

  return (
    <AuthLayout onBack={() => navigate(-1)}>
      <header className={styles.header}>
        <h1 className={styles.title}>Government ID Submission</h1>
        <p className={styles.subtitle}>
          Ensure you upload a clear photo of your valid national identity card.
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.uploadSection}>
          <span className={styles.uploadLabel}>FRONT OF CARD</span>
          <button type="button" className={styles.dropzone} disabled title="Coming soon">
            <CameraIcon size={32} />
            <span className={styles.dropzoneText}>Tap to capture or upload</span>
          </button>
        </div>

        <div className={styles.uploadSection}>
          <span className={styles.uploadLabel}>BACK OF CARD</span>
          <button type="button" className={styles.dropzone} disabled title="Coming soon">
            <CameraIcon size={32} />
            <span className={styles.dropzoneText}>Upload back Image</span>
          </button>
        </div>

        <p className={styles.uploadHelper}>
          Ensure good lighting. Avoid reflections on the card surface. Make sure all four corners of
          the ID are visible and not blur.
        </p>

        <Button className={styles.continue} fullWidth>
          Continue
        </Button>
      </div>

      <p className={styles.footer}>
        Your data is encrypted and only used for identity verification. We never share your personal
        documents with buyers.
      </p>
    </AuthLayout>
  );
}
