export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  };

  return (
    <button
      disabled
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center space-x-3 py-3 px-4 border  rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition duration-150 "
    >
      {/* Using a placeholder for the Google logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 48 48"
      >
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3A12.9 12.9 0 1 1 24 10.9c3.5 0 6.6 1.3 9 3.4l6-6A21.8 21.8 0 0 0 24 2 22 22 0 1 0 46 24c0-1.3-.1-2.7-.4-3.9z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.9A12.9 12.9 0 0 1 24 10.9c3.5 0 6.6 1.3 9 3.4l6-6A21.8 21.8 0 0 0 24 2 22 22 0 0 0 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 46c5.8 0 11-2.2 15-5.8l-7-5.7A12.7 12.7 0 0 1 24 36a12.9 12.9 0 0 1-11.2-6.7l-6.6 5A22 22 0 0 0 24 46z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3a13 13 0 0 1-4.4 5.7l7 5.7A22 22 0 0 0 46 24c0-1.3-.1-2.7-.4-3.9z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

