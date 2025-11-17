import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              Welcome to our platform - connecting people through shared experiences and trusted rentals.
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                We believe in building a community where people can share resources, connect with neighbors, 
                and make the most of what they have. Our platform makes it easy to rent out your items 
                or find exactly what you need from trusted members in your community.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Started</h2>
              <p className="text-gray-700 mb-4">
                Founded with the vision of creating a more sustainable and connected world, our platform 
                emerged from the simple idea that sharing is better than owning everything individually. 
                We started small and have grown into a trusted community of renters and lenders.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Renters</h3>
                  <p className="text-gray-700">
                    Access thousands of items from your community. From tools and equipment to 
                    electronics and recreational gear - find what you need when you need it.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">For Lenders</h3>
                  <p className="text-gray-700">
                    Turn your unused items into income. List your belongings safely and securely, 
                    connect with trusted renters, and earn money from things you already own.
                  </p>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Trust:</strong> We prioritize safety and security in every transaction</li>
                <li><strong>Community:</strong> Building connections between neighbors and friends</li>
                <li><strong>Sustainability:</strong> Reducing waste through shared resource usage</li>
                <li><strong>Accessibility:</strong> Making rentals affordable and available to everyone</li>
                <li><strong>Innovation:</strong> Continuously improving the rental experience</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-gray-700 mb-4">
                Have questions, suggestions, or just want to say hello? We'd love to hear from you.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> hello@ourplatform.com<br/>
                  <strong>Support:</strong> support@ourplatform.com<br/>
                  <strong>Phone:</strong> (555) 123-4567
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
