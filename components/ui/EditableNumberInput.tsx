"use client";

import {useEffect,useRef, useState, type InputHTMLAttributes, type ChangeEvent} from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

/** Keep unfinished text separate from the committed numeric parameter. */
export default function EditableNumberInput({value, onChange, onFocus, onBlur, ...props}: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const lastCommitted = useRef(String(value ?? ""));
  const displayed = draft ?? String(value ?? "");
  return <input {...props} type="number" value={displayed} disabled={!ready||props.disabled} data-numeric-ready={ready?'true':'false'}
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
      }else{
        // Commit the final DOM value even when an earlier input event was lost
        // during deferred hydration or rapid native keyboard editing.
        lastCommitted.current=event.currentTarget.value;
        onChange?.(event as unknown as ChangeEvent<HTMLInputElement>);
      }
      setDraft(null);
      onBlur?.(event);
    }}
  />;
}
