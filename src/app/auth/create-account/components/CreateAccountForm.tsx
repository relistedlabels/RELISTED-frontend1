"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiEyeSlash,
} from "react-icons/hi2";
import SocialSignInOptions from "../../sign-in/components/SocialSignInOptions";
import { useSignup } from "@/lib/mutations";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore"; // ✅ add

const CreateAccountSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
  terms: Yup.boolean().oneOf(
    [true],
    "You must agree to the terms and privacy policy",
  ),
});

const CreateAccountForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const signup = useSignup();
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const role = useUserStore((s) => s.role); // ✅ get role

  return (
    <div className="font-sans">
      <div className="w-full sm:w-[600px] bg-white p-4 md:p-8 pb-[100px] sm:pb-0 sm:rounded-3xl text-gray-900">
        {/* Header */}
        <div className="mb-8 text-center flex-col items-center flex">
          <img src="/images/logo1.svg" alt="" className="h-10 w-10 mb-4" />
          <Paragraph3 className="text-2xl font-bold mb-1">
            Create an account
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-600 max-w-[300px]">
            Join the Relisted community and unlock endless wardrobe
            possibilities.
          </Paragraph1>
        </div>

        <Formik
          initialValues={{
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: false,
          }}
          validationSchema={CreateAccountSchema}
          onSubmit={(values, { setSubmitting }) => {
            setUser({
              name: values.fullName,
              email: values.email,
              role: role, // ✅ from user store
            });
            console.log("ROLE FROM STORE:", role);

            signup.mutate(
              {
                name: values.fullName,
                email: values.email,
                password: values.password,
                role: role, // ✅ from user store
              },
              {
                onSuccess: () => {
                  router.push("/auth/verify-email");
                },
                onSettled: () => setSubmitting(false),
              },
            );
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {/* Full Name */}
              <div>
                <Paragraph1 className="text-sm font-medium mb-2">
                  Full Name
                </Paragraph1>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Field
                    name="fullName"
                    placeholder="Enter your full name"
                    className="w-full p-4 pl-12 border rounded-lg"
                  />
                </div>
                <ErrorMessage
                  name="fullName"
                  component="p"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Paragraph1 className="text-sm font-medium mb-2">
                  Email Address
                </Paragraph1>
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-4 pl-12 border rounded-lg"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Password */}
              <div>
                <Paragraph1 className="text-sm font-medium mb-2">
                  Password
                </Paragraph1>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full p-4 pl-12 pr-12 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <HiEyeSlash className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Paragraph1 className="text-sm font-medium mb-2">
                  Confirm Password
                </Paragraph1>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Field
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="w-full p-4 pl-12 border rounded-lg"
                  />
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="p"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <Field type="checkbox" name="terms" className="mt-1 w-4 h-4" />
                <Paragraph1 className="text-sm">
                  I agree to the{" "}
                  <span className="underline font-medium">Terms of use</span>{" "}
                  and{" "}
                  <span className="underline font-medium">Privacy Policy</span>.
                </Paragraph1>
              </div>
              <ErrorMessage
                name="terms"
                component="p"
                className="text-sm text-red-500"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || signup.isPending}
                className="w-full py-4 font-semibold text-white bg-black rounded-lg disabled:opacity-50"
              >
                {signup.isPending ? "Creating account..." : "Create account"}
              </button>

              {signup.error && (
                <p className="text-sm text-red-500">
                  {(signup.error as Error).message}
                </p>
              )}
            </Form>
          )}
        </Formik>

        <div className="mt-8">
          <SocialSignInOptions />
        </div>
      </div>
    </div>
  );
};

export default CreateAccountForm;
