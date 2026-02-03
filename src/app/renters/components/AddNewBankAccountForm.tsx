import React from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Assuming your custom text component
import { HiOutlineChevronDown } from "react-icons/hi2";

const AddNewBankAccountForm: React.FC = () => {
  return (
    <div className="">
      

      {/* Bank Name Dropdown */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Bank Name
        </Paragraph1>
        <div className="relative">
          <select
            defaultValue=""
            className="w-full p-3 text-black border border-gray-300 rounded-lg bg-white appearance-none focus:ring-black focus:border-black transition duration-150"
          >
            <option value="" disabled hidden>
              Select bank
            </option>
            <option value="access">Access Bank</option>
            <option value="gtbank">GTBank</option>
            <option value="uba">UBA</option>
            {/* Add more bank options here */}
          </select>
          {/* Custom dropdown arrow to replace default browser arrow */}
          <HiOutlineChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Account Number Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Account Number
        </Paragraph1>
        <input
          type="number"
          placeholder="Enter number account"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

      {/* Account Name Input */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Name
        </Paragraph1>
        <input
          type="text"
          placeholder="Enter name on account"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

     
    </div>
  );
};

export default AddNewBankAccountForm;
