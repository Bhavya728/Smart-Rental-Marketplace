import React from 'react';
import { 
  Search, 
  MessageCircle, 
  Calendar, 
  CreditCard, 
  Shield, 
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  Clock
} from 'lucide-react';

const HowItWorks = () => {
  const renterSteps = [
    {
      icon: Search,
      title: "Browse & Search",
      description: "Find exactly what you need from thousands of available items in your area. Use filters to narrow down by category, price, and location.",
      details: ["Search by category or keyword", "Filter by location and price", "View detailed photos and descriptions", "Check availability dates"]
    },
    {
      icon: MessageCircle,
      title: "Connect & Communicate",
      description: "Message the owner directly to ask questions, discuss details, and arrange pickup or delivery options.",
      details: ["Send messages through our secure platform", "Ask questions about the item", "Discuss pickup/delivery options", "Negotiate terms if needed"]
    },
    {
      icon: Calendar,
      title: "Book & Schedule",
      description: "Select your rental dates, review the terms, and complete your booking with our secure payment system.",
      details: ["Choose your rental period", "Review rental terms and conditions", "Add any special requests", "Confirm booking details"]
    },
    {
      icon: CreditCard,
      title: "Pay Securely",
      description: "Complete your payment through our secure system. Your money is held safely until the rental is complete.",
      details: ["Secure payment processing", "Multiple payment options", "Money held in escrow", "Automatic refund protection"]
    }
  ];

  const lenderSteps = [
    {
      icon: Users,
      title: "Create Your Listing",
      description: "Upload photos and describe your item in detail. Set your price and availability to attract renters.",
      details: ["Upload high-quality photos", "Write detailed descriptions", "Set competitive pricing", "Define availability windows"]
    },
    {
      icon: Shield,
      title: "Review Requests",
      description: "Receive and review rental requests from verified users. Accept or decline based on your preferences.",
      details: ["View renter profiles and ratings", "Review rental duration and terms", "Accept or decline requests", "Set pickup/delivery preferences"]
    },
    {
      icon: Clock,
      title: "Coordinate Handover",
      description: "Arrange the pickup or delivery with your renter. Our platform facilitates smooth communication.",
      details: ["Schedule convenient pickup times", "Provide clear instructions", "Verify item condition", "Complete handover process"]
    },
    {
      icon: Star,
      title: "Earn & Review",
      description: "Receive payment automatically after the rental. Leave reviews to build trust in the community.",
      details: ["Automatic payment processing", "Rate your rental experience", "Build your reputation", "Receive feedback from renters"]
    }
  ];

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Identity Verification",
      description: "All users go through our verification process to ensure a safe community."
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Payments are processed securely and held in escrow until rental completion."
    },
    {
      icon: Star,
      title: "Rating System",
      description: "Our two-way rating system builds trust and accountability in the community."
    },
    {
      icon: MessageCircle,
      title: "In-App Communication",
      description: "All communication stays on our platform for safety and record-keeping."
    }
  ];

  const StepCard = ({ step, index, isLender = false }) => {
    const Icon = step.icon;
    return (
      <div className="relative">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isLender ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {index + 1}. {step.title}
            </h3>
            <p className="text-gray-600 mb-4">{step.description}</p>
            <ul className="space-y-2">
              {step.details.map((detail, idx) => (
                <li key={idx} className="flex items-center text-sm text-gray-500">
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {index < 3 && (
          <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
        )}
      </div>
    );
  };

  return (
    <div className="how-it-works-page">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes it simple to rent what you need or earn money from what you own. 
            Here's how it works for both renters and lenders.
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button className="px-6 py-2 rounded-md bg-white text-blue-600 font-medium shadow-sm">
              For Renters
            </button>
            <button className="px-6 py-2 rounded-md text-gray-600 font-medium">
              For Lenders
            </button>
          </div>
        </div>

        {/* Renter Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Renting Made Simple</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From discovery to return, we've made the rental process as smooth as possible.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {renterSteps.map((step, index) => (
                <StepCard key={index} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Lender Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Earning Today</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Turn your unused items into a source of income with our easy-to-use platform.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {lenderSteps.map((step, index) => (
                <StepCard key={index} step={step} index={index} isLender={true} />
              ))}
            </div>
          </div>
        </div>

        {/* Safety Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Safety & Security First</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built multiple layers of protection to ensure safe transactions for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I know if an item is available?</h3>
              <p className="text-gray-600">Each listing shows real-time availability. You can select your desired dates to see if the item is free during that period.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if an item gets damaged?</h3>
              <p className="text-gray-600">We offer protection for both renters and lenders. Minor wear is expected, but significant damage is covered through our resolution process.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I get paid as a lender?</h3>
              <p className="text-gray-600">Payments are processed automatically after the rental period ends. Funds are typically available in your account within 1-2 business days.</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel a booking?</h3>
              <p className="text-gray-600">Yes, but cancellation policies vary by listing. Check the specific policy before booking, and refer to our cancellation guidelines for details.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of users who are already renting and earning on our platform.</p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Renting
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              List Your Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
