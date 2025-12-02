import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Shield, 
  Users, 
  Zap, 
  Star, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react';
import Container, { HeroContainer, SectionContainer } from '../components/layout/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home = () => {
  const features = [
    {
      icon: Search,
      title: 'Easy Discovery',
      description: 'Find exactly what you need with smart search and filters.',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Protected payments and verified user profiles for peace of mind.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with neighbors and build lasting relationships.',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Book items instantly or request custom rental periods.',
    }
  ];

  const categories = [
    { name: 'Electronics', count: 1200, icon: '📱' },
    { name: 'Tools & Hardware', count: 850, icon: '🔧' },
    { name: 'Sports & Recreation', count: 620, icon: '⚽' },
    { name: 'Home & Garden', count: 940, icon: '🏠' },
    { name: 'Photography', count: 380, icon: '📷' },
    { name: 'Vehicles', count: 290, icon: '🚗' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      content: 'Smart Rental made it so easy to borrow a power drill for my weekend project. Saved me $100!',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      role: 'Host',
      content: 'I\'ve earned over $500 this month renting out my camera gear. Great community!',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emma Davis',
      role: 'Renter',
      content: 'Perfect for trying expensive equipment before buying. The hosts are super helpful!',
      rating: 5,
      avatar: 'ED'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Items Listed', value: '25K+', icon: Search },
    { label: 'Cities Served', value: '150+', icon: Globe },
    { label: 'Total Rentals', value: '100K+', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroContainer className="relative overflow-hidden bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/70 backdrop-blur-sm min-h-screen flex items-center">
        <div className="relative z-10 text-center w-full">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm border border-blue-200/40 text-blue-800 text-sm font-semibold mb-8 shadow-lg">
              <Zap className="w-4 h-4 mr-2 text-blue-600" />
              Join 50,000+ happy renters & hosts
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-gray-900 mb-6 sm:mb-8 tracking-tight leading-tight">
            <span className="block">Rent Anything,</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">
              Share Everything
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
            <span className="block">The smart marketplace where neighbors share tools, tech, and treasures.</span>
            <span className="block mt-1 sm:mt-2 text-gray-600/80 text-base sm:text-lg md:text-xl lg:text-2xl">Why buy when you can borrow?</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4 sm:px-0">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="xl" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-500/40">
                Get Started Free
                <ArrowRight className="ml-2 sm:ml-3" size={20} />
              </Button>
            </Link>
            <Link to="/listings" className="w-full sm:w-auto">
              <Button variant="light-outline" size="xl" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 backdrop-blur-sm border-2">
                Browse Items
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto px-4 sm:px-0">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-sm sm:text-base md:text-lg text-gray-700 font-semibold tracking-wide">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/25 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </HeroContainer>

      {/* Features Section */}
      <SectionContainer className="bg-gradient-to-b from-white to-gray-50/50">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 text-blue-800 text-sm font-semibold mb-4 sm:mb-6">
            <CheckCircle className="w-4 h-4 mr-2" />
            Trusted by thousands
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight px-4 sm:px-0">
            Why Choose Smart Rental?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700/90 max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
            Built for the sharing economy with features that make renting safe, simple, and social.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} variant="elevated" className="text-center p-6 sm:p-8 lg:p-10 group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-blue-500/30 group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all duration-500 group-hover:scale-110">
                    <Icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700/90 leading-relaxed font-medium text-base sm:text-lg">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </SectionContainer>

      {/* Categories Section */}
      <SectionContainer className="bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Popular Categories
          </h2>
          <p className="text-xl md:text-2xl text-gray-700/90 font-medium">
            From everyday tools to specialized equipment
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link key={index} to={`/category/${category.name.toLowerCase().replace(/\s/g, '-')}`}>
              <Card variant="glass" className="text-center p-4 sm:p-6 lg:p-8 group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer backdrop-blur-md border border-white/40">
                <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 lg:mb-5 group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg tracking-tight line-clamp-2">{category.name}</h3>
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs sm:text-sm font-semibold">
                  {category.count} items
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </SectionContainer>

      {/* How it Works Section */}
      <SectionContainer className="bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20"></div>
        <div className="relative z-10 text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-6">
            <Clock className="w-4 h-4 mr-2" />
            Simple process
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-xl md:text-2xl text-gray-700/90 font-medium">
            Get started in three simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1">
            <div className="flex justify-between items-center h-full">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300"></div>
              <div className="w-4 h-4 bg-white rounded-full border-2 border-blue-300 mx-4"></div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300"></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16 max-w-6xl mx-auto relative z-10">
            {[
              {
                step: '01',
                title: 'Browse & Search',
                description: 'Find the perfect item for your needs using our smart search and location filters.',
                icon: Search,
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                step: '02', 
                title: 'Book & Connect',
                description: 'Send a request to the owner and arrange pickup details. Chat directly in-app.',
                icon: Users,
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                step: '03',
                title: 'Rent & Review',
                description: 'Enjoy your rental and leave a review. Build trust in our community.',
                icon: Star,
                gradient: 'from-indigo-500 to-indigo-600'
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative group">
                  <div className={`w-24 h-24 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 relative shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110`}>
                    <Icon className="w-12 h-12 text-white" />
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-gray-800 font-black text-lg">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-700/90 leading-relaxed text-lg font-medium max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionContainer>

      {/* Testimonials Section */}
      <SectionContainer className="bg-gradient-to-br from-gray-50/80 via-blue-50/50 to-purple-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-purple-100/20"></div>
        <div className="relative z-10 text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-sm font-semibold mb-6">
            <Star className="w-4 h-4 mr-2 fill-current" />
            5-star reviews
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            What Our Community Says
          </h2>
          <p className="text-xl md:text-2xl text-gray-700/90 font-medium">
            Real stories from real users
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} variant="elevated" className="p-10 group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mr-1" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-8 leading-relaxed text-lg font-medium italic relative">
                  <div className="text-6xl text-blue-200 absolute -top-4 -left-2 font-serif">"</div>
                  <p className="relative z-10 pl-6">{testimonial.content}</p>
                </blockquote>
                <div className="flex items-center pt-6 border-t border-gray-200/60">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 font-medium">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* CTA Section */}
      <SectionContainer className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/80 to-indigo-800/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-8">
            <Users className="w-4 h-4 mr-2" />
            Join our growing community
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight">
            Ready to Start Sharing?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of users who are already saving money and building community through Smart Rental.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register">
              <Button variant="light" size="xl" className="text-lg px-10 py-5 text-blue-800 font-bold shadow-2xl hover:shadow-3xl">
                Join as Renter
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button variant="glass" size="xl" className="text-lg px-10 py-5 text-white border-white/40 backdrop-blur-sm hover:bg-white/10">
                Start Hosting
              </Button>
            </Link>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
};

export default Home;