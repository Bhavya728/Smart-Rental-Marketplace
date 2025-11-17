import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Terms = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden py-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full -translate-x-48 -translate-y-48 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-300/20 to-indigo-300/20 rounded-full translate-x-48 translate-y-48 blur-3xl" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <Button 
              variant="secondary" 
              onClick={() => navigate(-1)}
              className="mb-6 bg-white/60 border-white/30 hover:bg-white/80 hover:shadow-lg transition-all duration-300"
            >
              ← Back
            </Button>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              📋 Terms of Service
            </h1>
            <p className="text-lg text-gray-600 font-medium bg-white/40 px-4 py-2 rounded-full inline-block">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="p-8 bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ✅ 1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-6 bg-white/40 p-4 rounded-xl border border-white/30">
                By accessing and using Smart Rental, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                🏠 2. Service Description
              </h2>
              <p className="text-gray-700 mb-6 bg-white/40 p-4 rounded-xl border border-white/30">
                Smart Rental is a platform that connects property owners with potential renters. 
                We facilitate connections but are not a party to any rental agreements.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                👤 3. User Responsibilities
              </h2>
              <p className="text-gray-700 mb-6 bg-white/40 p-4 rounded-xl border border-white/30">
                Users are responsible for maintaining the confidentiality of their account information 
                and for all activities that occur under their account.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                📝 4. Property Listings
              </h2>
              <p className="text-gray-700 mb-6 bg-white/40 p-4 rounded-xl border border-white/30">
                Property owners must ensure all information provided is accurate and up-to-date. 
                False or misleading information may result in account suspension.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                🚫 5. Prohibited Activities
              </h2>
              <p className="text-gray-700 mb-6 bg-white/40 p-4 rounded-xl border border-white/30">
                Users may not use the service for illegal activities, harassment, or to violate 
                the rights of others.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ⚖️ 6. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-6 bg-white/40 p-4 rounded-xl border border-white/30">
                Smart Rental is not liable for any damages arising from the use of our service 
                or from rental agreements made through our platform.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                📧 7. Contact Information
              </h2>
              <p className="text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200/50">
                For questions about these Terms of Service, contact us at 
                <a href="mailto:legal@smartrental.com" className="font-semibold text-blue-600 hover:text-blue-800 underline">
                  legal@smartrental.com
                </a>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Terms