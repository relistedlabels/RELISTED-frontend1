import { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ChevronDown } from "lucide-react";

const COUNTRIES = [
  { name: "Nigeria", code: "+234", iso: "NG" },
  { name: "Ghana", code: "+233", iso: "GH" },
  { name: "Kenya", code: "+254", iso: "KE" },
];

export function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);

  /**
   * 🔁 Sync UI from store value
   */
  useEffect(() => {
    if (!value) return;

    const match = COUNTRIES.find((c) => value.startsWith(c.code));
    const selectedCountry = match ?? COUNTRIES[0];

    setCountry(selectedCountry);
    setNumber(value.replace(selectedCountry.code, ""));
  }, [value]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");

    if (raw.startsWith("0")) {
      raw = raw.replace(/^0+/, "");
    }

    setNumber(raw);
    onChange(`${country.code}${raw}`);
  };

  return (
    <div>
      <label className="block- mb-2 hidden">
        <Paragraph1 className="text-sm font-medium text-gray-800">
          Phone Number 
        </Paragraph1>
      </label>

      <div className="relative flex border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-black">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center px-4 gap-2 border-r border-gray-300"
        >
          <span>{country.code}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          placeholder="8080808080"
          className="w-full p-4 outline-none"
        />

        {open && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border rounded-lg shadow z-10">
            {COUNTRIES.map((c) => (
              <button
                key={c.iso}
                type="button"
                onClick={() => {
                  setCountry(c);
                  onChange(`${c.code}${number}`);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {c.name} ({c.code})
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
