"use client";
import { useState } from "react";

export default function Input() {
  const [input, setInput] = useState("");
  return (
    <input
      type="text"
      placeholder="input aku"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  );
}
