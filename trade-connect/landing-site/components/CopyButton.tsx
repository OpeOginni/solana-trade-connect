"use client";
import { Copy } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
      }}
    >
      <Copy />
    </button>
  );
}
