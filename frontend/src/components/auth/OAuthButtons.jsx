import { Button } from 'react-bootstrap';
import styles from '@styles/auth/OAuth.module.css';

function OAuthButtons({ onClick, buttons = [
  { label: 'Continue with Google', provider: 'google' },
  { label: 'Continue with Apple', provider: 'apple' },

] }) 

{
  return (
    <div className={`${styles.oauthContainer} d-grid gap-2`}>
      {buttons.map((button) => (
        <Button
          key={button.provider}
          variant=""
          className={`${styles.oauthButton} w-100`}
          onClick={onClick}
        >
          <i className={`bi bi-${button.provider} me-2`}></i>
          {button.label}
        </Button>
      ))}
    </div>
  );
}

export default OAuthButtons;