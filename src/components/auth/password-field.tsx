"use client";

import { useState } from "react";
import { Icon } from "../icon";
import { Field } from "./field";

type Props = Omit<React.ComponentProps<typeof Field>, "type" | "trailing" | "icon">;

export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      icon="lock"
      trailing={
        <button
          type="button"
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 rounded-full p-1.5 text-text-muted transition-all hover:text-on-surface active:scale-95"
        >
          <Icon name={visible ? "visibility_off" : "visibility"} size={20} />
        </button>
      }
    />
  );
}
