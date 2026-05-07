type AppBtnVariant = 'primary' | 'gold' | 'ghost' | 'white';

type AppBtnProps = {
  children: React.ReactNode;
  variant?: AppBtnVariant;
  onClick?: () => void;
  small?: boolean;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const VARIANTS: Record<AppBtnVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
    color: '#fff',
    boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
    border: 'none',
  },
  gold: {
    background: 'transparent',
    color: 'var(--app-gold)',
    border: '1.5px solid var(--app-gold)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--app-muted)',
    border: '1.5px solid var(--app-border)',
  },
  white: {
    background: 'var(--app-card)',
    color: 'var(--app-text)',
    border: '1.5px solid var(--app-border)',
  },
};

export function AppBtn({ children, variant = 'primary', onClick, small, style = {}, icon, type = 'button', disabled }: AppBtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: small ? 10 : 14,
        padding: small ? '9px 18px' : '15px 28px',
        fontSize: small ? 13 : 15,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.18s',
        letterSpacing: '0.01em',
        opacity: disabled ? 0.6 : 1,
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {icon && icon}{children}
    </button>
  );
}
