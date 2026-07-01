import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import FormBuilder from "../../components/global/form-builder/FormBuilder";
import LoaderIcon from "../../components/global/LoaderIcon";
import { useEffect, useState } from "react";
import * as Yup from "yup";

interface ResetPasswordForm {
  otp: string;
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const decodedEmail = atob(token || "");
    Yup.string()
      .email("Invalid Email")
      .required("*Required")
      .validate(decodedEmail)
      .then((email) => {
        setEmail(email);
      })
      .catch((err) => {
        navigate("/auth/login");
      });
  }, [token]);

  const handleSubmit = async (values: ResetPasswordForm) => {
    setLoading(true);
    const res = true;
    setLoading(false);
    if (res) {
      setResetComplete(true);
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    }
  };

  if (resetComplete) {
    return (
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="w-full flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Password Reset Successful</h2>
            <p className="text-gray-600 mb-6">
              Your password has been changed successfully. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="w-full flex-1">
        <h2 className="text-2xl font-bold mb-1 text-center">Reset Password</h2>
        <p className="text-gray-600 mb-6  text-center">
          Enter the OTP sent to <strong className="text-black font-semibold">{email}</strong> to verify your
          identity.
        </p>
        <FormBuilder
          className="gap-2"
          value={{
            otp: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={Yup.object().shape({
            otp: Yup.number().required("*Required"),
            password: Yup.string().min(8, "Min 8 characters").required("*Required"),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref("password")], "Passwords must match")
              .required("*Required"),
          })}
          onSubmit={handleSubmit as any}
          SubmitButton={({ isValid, handleSubmit }) => {
            return (
              <button
                disabled={loading}
                onClick={handleSubmit}
                className="bg-[var(--primary)] p-2 w-full rounded-md font-bold mt-5 hover:bg-opacity-50 flex cursor-pointer"
              >
                <span className="text-white mx-auto">{loading ? <LoaderIcon /> : "Reset Password"}</span>
              </button>
            );
          }}
          design={[
            {
              fieldName: "otp",
              inputType: "number",
              label: "OTP",
              placeholder: "OTP",
              onChange(e, setValues, values) {
                if (e.target.value.length > 4) return;
                setValues({ ...values, otp: e.target.value });
              },
            },
            {
              fieldName: "password",
              inputType: "password",
              label: "New Password",
              placeholder: "New Password",
            },
            {
              fieldName: "confirmPassword",
              inputType: "password",
              label: "Confirm Password",
              placeholder: "Confirm Password",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
