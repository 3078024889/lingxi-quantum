"use client";

import {useRef, useState, type InputHTMLAttributes, type ChangeEvent} from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

/** Keep unfinished text separate from the committed numeric parameter. */
export default function EditableNumberInput({value, onChange, onFocus, onBlur, ...props}: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const lastCommitted = useRef(String(value ?? ""));
  const displayed = draft ?? String(value ?? "");
  return <input {...props} type="number" value={displayed}
    onFocus={event => {
      lastCommitted.current = String(value ?? "");
      setDraft(event.currentTarget.value);
      onFocus?.(event);
    }}
    onChange={event => {
      const text = event.currentTarget.value;
      setDraft(text);
      // Empty and incomplete numbers must never run fallback or clamping handlers.
      if (text.trim() && Number.isFinite(event.currentTarget.valueAsNumber)) {
        lastCommitted.current = text;
        onChange?.(event);
      }
    }}
    onBlur={event => {
      // Commit only after editing; native controls retain mobile numeric keyboards.
      // An empty draft cancels the edit instead of silently executing as zero.
      if (!event.currentTarget.value.trim() || !Number.isFinite(event.currentTarget.valueAsNumber)) {
        event.currentTarget.value = lastCommitted.current;
        onChange?.(event as unknown as ChangeEvent<HTMLInputElement>);
      }
      setDraft(null);
      onBlur?.(event);
    }}
  />;
}
