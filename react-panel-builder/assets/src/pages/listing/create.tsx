import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import FormBuilder from "../../components/global/form-builder/FormBuilder";
import LoaderIcon from "../../components/global/LoaderIcon";
import * as Yup from "yup";
import notify from "../../utils/notify";
import FormButtons from "../../components/global/FormButtons";

// Mock data for form options
const mockCountries = [
  { CountryID: 1, CountryName: "United States" },
  { CountryID: 2, CountryName: "Canada" },
  { CountryID: 3, CountryName: "United Kingdom" },
];

const mockStates = [
  { StateID: 1, StateName: "New York", CountryID: 1 },
  { StateID: 2, StateName: "California", CountryID: 1 },
  { StateID: 3, StateName: "Texas", CountryID: 1 },
  { StateID: 4, StateName: "Ontario", CountryID: 2 },
  { StateID: 5, StateName: "Quebec", CountryID: 2 },
];

const mockCities = [
  { CityID: 1, CityName: "New York City", StateID: 1 },
  { CityID: 2, CityName: "Los Angeles", StateID: 2 },
  { CityID: 3, CityName: "Houston", StateID: 3 },
  { CityID: 4, CityName: "Toronto", StateID: 4 },
  { CityID: 5, CityName: "Montreal", StateID: 5 },
];

const mockGenders = [
  { GenderID: 1, GenderName: "Male" },
  { GenderID: 2, GenderName: "Female" },
];

const mockLanguages = [
  { LanguageID: 1, LanguageName: "English" },
  { LanguageID: 2, LanguageName: "Spanish" },
  { LanguageID: 3, LanguageName: "French" },
];

const CreateUserPage: React.FC = () => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);

  const navigate = useNavigate();

  // Filter states and cities based on selection
  const filteredStates = selectedCountry
    ? mockStates.filter((state) => state.CountryID === selectedCountry)
    : [];

  const filteredCities = selectedState ? mockCities.filter((city) => city.StateID === selectedState) : [];

  const handleSubmit = async (values: { [key: string]: any }) => {
    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      console.log("Submitting user data:", values);
      notify.success("User created successfully!");
      setIsSubmitting(false);
      navigate("/listing");
    }, 2000);
  };

  const validationSchema = Yup.object().shape({
    FirstName: Yup.string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .required("First name is required"),
    LastName: Yup.string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .required("Last name is required"),
    Email: Yup.string().email("Invalid email format").required("Email is required"),
    PhoneNo: Yup.string()
      .matches(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number")
      .required("Phone number is required"),
    DOB: Yup.date()
      .max(new Date(), "Date of birth cannot be in the future")
      .required("Date of birth is required"),
    GenderID: Yup.number().nullable().required("Gender is required"),
    LanguageID: Yup.number().nullable().required("Language is required"),
    CountryID: Yup.number().nullable().required("Country is required"),
    StateID: Yup.number().nullable().required("State is required"),
    CityID: Yup.number().nullable().required("City is required"),
    ZipCode: Yup.string()
      .matches(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format")
      .required("ZIP code is required"),
    Address: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .max(200, "Address must be less than 200 characters")
      .required("Address is required"),
  });

  return (
    <div className="w-full mx-auto ">
      <div className="mb-6 flex justify-between flex-col">
        <div className="flex items-center ">
          <Link
            to="/listing"
            className="text-[var(--primary)] hover:text-[var(--primary-dark)] flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Users
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          {id === "create" ? "Create New User" : "Edit User"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <FormBuilder
          className="gap-6 grid grid-cols-1 md:grid-cols-2"
          value={{
            FirstName: "",
            LastName: "",
            Email: "",
            PhoneNo: "",
            DOB: "",
            GenderID: null,
            LanguageID: null,
            CountryID: null,
            StateID: null,
            CityID: null,
            ZipCode: "",
            Address: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          SubmitButton={({ isValid, handleSubmit }) => {
            return (
              <FormButtons
                className="col-span-full"
                isValid={isValid}
                isLoading={isSubmitting}
                handleSubmit={handleSubmit}
                handleCancel={() => navigate("/listing")}
              />
            );
          }}
          design={[
            {
              fieldName: "FirstName",
              inputType: "enum",
              label: "First Name",
              placeholder: "Enter first name",
              className: "col-span-1",
              options: [
                {
                  label: "Taha",
                  value: "1",
                },
                {
                  label: "Hassan",
                  value: "2",
                },
              ],
            },
            {
              fieldName: "LastName",
              inputType: "text",
              label: "Last Name",
              placeholder: "Enter last name",
              className: "col-span-1",
            },
            {
              fieldName: "Email",
              inputType: "email",
              label: "Email Address",
              placeholder: "Enter email address",
              className: "col-span-1",
            },
            {
              fieldName: "PhoneNo",
              inputType: "text",
              label: "Phone Number",
              placeholder: "Enter phone number",
              className: "col-span-1",
            },
            {
              fieldName: "DOB",
              inputType: "date",
              label: "Date of Birth",
              className: "col-span-1",
            },
            {
              fieldName: "GenderID",
              inputType: "select",
              label: "Gender",
              placeholder: "Select gender",
              options: mockGenders.map((gender) => ({
                value: gender.GenderID,
                label: gender.GenderName,
              })),
              className: "col-span-1",
            },
            {
              fieldName: "LanguageID",
              inputType: "select",
              label: "Preferred Language",
              placeholder: "Select language",
              options: mockLanguages.map((lang) => ({
                value: lang.LanguageID,
                label: lang.LanguageName,
              })),
              className: "col-span-1",
            },
            {
              fieldName: "CountryID",
              inputType: "select",
              label: "Country",
              placeholder: "Select country",
              options: mockCountries.map((country) => ({
                value: country.CountryID,
                label: country.CountryName,
              })),
              onChange: (value) => {
                setSelectedCountry(value);
                setSelectedState(null);
              },
              className: "col-span-1",
            },
            {
              fieldName: "StateID",
              inputType: "select",
              label: "State/Province",
              placeholder: "Select state",
              options: filteredStates.map((state) => ({
                value: state.StateID,
                label: state.StateName,
              })),
              onChange: (value) => {
                setSelectedState(value);
              },
              hidden: () => !selectedCountry,
              className: "col-span-1",
            },
            {
              fieldName: "CityID",
              inputType: "select",
              label: "City",
              placeholder: "Select city",
              options: filteredCities.map((city) => ({
                value: city.CityID,
                label: city.CityName,
              })),
              hidden: () => !selectedState,
              className: "col-span-1",
            },
            {
              fieldName: "ZipCode",
              inputType: "text",
              label: "ZIP/Postal Code",
              placeholder: "Enter ZIP code",
              className: "col-span-1",
            },
            {
              fieldName: "Address",
              inputType: "textarea",
              label: "Address",
              placeholder: "Enter full address",
              containerClassName: "col-span-full",
              props: { rows: 3 },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CreateUserPage;
