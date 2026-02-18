"use client";

import React, { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useLogin } from "@/lib/mutations/auth/useLogin";
import { Paragraph1, Header2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  hideSignUp?: boolean;
}

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  hideSignUp = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const loginMutation = useLogin();

  const handleLoginSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: any,
  ) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Login error:", error);
      // Error handling is done by the mutation hook
    } finally {
      setSubmitting(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.95, opacity: 0, y: 20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <Header2 className="text-xl font-bold text-gray-900">
                {showSignUp ? "Create Account" : "Welcome Back"}
              </Header2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Error Message */}
              {loginMutation.isError && (
                <motion.div
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle
                    size={20}
                    className="text-red-600 flex-shrink-0"
                  />
                  <div>
                    <Paragraph1 className="text-sm text-red-800 font-medium">
                      {loginMutation.error instanceof Error
                        ? loginMutation.error.message
                        : "Login failed. Please try again."}
                    </Paragraph1>
                  </div>
                </motion.div>
              )}

              {!showSignUp ? (
                <>
                  {/* Login Form */}
                  <Formik
                    initialValues={{ email: "", password: "" }}
                    validationSchema={validationSchema}
                    onSubmit={handleLoginSubmit}
                  >
                    {({ errors, touched, isSubmitting }) => (
                      <Form className="space-y-4">
                        {/* Email Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <Field
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                              errors.email && touched.email
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.email && touched.email && (
                            <Paragraph1 className="text-red-600 text-xs mt-1">
                              {errors.email}
                            </Paragraph1>
                          )}
                        </div>

                        {/* Password Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Field
                              type={showPassword ? "text" : "password"}
                              name="password"
                              placeholder="••••••••"
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                                errors.password && touched.password
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                          {errors.password && touched.password && (
                            <Paragraph1 className="text-red-600 text-xs mt-1">
                              {errors.password}
                            </Paragraph1>
                          )}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                          <a
                            href="/auth/forgot-password"
                            className="text-sm text-gray-600 hover:text-black transition"
                          >
                            Forgot password?
                          </a>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting || loginMutation.isPending}
                          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                          {isSubmitting || loginMutation.isPending ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>Signing in...</span>
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </button>
                      </Form>
                    )}
                  </Formik>

                  {/* Sign Up Link */}
                  {!hideSignUp && (
                    <div className="mt-4 text-center">
                      <Paragraph1 className="text-gray-600">
                        Don't have an account?{" "}
                        <button
                          onClick={() => setShowSignUp(true)}
                          className="text-black font-semibold hover:underline"
                        >
                          Sign up
                        </button>
                      </Paragraph1>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Sign Up Form */}
                  <div className="space-y-4">
                    <Paragraph1 className="text-gray-600 text-sm">
                      Join RELISTED and start renting designer fashion today.
                    </Paragraph1>

                    {/* Redirect to signup page */}
                    <a
                      href="/auth/create-account"
                      className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition flex items-center justify-center"
                    >
                      Go to Sign Up
                    </a>

                    {/* Back to Login */}
                    <button
                      onClick={() => setShowSignUp(false)}
                      className="w-full border border-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Back to Log In
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
