"use client";

import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import { Logo } from "@/assets/images/index";
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { db } from '@/utils/db/config.js';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
// Define the libraries you want to use
const libraries = ["places"];

// Phone number formatting function
const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/[^+\d]/g, '');

  const formatted = cleaned.startsWith('+1') ? cleaned.replace('+1', '') : cleaned;

  if (formatted.length <= 3) {
    return `+1 (${formatted}`;
  } else if (formatted.length > 3 && formatted.length <= 6) {
    return `+1 (${formatted.slice(0, 3)}) ${formatted.slice(3)}`;
  } else if (formatted.length > 6 && formatted.length <= 10) {
    return `+1 (${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`;
  }

  return `+1 (${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6, 10)}`;
};

const AddressForm = () => {
  const [address, setAddress] = useState('');
  const [isApartment, setIsApartment] = useState(false);
  const autocompleteRef = useRef(null); // Create a ref for the Autocomplete
  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      address: '',
      aptNumber: '',
      buzzerCode: '',
      unitLevel: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First Name is required'),
      phoneNumber: Yup.string()
        .matches(/^\+1 \(\d{3}\) \d{3}-\d{4}$/, 'Phone number must be a valid Canadian number')
        .required('Phone Number is required'),
      email: Yup.string().email('Invalid email address'),
      address: Yup.string().required('Address is required'),
      aptNumber: Yup.string().when('isApartment', {
        is: true,
        then: Yup.string().required('Apartment number is required'),
      }),
      buzzerCode: Yup.string().when('isApartment', {
        is: true,
        then: Yup.string().required('Buzzer code is required'),
      }),
      unitLevel: Yup.string().when('isApartment', {
        is: false,
        then: Yup.string().required('Unit/Level is required'),
      }),
    }),
    onSubmit: async (values) => {
      try {
        // Create a data object
        const data = {
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          email: values.email,
          address: values.address,
          aptNumber: values.aptNumber,
          buzzerCode: values.buzzerCode,
          unitLevel: values.unitLevel,
          isApartment: isApartment,
        };

        // Send parsed JSON data to Firestore in "waitlist" collection
        await addDoc(collection(db, 'waitlist'), data);
        alert('Submission successful!'); // Mock response alert
        router.push("/success/waitlist"); // Redirect to success page
      } catch (error) {
        console.error("Error adding document: ", error);
        alert('Error submitting your details.'); // Error alert
      }
    },
  });

  const handlePhoneNumberChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    formik.setFieldValue('phoneNumber', formattedPhone);
  };

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete; // Store the reference
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace(); // Get the place object
    console.log(place); // Log the place object

    if (place.geometry) {
      const formattedAddress = place.formatted_address || place.name; // Fallback to name if formatted_address is not available
      setAddress(formattedAddress);
      formik.setFieldValue('address', formattedAddress);
    }
  };

  return (
    <div className="max-w-lg mx-2 lg:mx-auto p-6 min-h-screen bg-white shadow-lg rounded-lg mt-10">
      <header className="text-center mb-6 flex justify-center items-center">
        <div className="mb-4 h-24">
          <Image src={Logo} alt="Ilaxis Catering Logo" />
        </div>
        <div className='flex flex-col justify-center items-center pl-2'>
          <h1 className="text-2xl font-bold -mb-1">Ilaxi&apos;s Food Services</h1>
          <h2 className='text-sm mb-2'>Wait list registration</h2>
        </div>
      </header>

      <form onSubmit={formik.handleSubmit} className="space-y-4 min-h-screen">
        <div className="flex flex-col">
          <label htmlFor="firstName" className="mb-1 text-gray-700">
            First Name <span className="text-red-600">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstName}
            className="p-2 border border-gray-300 rounded-md"
          />
          {formik.touched.firstName && formik.errors.firstName ? (
            <div className="text-red-600 text-sm">{formik.errors.firstName}</div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <label htmlFor="lastName" className="mb-1 text-gray-700">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastName}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="phoneNumber" className="mb-1 text-gray-700">
            Phone Number (Canadian) <span className="text-red-600">*</span>
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            onChange={handlePhoneNumberChange}
            onBlur={formik.handleBlur}
            value={formik.values.phoneNumber}
            className="p-2 border border-gray-300 rounded-md"
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
            <div className="text-red-600 text-sm">{formik.errors.phoneNumber}</div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-gray-700">Email (Optional)</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className="p-2 border border-gray-300 rounded-md"
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="text-red-600 text-sm">{formik.errors.email}</div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <label htmlFor="address" className="mb-1 text-gray-700">
            Physical Address <span className="text-red-600">*</span>
          </label>
          {isLoaded ? (
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              options={{ componentRestrictions: { country: 'ca' }, types: ['address'] }} // Restrict to Canada
            >
              <input
                type="text"
                placeholder="Enter your address"
                className="p-2 border border-gray-300 rounded-md w-full"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
              />
            </Autocomplete>
          ) : (
            <p>Loading...</p>
          )}
          {formik.touched.address && formik.errors.address ? (
            <div className="text-red-600 text-sm">{formik.errors.address}</div>
          ) : null}
        </div>

        <div className="flex items-center">
          <label htmlFor="isApartment" className="text-gray-700 mr-2">This is an apartment</label>
          <input
            id="isApartment"
            name="isApartment"
            type="checkbox"
            onChange={(e) => {
              setIsApartment(e.target.checked);
              formik.setFieldValue('aptNumber', '');
              formik.setFieldValue('buzzerCode', '');
              formik.setFieldValue('unitLevel', '');
            }}
            checked={isApartment}
            className="form-checkbox h-5 w-5 text-red-600"
          />
        </div>

        {isApartment && (
          <>
            <div className="flex flex-col">
              <label htmlFor="aptNumber" className="mb-1 text-gray-700">
                Apartment Number <span className="text-red-600">*</span>
              </label>
              <input
                id="aptNumber"
                name="aptNumber"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.aptNumber}
                className="p-2 border border-gray-300 rounded-md"
              />
              {formik.touched.aptNumber && formik.errors.aptNumber ? (
                <div className="text-red-600 text-sm">{formik.errors.aptNumber}</div>
              ) : null}
            </div>

            <div className="flex flex-col">
              <label htmlFor="buzzerCode" className="mb-1 text-gray-700">
                Buzzer Code <span className="text-red-600">*</span>
              </label>
              <input
                id="buzzerCode"
                name="buzzerCode"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.buzzerCode}
                className="p-2 border border-gray-300 rounded-md"
              />
              {formik.touched.buzzerCode && formik.errors.buzzerCode ? (
                <div className="text-red-600 text-sm">{formik.errors.buzzerCode}</div>
              ) : null}
            </div>
          </>
        )}

        {!isApartment && (
          <div className="flex flex-col">
            <label htmlFor="unitLevel" className="mb-1 text-gray-700">
              Unit/Level <span className="text-red-600">*</span>
            </label>
            <input
              id="unitLevel"
              name="unitLevel"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.unitLevel}
              className="p-2 border border-gray-300 rounded-md"
            />
            {formik.touched.unitLevel && formik.errors.unitLevel ? (
              <div className="text-red-600 text-sm">{formik.errors.unitLevel}</div>
            ) : null}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddressForm;
