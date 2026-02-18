"use client";

import { useState } from "react";
import { Input } from "./input";
import { isValidPublicKey } from "@/lib/solana/validation";
import { cn } from "@/lib/utils";

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
  ...props
}: AddressInputProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState("");
  const value = controlledValue ?? uncontrolledValue;
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (controlledOnChange) controlledOnChange(e);
    else setUncontrolledValue(v);

    if (v.length >= 32) {
      const valid = isValidPublicKey(v);
      setIsValid(valid);
      if (valid) onValidAddress?.(v);
    } else {
      setIsValid(null);
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        value={controlledValue ?? uncontrolledValue}
        onChange={handleChange}
        className={cn(
          className,
          isValid === true && "border-green-500 focus-visible:border-green-500",
          isValid === false && "border-red-500 focus-visible:border-red-500"
        )}
      />
      {isValid !== null && (
        <span
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
            isValid ? "text-green-500" : "text-red-500"
          )}
        >
          {isValid ? "✓ Valid" : "✗ Invalid"}
        </span>
      )}
    </div>
  );
}
