import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Star, Utensils, Calendar, Users, Award, Heart, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
  userRole: UserRole;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, userRole }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    '/hero_feast.png',
    '/hero_buffet.png',
    '/hero_sweets.png',
    '/hero_service.png'
  ];

  const heroImageAlts = [
    'JMS Catering Services – Grand South Indian wedding feast spread in Chennai',
    'JMS Catering Services – South Indian buffet catering for events in Chennai',
    'JMS Catering – Traditional South Indian sweets and desserts for weddings Chennai',
    'JMS Catering professional service team at a wedding event in Chennai'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    visible: { transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Hero Section with Slider */}
      <div className="relative h-screen overflow-hidden bg-jms-dark flex items-center justify-center">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentImageIndex}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentImageIndex]}
              alt={heroImageAlts[currentImageIndex]}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-jms-dark/90"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="mb-6 inline-block">
              <span className="px-6 py-2 rounded-full bg-jms-orange/20 border border-jms-orange/50 text-jms-orange font-bold tracking-widest text-sm uppercase backdrop-blur-md shadow-lg shadow-orange-500/20">
                Premium Catering Since 1995
              </span>
            </motion.div>

            <motion.h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-2xl tracking-tight">
              <span className="block mb-2">JMS Catering Services –</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-jms-orange via-red-500 to-jms-red filter drop-shadow-lg">
                Chennai's Finest Caterers
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl md:text-3xl text-gray-200 mb-12 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-md">
              From grand wedding feasts to elegant corporate galas, we create culinary memories that linger forever.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => onNavigate('customer-menu')}
                className="group relative px-10 py-5 bg-gradient-to-r from-jms-red to-red-700 text-white text-xl font-bold rounded-full overflow-hidden shadow-2xl transition-all hover:scale-105 hover:shadow-red-500/40"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                <span className="flex items-center gap-3">
                  View Menu <Utensils size={24} />
                </span>
              </button>

              <button
                className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/30 text-white text-xl font-bold rounded-full transition-all hover:bg-white/10 hover:border-white/50 flex items-center gap-3 shadow-lg"
                onClick={() => window.location.href = 'tel:9840364388'}
              >
                <Phone size={24} /> Call Now
              </button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/70"
        >
          <ChevronDown size={48} strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Services Scrolling Strip (Thinner) */}
      <div className="bg-jms-green overflow-hidden py-3 border-y-4 border-green-700 relative z-20 shadow-xl">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center mx-8 text-white font-black text-lg tracking-wider space-x-8 uppercase">
              <span className="flex items-center gap-2"><Star className="text-yellow-300 fill-yellow-300 animate-pulse" size={16} /> WEDDINGS</span>
              <span className="text-green-300/50">•</span>
              <span className="flex items-center gap-2"><Users className="text-white" size={16} /> CORPORATE EVENTS</span>
              <span className="text-green-300/50">•</span>
              <span className="flex items-center gap-2"><Heart className="text-pink-300 fill-pink-300" size={16} /> HOUSE WARMING</span>
              <span className="text-green-300/50">•</span>
              <span className="flex items-center gap-2"><Utensils className="text-white" size={16} /> INDUSTRIAL CATERING</span>
              <span className="text-green-300/50">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* About Section with Parallax Vibe */}
      <section id="about" className="py-32 relative bg-cover bg-fixed bg-center bg-no-repeat" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(/hero_buffet.png)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-jms-orange/20 rounded-3xl transform rotate-6 scale-105 transition-transform group-hover:rotate-3 duration-500"></div>
              <div className="absolute inset-0 bg-jms-red/20 rounded-3xl transform -rotate-3 scale-105 transition-transform group-hover:-rotate-1 duration-500"></div>
              <img
                src="/chef_cooking.png"
                alt="Chef Cooking"
                className="rounded-3xl shadow-2xl relative z-10 w-full object-cover aspect-[4/5] transform transition-transform duration-700 group-hover:scale-[1.01]"
              />
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-2xl z-20 max-w-sm hidden md:block border border-gray-100">
                <div className="flex items-center gap-5">
                  <div className="bg-jms-red rounded-full p-4 text-white shadow-lg shadow-red-500/30">
                    <Award size={40} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Serving Since</p>
                    <p className="text-4xl font-black text-gray-900">1995</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-lg font-black text-jms-orange uppercase tracking-[0.2em] mb-4">Our Legacy</h2>
              <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-none">
                Tradition Meets <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-jms-red to-orange-600">Perfection</span>
              </h3>
              <p className="text-gray-600 mb-8 text-xl leading-relaxed font-light">
                Founded by <strong>J. Mohan Singh</strong>, we don't just cook food; we craft experiences. Every grain of rice, every drop of ghee is chosen with the precise intent of delighting your guests.
              </p>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed font-light">
                Our team of experienced chefs specializes in authentic traditional vegetarian feasts as well as rich, spicy non-vegetarian delicacies. From intimate ceremonies to grand weddings, we handle every detail with precision.
              </p>

              <div className="grid grid-cols-2 gap-8 mt-12">
                {[
                  { icon: Heart, label: "Pure & Hygienic", desc: "ISO Standards" },
                  { icon: Users, label: "Expert Staff", desc: "Trained Professionals" },
                  { icon: Utensils, label: "Custom Menus", desc: "Tailored to You" },
                  { icon: Star, label: "Premium Quality", desc: "Best Ingredients" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-xl text-jms-dark">
                      <item.icon size={28} />
                    </div>
                    <div>
                      <span className="block font-bold text-lg text-gray-900">{item.label}</span>
                      <span className="text-sm text-gray-500">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Culinary Highlights Gallery with Fixed Background */}
      <section id="menu" className="py-32 relative bg-jms-dark/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Masterpieces on a Plate</h2>
            <div className="w-32 h-2 bg-gradient-to-r from-jms-orange to-jms-red mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { img: '/food_idli.png', title: 'Breakfast', subtitle: 'Divine Mornings', desc: 'Soft Idlis, Crispy Vadas & Chutneys', alt: 'South Indian breakfast catering – Idli Vada spread for events Chennai' },
              { img: '/food_curry.png', title: 'Curries', subtitle: 'Spice Symphony', desc: 'Rich Chettinad & Traditional Gravies', alt: 'Chettinad curry catering for weddings and events in Chennai' },
              { img: '/food_variety.png', title: 'Rice Varieties', subtitle: 'Colorful Feasts', desc: 'Lemon, Tamarind & Curd Rice', alt: 'South Indian rice variety catering – Lemon, Tamarind and Curd rice for functions Chennai' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative h-[500px] overflow-hidden rounded-[2rem] shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                <img
                  src={item.img}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 p-10 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-jms-orange font-bold tracking-widest uppercase text-sm mb-2">{item.subtitle}</p>
                  <h3 className="text-4xl font-bold text-white mb-4">{item.title}</h3>
                  <div className="h-1 w-12 bg-white rounded-full mb-4 group-hover:w-24 transition-all duration-500"></div>
                  <p className="text-gray-300 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-20">
            <button
              onClick={() => onNavigate('customer-menu')}
              className="inline-flex items-center gap-3 px-10 py-4 border-2 border-jms-dark text-jms-dark font-bold text-xl rounded-full hover:bg-jms-dark hover:text-white transition-all duration-300"
            >
              Explore Full Menu <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-jms-dark">Why Choose JMS Catering?</h2>
            <div className="w-24 h-1 bg-jms-green mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: "Quality Guaranteed", desc: "We use only the finest ingredients. No compromise on taste or hygiene. No artificial colors or preservatives.", color: "text-jms-red", border: "border-jms-red" },
              { icon: Utensils, title: "Veg & Non-Veg", desc: "Extensive menu options ranging from authentic traditional feasts to spicy Chettinad non-veg delicacies.", color: "text-jms-green", border: "border-jms-green" },
              { icon: Calendar, title: "Event Management", desc: "Beyond food, we handle the complete dining experience, ensuring your function runs smoothly.", color: "text-jms-orange", border: "border-jms-orange" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className={`bg-white p-10 rounded-3xl shadow-lg border-b-4 ${feature.border} hover:shadow-2xl transition-all`}
              >
                <div className={`w-16 h-16 ${feature.color.replace('text-', 'bg-')}/10 rounded-2xl flex items-center justify-center ${feature.color} mb-6 mx-auto`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Parallax Strip */}
      <section className="py-32 bg-fixed bg-cover bg-center relative" style={{ backgroundImage: 'url(/hero_service.png)' }}>
        <div className="absolute inset-0 bg-jms-red/90 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Why Choose JMS?</h2>
            <p className="text-white/80 text-xl max-w-2xl mx-auto">We bring more than just food to the table; we bring an experience wrapped in tradition and love.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: "Quality First", desc: "Finest ingredients, zero compromise on taste." },
              { icon: Utensils, title: "Authentic Taste", desc: "Traditional recipes passed down generations." },
              { icon: Calendar, title: "Perfect Planning", desc: "Seamless execution of your dream event." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 text-center text-white hover:bg-white/20 transition-all"
              >
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/80 text-lg leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-gray-500 text-lg">Trusted by thousands of families and corporates across Chennai</p>
            <div className="w-24 h-1 bg-jms-orange mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Priya Rajan", event: "Wedding Reception, Adyar", rating: 5, review: "JMS Catering made our wedding feast absolutely memorable. The South Indian spread was authentic, hygienic and every guest was impressed. Highly recommend for wedding catering in Chennai!" },
              { name: "Karthik Venkatesh", event: "Corporate Event, OMR", rating: 5, review: "We hired JMS for our company's annual day with 500 employees. Their professionalism and food quality for corporate catering in Chennai is unmatched. Will definitely book again." },
              { name: "Meena Subramaniam", event: "House Warming, Kattupakkam", rating: 5, review: "From the traditional Pongal to the rice varieties, everything was perfect for our house warming ceremony. JMS Catering is the best caterer we've worked with in Chennai." }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} size={18} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.review}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-sm text-jms-orange">{t.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know about our catering services in Chennai</p>
            <div className="w-24 h-1 bg-jms-green mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "What types of catering services does JMS Catering offer in Chennai?",
                a: "JMS Catering Services offers a full range of catering in Chennai including wedding catering, corporate event catering, house warming ceremonies, birthday & anniversary events, and industrial or office catering. We serve both vegetarian and non-vegetarian South Indian menus."
              },
              {
                q: "How much does wedding catering cost in Chennai?",
                a: "Wedding catering costs in Chennai vary based on the number of guests, menu selection (vegetarian or non-vegetarian), and service style. JMS Catering offers customized packages to suit all budgets. Contact us at 9840364388 for a free personalized quote."
              },
              {
                q: "Does JMS Catering serve vegetarian-only menus?",
                a: "Yes! JMS Catering specializes in both pure vegetarian and non-vegetarian South Indian menus. Our vegetarian spread includes traditional Brahmin-style feasts, Chettinad preparations, and a wide variety of rice dishes, curries, and sweets."
              },
              {
                q: "Where is JMS Catering Services located in Chennai?",
                a: "JMS Catering Services is located at 328, 1st Street, P G Avenue, Kattupakkam, Chennai – 600056. We provide catering services across all areas of Chennai including Anna Nagar, Adyar, OMR, Porur, and surrounding areas."
              },
              {
                q: "How do I book JMS Catering for my event?",
                a: "You can book JMS Catering Services by calling us at 9840364388 (Mr. J. Mohan Singh), or by using the 'Request a Callback' form on our website. We recommend booking at least 2–4 weeks in advance for large events."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-jms-green transition-colors"
              >
                <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-start gap-3">
                  <span className="text-jms-green font-black text-2xl leading-none mt-0.5">Q</span>
                  {faq.q}
                </h3>
                <p className="text-gray-600 leading-relaxed pl-8">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-jms-dark text-white py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-jms-red to-orange-600 p-3 rounded-xl">
                  <span className="font-black text-3xl">JMS</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Catering Services</h2>
              </div>

              <div className="space-y-8 pl-2">
                <div className="flex items-start gap-6 group">
                  <div className="flex-shrink-0 mt-1 bg-gray-800 p-3 rounded-xl text-jms-green group-hover:bg-jms-green group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Visit Our Office</h4>
                    <address className="not-italic text-gray-400 leading-relaxed text-lg">328, 1st Street, P G Avenue,<br />Kattupakkam, Chennai - 600056</address>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="flex-shrink-0 mt-1 bg-gray-800 p-3 rounded-xl text-jms-green group-hover:bg-jms-green group-hover:text-white transition-colors">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Call Us Anytime</h4>
                    <p className="text-white text-3xl font-bold mb-1 tracking-tight">9840364388</p>
                    <p className="text-gray-500">Mr. J. Mohan Singh</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-10 rounded-3xl relative overflow-hidden border border-gray-700 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-jms-red rounded-bl-full opacity-10"></div>
              <h3 className="text-2xl font-bold mb-8">Request a Callback</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <input type="text" placeholder="Your Name" className="w-full px-6 py-4 rounded-xl bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-jms-green focus:bg-gray-800 focus:ring-1 focus:ring-jms-green transition text-lg" />
                </div>
                <div className="space-y-2">
                  <input type="tel" placeholder="Phone Number" className="w-full px-6 py-4 rounded-xl bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-jms-green focus:bg-gray-800 focus:ring-1 focus:ring-jms-green transition text-lg" />
                </div>
                <button className="w-full bg-gradient-to-r from-jms-green to-green-600 hover:from-green-500 hover:to-green-400 text-white py-4 rounded-xl font-bold text-xl shadow-lg shadow-green-900/30 transition-all transform active:scale-95">
                  Request Call Back
                </button>
              </form>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-800/50 text-center text-gray-500 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} JMS Catering Services. All rights reserved.</p>
            <p className="mt-2 md:mt-0 text-sm">Designed with <Heart size={14} className="inline text-red-500 fill-red-500" /> in Chennai</p>
          </div>
        </div>
      </footer>
    </div>
  );
};