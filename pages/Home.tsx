import React from 'react';
import { Phone, MapPin, Star, Utensils, Calendar, Users, Award, Heart } from 'lucide-react';
import { UserRole } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
  userRole: UserRole;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, userRole }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-jms-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img 
            src="https://picsum.photos/id/431/1920/1080" 
            alt="Spices" 
            className="w-full h-full object-cover"
          /> 
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-jms-dark via-jms-dark/90 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Authentic <span className="text-jms-orange">Taste</span> of <br/>
              <span className="text-jms-green">South India</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              We bring the tradition of Chennai to your plate. Whether it's a Wedding, Betrothal, Corporate Event, or House Warming, JMS Catering guarantees quality food that lingers in your memory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => userRole === UserRole.GUEST ? onNavigate('customer-menu') : onNavigate('customer-menu')}
                className="bg-jms-red hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Utensils size={20} />
                View Menu Packages
              </button>
              <button 
                 className="bg-white hover:bg-gray-100 text-jms-dark px-8 py-4 rounded-full font-bold text-lg shadow-xl transition flex items-center justify-center gap-2"
                 onClick={() => window.location.href = 'tel:9840364388'}
              >
                <Phone size={20} />
                Call 9840364388
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Strip */}
      <div className="bg-jms-green py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center font-medium">
            <div className="p-2">Weddings & Betrothals</div>
            <div className="p-2 border-l border-green-400">Corporate Events</div>
            <div className="p-2 border-l border-green-400">House Warming</div>
            <div className="p-2 border-l border-green-400">Industrial Catering</div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
               <div className="absolute -top-4 -left-4 w-24 h-24 bg-jms-red/10 rounded-full"></div>
               <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-jms-orange/10 rounded-full"></div>
               <img src="https://picsum.photos/id/1060/600/500" alt="Chef Cooking" className="rounded-2xl shadow-2xl relative z-10 w-full object-cover" />
            </div>
            <div>
               <h2 className="text-sm font-bold text-jms-orange uppercase tracking-wider mb-2">About JMS Catering</h2>
               <h3 className="text-3xl font-bold text-gray-900 mb-6">Serving Tradition with Love & Excellence</h3>
               <p className="text-gray-600 mb-4 leading-relaxed">
                 Founded by <strong>J. Mohan Singh</strong>, JMS Catering has been a cornerstone of culinary excellence in Chennai. We believe that food is not just about sustenance, but about creating memories.
               </p>
               <p className="text-gray-600 mb-6 leading-relaxed">
                 Our team of experienced chefs specializes in authentic Brahmin-style vegetarian feasts as well as rich, spicy non-vegetarian delicacies. From intimate house-warming ceremonies to grand weddings with thousands of guests, we handle every detail with precision and hygiene.
               </p>
               <div className="grid grid-cols-2 gap-6 mt-8">
                 <div className="flex items-center gap-3">
                   <div className="bg-red-50 p-3 rounded-full text-jms-red"><Award size={24}/></div>
                   <span className="font-semibold text-gray-800">Premium Quality</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="bg-orange-50 p-3 rounded-full text-jms-orange"><Users size={24}/></div>
                   <span className="font-semibold text-gray-800">Expert Staff</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="bg-green-50 p-3 rounded-full text-jms-green"><Heart size={24}/></div>
                   <span className="font-semibold text-gray-800">Hygienic Kitchen</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Star size={24}/></div>
                   <span className="font-semibold text-gray-800">Custom Menus</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-jms-dark">Why Choose JMS Catering?</h2>
            <div className="w-24 h-1 bg-jms-red mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-b-4 border-jms-red hover:shadow-xl transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-jms-red mb-6 mx-auto">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Quality Guaranteed</h3>
              <p className="text-gray-600 text-center">We use only the finest ingredients. No compromise on taste or hygiene. Your guests deserve the best.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-b-4 border-jms-green hover:shadow-xl transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-jms-green mb-6 mx-auto">
                <Utensils size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Veg & Non-Veg</h3>
              <p className="text-gray-600 text-center">Extensive menu options ranging from traditional Brahmin feasts to spicy Chettinad non-veg delicacies.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-b-4 border-jms-orange hover:shadow-xl transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-jms-orange mb-6 mx-auto">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Event Management</h3>
              <p className="text-gray-600 text-center">Beyond food, we handle the complete dining experience, ensuring your function runs smoothly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section Footer */}
      <footer id="contact" className="bg-jms-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-jms-red">Contact Us</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-800 p-2 rounded-lg">
                    <MapPin className="text-jms-green" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Visit Our Office</h4>
                    <p className="text-gray-400">328, 1st Street, P G Avenue,<br/>Kattupakkam, Chennai - 600056</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-800 p-2 rounded-lg">
                    <Phone className="text-jms-green" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Call Us</h4>
                    <p className="text-gray-400 text-xl font-bold">9840364388</p>
                    <p className="text-sm text-gray-500">J. Mohan Singh</p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-800 p-2 rounded-lg">
                    <Utensils className="text-jms-green" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Anish Industrial Catering</h4>
                    <p className="text-gray-400">Partnered for large scale industrial needs.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-jms-red rounded-bl-full opacity-20"></div>
               <h3 className="text-2xl font-bold mb-4">Request a Callback</h3>
               <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                 <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-jms-green" />
                 <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-jms-green" />
                 <button className="w-full bg-jms-green hover:bg-green-600 py-3 rounded-lg font-bold transition">Send Request</button>
               </form>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} JMS Catering. All rights reserved. | www.jmscatering.in</p>
          </div>
        </div>
      </footer>
    </div>
  );
};