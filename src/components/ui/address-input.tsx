"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "./input";
import { isValidPublicKey } from "@/lib/solana/validation";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

const ADDRESS_ERROR_REQUIRED = "Address is required";
const ADDRESS_ERROR_MIN_LENGTH = "Address must be at least 32 characters";
const ADDRESS_ERROR_MAX_LENGTH = "Address must be at most 44 characters";

interface AddressInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "onChange" | "value"
  > {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidAddress?: (address: string) => void;
}

export function AddressInput({
  onValidAddress,
  className,
  value: controlledValue,
  onChange: controlledOnChange,
  onBlur: propsOnBlur,
  required,
  ...props
}: AddressInputProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState("");
  const value = controlledValue ?? uncontrolledValue;
  const debouncedValue = useDebounce(value, DEBOUNCE_MS);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const isChecking =
    value.length >= 32 && value !== debouncedValue;

  useEffect(() => {
    if (debouncedValue.length >= 32) {
      const valid = isValidPublicKey(debouncedValue);
      setIsValid(valid);
      if (valid) onValidAddress?.(debouncedValue);
    } else {
      setIsValid(null);
    }
  }, [debouncedValue, onValidAddress]);

  const setAddressValidity = (el: HTMLInputElement, v: string) => {
    if (v === "") {
      el.setCustomValidity(required ? ADDRESS_ERROR_REQUIRED : "");
    } else if (v.length < 32) {
      el.setCustomValidity(ADDRESS_ERROR_MIN_LENGTH);
    } else if (v.length > 44) {
      el.setCustomValidity(ADDRESS_ERROR_MAX_LENGTH);
    } else {
      el.setCustomValidity("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const el = e.currentTarget;
    setAddressValidity(el, v);
    if (controlledOnChange) controlledOnChange(e);
    else setUncontrolledValue(v);
    if (v.length < 32) setIsValid(null);
  };

  return (
    <div className="relative">
      <Input
        {...props}
        required={required}
        value={controlledValue ?? uncontrolledValue}
        onChange={handleChange}
        onBlur={(e) => {
          setAddressValidity(e.currentTarget, e.currentTarget.value);
          propsOnBlur?.(e);
        }}
        className={cn(
          className,
          isValid === true && "border-green-500 pr-20 focus-visible:border-green-500",
          isValid === false && "border-red-500 pr-20 focus-visible:border-red-500"
        )}
      />
      {isChecking && (
        <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          Checking...
        </span>
      )}
      {!isChecking && isValid !== null && (
        <span
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium",
            isValid ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
          )}
        >
          {isValid ? "✓ Valid" : "✗ Invalid"}
        </span>
      )}
    </div>
  );
}
