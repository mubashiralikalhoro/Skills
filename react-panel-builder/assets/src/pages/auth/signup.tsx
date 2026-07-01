import { Link } from "react-router";
import FormBuilder from "../../components/global/form-builder/FormBuilder";
import LoaderIcon from "../../components/global/LoaderIcon";
import { useState } from "react";
import Logo from "../../components/global/Logo";
import * as Yup from "yup";

interface SignupForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const SignupPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: SignupForm) => {
    console.log(values);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="w-full flex-1">
        <div className="flex flex-col items-center justify-center mb-10">
          <Logo className="text-3xl" />
        </div>
        <FormBuilder
          className="gap-2"
          value={{
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string().email("Invalid Email").required("*Required"),
            username: Yup.string().min(3, "Min 3 characters").required("*Required"),
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
                <span className="text-white mx-auto">{loading ? <LoaderIcon /> : "Sign Up"}</span>
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
            {
              fieldName: "username",
              inputType: "text",
              label: "Username",
              placeholder: "Username",
            },
            {
              fieldName: "password",
              inputType: "password",
              label: "Password",
              placeholder: "Password",
            },
            {
              fieldName: "confirmPassword",
              inputType: "password",
              label: "Confirm Password",
              placeholder: "Confirm Password",
            },
          ]}
        />

        <p className="text-xs text-gray-600 text-center mt-10">
          Already have an account?{" "}
          <Link to={"/auth/login"} className=" text-[var(--primary)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
