"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "@/assets/images/index";

const SuccessPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/waitlist"); // Redirect back to the form
  };

  return (
    <div className="max-w-lg mx-2 lg:mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 text-center">
      <header className="text-center mb-6 flex justify-center items-center">
        <div className="mb-4 h-24">
          <Image src={Logo} alt="Ilaxis Catering Logo" />
        </div>
        <div className='flex flex-col justify-center items-center pl-2'>
          <h1 className="text-2xl font-bold -mb-1">Ilaxis Food Services</h1>
          {/* <h2 className='text-sm mb-2'>Order Submitted Successfully!</h2> */}
        </div>
      </header>

      <div className="p-4 bg-green-100 text-green-700 rounded-md mb-4">
        <h2 className="text-xl font-bold mb-2">You have been added to the waitlist!</h2>
        <p>We will contact you in 1-2 business days.</p>
        <p></p>
      </div>

      <button
        onClick={handleGoBack}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300"
      >
        Go Back
      </button>
    </div>
  );
};

export default SuccessPage;
