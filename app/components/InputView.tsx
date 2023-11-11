"use client";

import { Input } from "@material-tailwind/react";

type Props = {
  value: string;
  label: string;
  setVale: (value: string) => void;
};
export default function SelectView({ value, label, setVale }: Props) {
  return (
    <div className="flex">
      <Input
        label={label}
        value={value}
        onChange={(event) => setVale(event.target.value)}
        crossOrigin={undefined}
      />
    </div>
  );
}
