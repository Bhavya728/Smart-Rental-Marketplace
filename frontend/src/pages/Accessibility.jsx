import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Accessibility = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <Button 
              variant="secondary" 
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              ← Back
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
            <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-gray-700 mb-6">
                Smart Rental is committed to ensuring digital accessibility for people with disabilities. 
                We are continually improving the user experience for everyone.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility Features</h2>
              <p className="text-gray-700 mb-4">Our website includes the following accessibility features:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Keyboard navigation support</li>
                <li>Screen reader compatibility</li>
                <li>High contrast color schemes</li>
                <li>Descriptive alt text for images</li>
                <li>Clear and consistent navigation</li>
                <li>Readable fonts and appropriate text sizing</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Standards Compliance</h2>
              <p className="text-gray-700 mb-6">
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. 
                These guidelines help make web content more accessible to people with disabilities.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browser and Assistive Technology</h2>
              <p className="text-gray-700 mb-6">
                This website is designed to be compatible with recent versions of the following 
                screen readers and browsers:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>JAWS with Chrome, Firefox, and Edge</li>
                <li>NVDA with Chrome, Firefox, and Edge</li>
                <li>VoiceOver with Safari</li>
                <li>Dragon Naturally Speaking with Chrome, Firefox, and Edge</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Feedback and Contact</h2>
              <p className="text-gray-700 mb-4">
                We welcome your feedback on the accessibility of Smart Rental. Please let us know 
                if you encounter accessibility barriers:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Email: accessibility@smartrental.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>We aim to respond to accessibility feedback within 2 business days</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ongoing Efforts</h2>
              <p className="text-gray-700">
                We regularly review our website's accessibility and make improvements. 
                Our development team receives ongoing accessibility training to ensure 
                new features meet accessibility standards.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Accessibility