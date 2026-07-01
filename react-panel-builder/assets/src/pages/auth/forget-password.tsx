import { Link, useNavigate } from "react-router";
import FormBuilder from "../../components/global/form-builder/FormBuilder";
import LoaderIcon from "../../components/global/LoaderIcon";
import { useState } from "react";
import BackButton from "../../components/global/BackButton";
import { FaArrowLeft } from "react-icons/fa";
import * as Yup from "yup";

interface ForgetPasswordForm {
  email: string;
}

const ForgetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: ForgetPasswordForm) => {
    setLoading(true);
    const res = false;
    setLoading(false);
    if (res) {
      navigate(`/auth/reset-password?token=${btoa(values.email)}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="w-full flex-1">
        <BackButton className="mb-10 text-[var(--primary)]" />
        <h2 className="text-2xl font-bold mb-1 text-center">Forgot Password</h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <FormBuilder
          className="gap-2"
          value={{
            email: "",
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string().email("Invalid Email").required("*Required"),
          })}
          onSubmit={handleSubmit as any}
          SubmitButton={({ isValid, handleSubmit }) => {
            return (
              <button
                disabled={loading}
                onClick={handleSubmit}
                className="bg-[var(--primary)] p-2 w-full rounded-md font-bold mt-5 hover:bg-opacity-50 flex cursor-pointer"
              >
                <span className="text-white mx-auto">{loading ? <LoaderIcon /> : "Send Reset Link"}</span>
              </button>
            );
          }}
          design={[
            {
              fieldName: "email",
              inputType: "email",
              label: "Email",
              placeholder: "Email Address",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
