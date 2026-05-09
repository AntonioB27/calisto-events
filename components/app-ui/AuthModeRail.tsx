"use client";

export type AuthMode = "login" | "register";

type AuthModeRailProps = {
  active: AuthMode;
  /** Called when the user taps “Sign in” (no-op when already on login). */
  onLogin: () => void;
  /** Called when the user taps “Register” (no-op when already on register). */
  onRegister: () => void;
};

export function AuthModeRail({ active, onLogin, onRegister }: AuthModeRailProps) {
  return (
    <div className="auth-mode-rail" data-active-panel={active} role="tablist" aria-label="Choose sign in or register">
      <span className="auth-mode-rail__thumb" aria-hidden />
      <div className="auth-mode-rail__track">
        <button
          type="button"
          role="tab"
          aria-selected={active === "login"}
          id="auth-tab-login"
          className="auth-mode-rail__tab"
          data-active={active === "login" ? "true" : undefined}
          onClick={onLogin}
        >
          <span className="auth-mode-rail__kicker">Welcome back</span>
          <span className="auth-mode-rail__label">Sign in</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "register"}
          id="auth-tab-register"
          className="auth-mode-rail__tab"
          data-active={active === "register" ? "true" : undefined}
          onClick={onRegister}
        >
          <span className="auth-mode-rail__kicker">New to Calisto</span>
          <span className="auth-mode-rail__label">Register</span>
        </button>
      </div>
    </div>
  );
}
