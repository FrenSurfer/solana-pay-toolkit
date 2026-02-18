"use client";

import { useState } from "react";
import { FullValidator } from "./FullValidator";
import { QRUpload } from "./QRUpload";

export function ValidatorView() {
  const [urlInput, setUrlInput] = useState("");

  return (
    <div className="space-y-8">
      <QRUpload onDecode={setUrlInput} />
      <FullValidator value={urlInput} onChange={setUrlInput} />
    </div>
  );
}
