"use client";

import { Select, Option } from "@material-tailwind/react";

type Props = {
  defaultTitle?: string;
  title?: string;
  items: string[];
  onItemPress: (item: string) => void;
};
export default function SelectView({
  defaultTitle,
  title,
  items,
  onItemPress,
}: Props) {
  return (
    <div className="flex">
      <Select label={defaultTitle || title}>
        {items.map((item) => (
          <Option key={item} onClick={() => onItemPress(item)}>
            {item}
          </Option>
        ))}
      </Select>
    </div>
  );
}
