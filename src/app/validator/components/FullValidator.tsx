"use client";

import { SyntaxValidator } from "./SyntaxValidator";

type FullValidatorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export function FullValidator({ value, onChange }: FullValidatorProps = {}) {
  return (
    <div className="space-y-8">
      <SyntaxValidator value={value} onChange={onChange} />
    </div>
  );
}
