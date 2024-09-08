"use client";

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import { Logo } from "@/assets/images/index";
import { db } from '@/utils/db/config.js';
import { collection, addDoc } from 'firebase/firestore';

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

// Function to format date in "Day, DD/MM/YYYY" format
const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('en-US', options).replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3');
};

// Function to get the current EST date based on 9:30 AM logic and skip weekends
const getDateForForm = () => {
  const now = new Date();
  const estOffset = -5 * 60; // Offset for EST (GMT-5)
  const currentEstTime = new Date(now.getTime() + estOffset * 60 * 1000);

  // Get 9:30 AM EST for today's date
  const nineThirtyAM = new Date(now);
  nineThirtyAM.setUTCHours(14, 30, 0, 0); // Set the time to 9:30 AM EST (14:30 UTC)

  let displayDate;

  // If current time is after 9:30 AM EST, use the next day
  if (currentEstTime > nineThirtyAM) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    displayDate = tomorrow;
  } else {
    displayDate = now;
  }

  // Check if the current day is Saturday or Sunday
  const dayOfWeek = displayDate.getDay();
  if (dayOfWeek === 6) {
    // If it's Saturday, set the date to Monday
    displayDate.setDate(displayDate.getDate() + 2);
  } else if (dayOfWeek === 0) {
    // If it's Sunday, set the date to Monday
    displayDate.setDate(displayDate.getDate() + 1);
  }

  return formatDate(displayDate);
};


const CateringForm = () => {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(getDateForForm());
  }, []);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      optOut: false,
      quantity: 1,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full Name is required'),
      phoneNumber: Yup.string()
        .matches(/^\+1 \(\d{3}\) \d{3}-\d{4}$/, 'Phone number must be a valid Canadian number')
        .required('Phone Number is required'),
      email: Yup.string().email('Invalid email address'),
      quantity: Yup.number()
        .test('quantity', 'Quantity must be at least 1 when not opting out', function (value) {
          return this.parent.optOut || value >= 1;
        })
        .nullable(),
    }),
    onSubmit: async (values) => {
      try {
        // Create a data object
        const data = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          email: values.email,
          optOut: values.optOut,
          quantity: values.quantity,
          date,
        };

        // Convert to JSON string and parse back into an object
        const jsonData = JSON.stringify(data);
        const parsedData = JSON.parse(jsonData);
        console.log(parsedData)
        // Send parsed JSON data to Firestore
        const docRef = await addDoc(collection(db, 'orders'), parsedData);
        console.log(docRef)
        alert('Order submitted successfully! |For other changes please contact your point of contact. ');
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    },
  });

  const handlePhoneNumberChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    formik.setFieldValue('phoneNumber', formattedPhone);
  };

  const handleOptOutChange = (e) => {
    const isChecked = e.target.checked;
    formik.setFieldValue('optOut', isChecked);
    formik.setFieldValue('quantity', isChecked ? 0 : 1);
  };

  return (
    <div className="max-w-lg mx-2 lg:mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <header className="text-center mb-6 flex justify-center items-center">
        <div className="mb-4 h-24">
          <Image src={Logo} alt="Ilaxis Catering Logo" />
        </div>
        <div className='flex flex-col justify-center items-center pl-2'>
          <h1 className="text-2xl font-bold -mb-1">Ilaxis Food Services</h1>
          <h2 className='text-sm mb-2'>Ordering Logging</h2>
        </div>
      </header>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className='p-2 rounded-xl border'>
          <h1 className='font-semibold'>Please note</h1>
          <ul className='list-disc ml-5'>
            <li>Opt out only available for {date}</li>
            <li>Changes are available only before 9.30 am.</li>
          </ul>
        </div>
        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1 text-gray-700">Service Date</label>
          <input
            id="date"
            name="date"
            type="text"
            value={date}
            readOnly
            className="p-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="fullName" className="mb-1 text-gray-700">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.fullName}
            className="p-2 border border-gray-300 rounded-md"
          />
          {formik.touched.fullName && formik.errors.fullName ? (
            <div className="text-red-600 text-sm">{formik.errors.fullName}</div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <label htmlFor="phoneNumber" className="mb-1 text-gray-700">Phone Number (Canadian)</label>
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

        <div className="flex items-center">
          <label htmlFor="optOut" className="text-gray-700 mr-2">Opt-out of receiving tiffin today</label>
          <input
            id="optOut"
            name="optOut"
            type="checkbox"
            onChange={handleOptOutChange}
            checked={formik.values.optOut}
            className="form-checkbox h-5 w-5 text-red-600"
          />
        </div>

        {!formik.values.optOut && (
          <div className="flex flex-col">
            <label htmlFor="quantity" className="mb-1 text-gray-700">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.quantity}
              className="p-2 border border-gray-300 rounded-md"
            />
            {formik.touched.quantity && formik.errors.quantity ? (
              <div className="text-red-600 text-sm">{formik.errors.quantity}</div>
            ) : null}
          </div>
        )}

        {formik.values.optOut && (
          <div className="text-red-600 font-bold bg-red-100 p-4 rounded-md">
            <p>You have opted out of receiving tiffin for {date}.</p>
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

export default CateringForm;
