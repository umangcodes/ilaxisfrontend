"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore"; // Importing setDoc from Firestore
import { db } from "@/utils/db/config.js"; // Firestore config

const CateringForm = () => {
  const [date, setDate] = useState("");

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    setDate(today);
    console.log(doc(db, 'testCollection', 'dummyDoc'))

  }, []);

  const sendDummyRequest = async () => {
    try {
      // Send a dummy write request to Firestore
      await setDoc(doc(db, 'testCollection', 'dummyDoc'), {
        name: 'Test User',
        email: 'testuser@example.com',
        date: new Date().toISOString(),
      });
      console.log('Dummy request sent successfully');
    } catch (error) {
      console.error('Error sending dummy request: ', error);
    }
  };
  

  return (
    <div className="max-w-lg mx-2 lg:mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">Send Dummy Request</h1>
      </header>

      <button
        type="button"
        onClick={sendDummyRequest}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
      >
        Send Dummy Request
      </button>
    </div>
  );
};

export default CateringForm;
