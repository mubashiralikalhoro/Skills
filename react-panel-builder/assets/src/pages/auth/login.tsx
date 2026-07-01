import { Link, useNavigate } from "react-router";
import FormBuilder from "../../components/global/form-builder/FormBuilder";
import LoaderIcon from "../../components/global/LoaderIcon";
import { useState } from "react";
import Logo from "../../components/global/Logo";
import * as Yup from "yup";
import notify from "../../utils/notify";
import { useUserContext } from "../../context/user-context";
interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setUser } = useUserContext();

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    const res = true;
    setLoading(false);
    if (res) {
      notify.success("Login Successfully");
      setUser({
        fullname: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        token: "1234567890",
      });
      navigate("/dashboard");
    }
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
            password: "",
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string().email("Invalid Email").required("*Required"),
            password: Yup.string().min(8, "Min 8 characters").required("*Required"),
          })}
          onSubmit={handleSubmit as any}
          SubmitButton={({ isValid, handleSubmit }) => {
            return (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[var(--primary)] p-2 w-full rounded-md font-bold mt-5 hover:bg-opacity-50 flex cursor-pointer"
              >
                <span className="text-white mx-auto">{loading ? <LoaderIcon /> : "Sign In"}</span>
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
              fieldName: "password",
              inputType: "password",
              label: "Password",
              placeholder: "Password",
            },
            {
              fieldName: "",
              inputType: "view",
              label: "",
              customView: () => (
                <Link
                  to="/auth/forget-password"
                  className="text-sm text-[var(--primary)] block mt-2 text-right"
                >
                  Forgot Password?
                </Link>
              ),
            },
          ]}
        />

        <p className="text-xs text-gray-600 text-center mt-10">
          Don't have an account?{" "}
          <Link to={"/auth/signup"} className=" text-[var(--primary)]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
