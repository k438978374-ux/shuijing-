import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Gem, LockKeyhole } from "lucide-react";

const ACCESS_STORAGE_KEY = "crystal-inventory-access";

interface AccessGateProps {
  password: string;
  children: ReactNode;
}

export function AccessGate({ password, children }: AccessGateProps) {
  const enabled = password.trim().length > 0;
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [granted, setGranted] = useState(() => !enabled || localStorage.getItem(ACCESS_STORAGE_KEY) === "granted");
  const helperText = useMemo(
    () => (enabled ? "输入密码后进入库存系统" : "当前未设置访问密码"),
    [enabled]
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (value === password) {
      localStorage.setItem(ACCESS_STORAGE_KEY, "granted");
      setGranted(true);
      setError("");
      return;
    }

    setError("密码不对，请再试一次");
  }

  if (granted) {
    return <>{children}</>;
  }

  return (
    <main className="access-shell">
      <section className="access-panel">
        <div className="access-brand">
          <div className="access-brand-icon">
            <Gem size={22} />
          </div>
          <div>
            <strong>水晶库存系统</strong>
            <p>{helperText}</p>
          </div>
        </div>
        <form className="form-grid access-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>访问密码</span>
            <input
              autoComplete="current-password"
              type="password"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="请输入密码"
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            进入系统
          </button>
        </form>
        <div className="access-hint">
          <LockKeyhole size={14} />
          <span>这是轻量访问密码，适合先拦一下公开访问。</span>
        </div>
      </section>
    </main>
  );
}
