import { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { NIGERIA_PHONE_CODE } from "@/lib/phone";

export function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [number, setNumber] = useState("");

  useEffect(() => {
    if (!value) return;
    setNumber(value.replace(NIGERIA_PHONE_CODE, ""));
  }, [value]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");

    if (raw.startsWith("0")) {
      raw = raw.replace(/^0+/, "");
    }

    raw = raw.slice(0, 10);
    setNumber(raw);
    onChange(`${NIGERIA_PHONE_CODE}${raw}`);
  };

  return (
    <div>
      <label className="block- mb-2 hidden">
        <Paragraph1 className="text-sm font-medium text-gray-800">
          Phone Number
        </Paragraph1>
      </label>

      <div className="relative flex border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-black">
        <span className="flex items-center px-4 border-r border-gray-300 text-gray-900">
          {NIGERIA_PHONE_CODE}
        </span>

        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          placeholder="8080808080"
          maxLength={11}
          className="w-full p-4 outline-none"
        />
      </div>
    </div>
  );
}
