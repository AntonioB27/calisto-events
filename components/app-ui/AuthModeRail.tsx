"use client";

import type { AppUiDict } from "@/lib/app-ui/en";

export type AuthMode = "login" | "register";

export type AuthModeRailCopy = Pick<AppUiDict["authRail"], "aria" | "loginKicker" | "loginLabel" | "registerKicker" | "registerLabel">;

type AuthModeRailProps = Readonly<{
  active: AuthMode;
  /** Called when the user taps “Sign in” (no-op when already on login). */
  onLogin: () => void;
  /** Called when the user taps “Register” (no-op when already on register). */
  onRegister: () => void;
  copy: AuthModeRailCopy;
}>;

export function AuthModeRail({ active, onLogin, onRegister, copy }: AuthModeRailProps) {
  return (
    <div className="auth-mode-rail" data-active-panel={active} role="tablist" aria-label={copy.aria}>
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
          <span className="auth-mode-rail__kicker">{copy.loginKicker}</span>
          <span className="auth-mode-rail__label">{copy.loginLabel}</span>
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
          <span className="auth-mode-rail__kicker">{copy.registerKicker}</span>
          <span className="auth-mode-rail__label">{copy.registerLabel}</span>
        </button>
      </div>
    </div>
  );
}
