import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BookLeadFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookLeadForm = ({ isOpen, onClose }: BookLeadFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    // Store form data in localStorage for future use
    localStorage.setItem('leadFormData', JSON.stringify(formData));
    
    // Close modal and navigate to new confirmation page
    onClose();
    navigate('/resources/ebook-confirmation');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Get Your Free Book!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center mb-4">
          <p className="text-gray-600">
            Enter your details below to download your free copy of "Indexed Annuities Secrets"
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            className="h-12"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="h-12"
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="h-12"
          />
          <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold">
            Download Free Book Now
          </Button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4">
          Your information is 100% secure and will never be shared.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BookLeadForm;
