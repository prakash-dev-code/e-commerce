"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useApi } from "@/services/apiServices";
import { signUpSchema } from "@/shared/schemas/formSchema";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import Link from "next/link";
import React, { useState } from "react";
import { BsEye } from "react-icons/bs";
import { TbEyeClosed } from "react-icons/tb";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setLogin } from "@/redux/features/auth-slice";
import { User } from "@/types/common";
import ButtonLoader from "@/components/Common/buttonLoader";
import { useMutation } from "react-query";
import { SignUpInput, SignUpResponse, VerifyOTPInput, VerifyOTPResponse } from "@/types/auth";
const Signup = () => {
  const { verifyOTP, signUp } = useApi();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<any>("");
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useRouter();

  // react-query

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: (res: any) => {
      if (res.status === "success") {
        setShowOTP(true);
        toast.success(res.message);
      } else {
        toast.error(res.message || "Signup failed");
      }
    },
    onError: (error: any) => {
      console.error("Signup error:", error.message);
      toast.error(
        error.response?.data?.message || error.message || "Signup failed"
      );
    },
  });
  // react-query
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: toFormikValidationSchema(signUpSchema),
    validateOnMount: false,
    onSubmit: async (values, { resetForm }) => {
      signUpMutation.mutate(values);
      // resetForm();
    },
  });


  const verifyOTPMutation = useMutation(
    {
      mutationFn: verifyOTP,
      onSuccess: (res:any) => {
        const { token, data } = res;

        if (token) {
          dispatch(setLogin({ token, user: data.user }));
          router.push("/");
          toast.success("Logged in successfully");
          setOtp(null);
        } else {
          toast.error(res.message || "Login failed");
        }
      },
      onError: (error: any) => {
        console.error("Verify Email error:", error.message);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "OTP verification failed"
        );
        setOtp(null);
      },
    }
  );

  const handleVerifyOTP = () => {
    if (!formik.values.email || !otp) {
      toast.error("Please provide both email and OTP");
      return;
    }

    verifyOTPMutation.mutate({
      email: formik.values.email,
      otp,
    });
  };



  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      {showOTP ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
              <div className="text-center mb-11">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                  Verify OTP
                </h2>
                <p>Enter OTP below</p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                pattern="\d{1,6}"
                maxLength={6}
                id="otp"
                name="otp"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,6}$/.test(value)) {
                    setOtp(value);
                  }
                }}
                className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />

              <button
                type="button"
                onClick={() => handleVerifyOTP()}
                disabled={otp?.length !== 6}
                className={`w-full flex justify-center font-medium text-white py-3 px-6 rounded-lg mt-4 ease-out duration-200 ${
                  otp?.length === 6
                    ? "bg-dark hover:bg-blue"
                    : "bg-gray-5 cursor-not-allowed"
                }`}
              >
                Submit OTP {otpLoading && <ButtonLoader />}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
              <div className="text-center mb-11">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                  Create an Account
                </h2>
                <p>Enter your detail below</p>
              </div>

              <div className="mb-5.5">
                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-5">
                    <label htmlFor="name" className="block mb-2.5">
                      Full Name <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      id="name"
                      onChange={formik.handleChange}
                      value={formik.values.name}
                      onBlur={formik.handleBlur}
                      placeholder="Enter your full name"
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red text-sm">{formik.errors.name}</p>
                    )}
                  </div>

                  <div className="mb-5">
                    <label htmlFor="email" className="block mb-2.5">
                      Email Address <span className="text-red">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      id="email"
                      onChange={formik.handleChange}
                      value={formik.values.email}
                      onBlur={formik.handleBlur}
                      placeholder="Enter your email address"
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red text-sm">{formik.errors.email}</p>
                    )}
                  </div>

                  <div className="mb-5">
                    <label htmlFor="password" className="block mb-2.5">
                      Password <span className="text-red">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "password" : "text"}
                        name="password"
                        id="password"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        onBlur={formik.handleBlur}
                        placeholder="Enter your password"
                        autoComplete="on"
                        className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-5 hover:text-dark-3"
                      >
                        {showPassword ? (
                          <TbEyeClosed size={20} />
                        ) : (
                          <BsEye size={20} />
                        )}
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-red text-sm">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>

                  <div className="mb-5.5">
                    <label htmlFor="confirmPassword" className="block mb-2.5">
                      Confirm Password <span className="text-red">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "password" : "text"}
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="Confirm  password"
                        // autoComplete="on"
                        onChange={formik.handleChange}
                        value={formik.values.confirmPassword}
                        onBlur={formik.handleBlur}
                        className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-5 hover:text-dark-3"
                      >
                        {showConfirmPassword ? (
                          <TbEyeClosed size={20} />
                        ) : (
                          <BsEye size={20} />
                        )}
                      </button>
                    </div>
                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <p className="text-red text-sm">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={!formik.isValid || signUpMutation.isLoading}
                    className={`w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 mt-7.5
    ${
      !formik.isValid || signUpMutation.isLoading
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-blue"
    }`}
                  >
                    Create Account{" "}
                    {signUpMutation.isLoading && <ButtonLoader />}
                  </button>
                </form>
              </div>

              {/* <div className="flex flex-col gap-4.5">
                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Or</span>
                </span>
                <button
                  onClick={() => loginWithGoogle()}
                  className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_98_7461)">
                      <mask
                        id="mask0_98_7461"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                      >
                        <path d="M20 0H0V20H20V0Z" fill="white" />
                      </mask>
                      <g mask="url(#mask0_98_7461)">
                        <path
                          d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z"
                          fill="#34A853"
                        />
                        <path
                          d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z"
                          fill="#EB4335"
                        />
                      </g>
                    </g>
                    <defs>
                      <clipPath id="clip0_98_7461">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  Continue with Google
                </button> */}

              {/* <button className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.9997 1.83331C5.93773 1.83331 1.83301 6.04119 1.83301 11.232C1.83301 15.3847 4.45954 18.9077 8.10178 20.1505C8.55988 20.2375 8.72811 19.9466 8.72811 19.6983C8.72811 19.4743 8.71956 18.7338 8.71567 17.9485C6.16541 18.517 5.6273 16.8395 5.6273 16.8395C5.21032 15.7532 4.60951 15.4644 4.60951 15.4644C3.77785 14.8811 4.6722 14.893 4.6722 14.893C5.59272 14.9593 6.07742 15.8615 6.07742 15.8615C6.89499 17.2984 8.22184 16.883 8.74493 16.6429C8.82718 16.0353 9.06478 15.6208 9.32694 15.3861C7.2909 15.1484 5.15051 14.3425 5.15051 10.7412C5.15051 9.71509 5.5086 8.87661 6.09503 8.21844C5.99984 7.98167 5.68611 7.02577 6.18382 5.73115C6.18382 5.73115 6.95358 5.47855 8.70532 6.69458C9.43648 6.48627 10.2207 6.3819 10.9997 6.37836C11.7787 6.3819 12.5635 6.48627 13.2961 6.69458C15.0457 5.47855 15.8145 5.73115 15.8145 5.73115C16.3134 7.02577 15.9995 7.98167 15.9043 8.21844C16.4921 8.87661 16.8477 9.715 16.8477 10.7412C16.8477 14.351 14.7033 15.146 12.662 15.3786C12.9909 15.6702 13.2838 16.2423 13.2838 17.1191C13.2838 18.3766 13.2732 19.3888 13.2732 19.6983C13.2732 19.9485 13.4382 20.2415 13.9028 20.1492C17.5431 18.905 20.1663 15.3833 20.1663 11.232C20.1663 6.04119 16.0621 1.83331 10.9997 1.83331Z"
                    fill="#15171A"
                  />
                </svg>
                Sign Up with Github
              </button> */}
              {/* </div> */}

              <p className="text-center mt-6">
                Already have an account?
                <Link
                  href="/signin"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Sign in Now
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Signup;
