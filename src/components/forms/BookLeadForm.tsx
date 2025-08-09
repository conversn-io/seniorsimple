'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
// Removed UI imports - using standard HTML/Tailwind

interface BookLeadFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookLeadForm = ({ isOpen, onClose }: BookLeadFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Please fill in all fields");
      return;
    }

    // Store form data in localStorage for future use
    localStorage.setItem('leadFormData', JSON.stringify(formData));
    
    // Close modal and navigate to new confirmation page
    onClose();
    router.push('/resources/ebook-confirmation');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-center flex-1">
              Get Your Free Book!
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="text-center mb-4">
            <p className="text-gray-600">
              Enter your details below to download your free copy of "Indexed Annuities Secrets"
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-md transition-colors"
            >
              Download Free Book Now
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">
            Your information is 100% secure and will never be shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookLeadForm;
