/**
 * Hrimkar Astro - Language Translation System
 * Supports English and Hindi
 */

const translations = {
    en: {
        // Navigation
        nav_home: "Home",
        nav_about: "About",
        nav_services: "Services",
        nav_navagraha: "Navagraha",
        nav_testimonials: "Testimonials",
        nav_contact: "Contact",
        nav_book_now: "Book Now",
        nav_login: "Login",
        nav_logout: "Logout",
        nav_dashboard: "Dashboard",
        
        // Hero Section
        hero_badge: "Trusted by 5000+ Clients",
        hero_title: "Guiding Lives Through Hrimkar Astro",
        hero_subtitle: "Unlock the secrets of your destiny with authentic Vedic astrology. Expert guidance for marriage, career, health, and spiritual growth.",
        hero_stat_experience: "Years Experience",
        hero_stat_clients: "Happy Clients",
        hero_stat_accuracy: "Accuracy Rate",
        hero_btn_consultation: "Book Consultation",
        hero_btn_services: "Explore Services",
        
        // Services
        services_title: "Our Services",
        services_subtitle: "Comprehensive cosmic guidance tailored to your unique life journey",
        service_vedic: "Vedic Astrology",
        service_vedic_desc: "Complete Kundli analysis with detailed predictions about your life path, personality, and future prospects.",
        service_marriage: "Marriage Matching",
        service_marriage_desc: "Comprehensive Kundli Milan for marriage compatibility including Guna Milan, Manglik analysis, and remedies.",
        service_career: "Career Guidance",
        service_career_desc: "Astrological insights for career decisions, job changes, business ventures, and professional growth.",
        service_health: "Health Astrology",
        service_health_desc: "Medical astrology analysis to understand health tendencies, preventive measures, and wellness guidance.",
        service_tarot: "Tarot Card Reading",
        service_tarot_desc: "Intuitive tarot card guidance for specific questions about love, career, finances, or any life situation.",
        service_numerology: "Numerology",
        service_numerology_desc: "Discover the power of numbers in your life including lucky numbers, name analysis, and life path guidance.",
        service_love: "Love & Compatibility",
        service_love_desc: "Comprehensive relationship guidance for love, marriage compatibility, and harmonious partnerships.",
        
        // Services Section Preview
        services_badge: "Our Expertise",
        most_popular: "Most Popular",
        service_vedic_short: "Authentic birth chart analysis following ancient Jyotish traditions for life guidance.",
        service_marriage_short: "Comprehensive Kundli matching for harmonious and blessed unions.",
        service_career_short: "Discover your true calling and optimal career path through planetary insights.",
        service_tarot_short: "Intuitive card readings for clarity on life's pressing questions.",
        service_numerology_short: "Unlock the power of numbers to understand your life path and destiny.",
        service_love_short: "Comprehensive guidance for love, compatibility, and harmonious partnerships.",
        
        // Nakshatra Section
        nakshatra_title: "The 27 Nakshatras",
        nakshatra_subtitle: "Lunar Mansions of Vedic Astrology",
        nakshatra_moon: "Moon's Journey",
        nakshatra_moon_desc: "The Moon traverses all 27 Nakshatras in approximately 27.3 days",
        nakshatra_birth: "Birth Star",
        nakshatra_birth_desc: "Your Janma Nakshatra reveals your core personality and life path",
        nakshatra_muhurta: "Muhurta",
        nakshatra_muhurta_desc: "Nakshatras determine auspicious timings for important events",
        nakshatra_discover: "Discover Your Nakshatra",
        
        // Common
        book_now: "Book Now",
        learn_more: "Learn More",
        view_all: "View All",
        view_all_services: "View All Services",
        cancel: "Cancel",
        submit: "Submit",
        save: "Save",
        close: "Close",
        loading: "Loading...",
        minutes: "minutes",
        price: "Price",
        duration: "Duration",
        
        // Booking
        booking_title: "Book Your Consultation",
        booking_badge: "Easy Online Booking",
        booking_header: "Book Your",
        booking_header_consultation: "Consultation",
        booking_header_subtitle: "Complete your booking in just a few simple steps",
        booking_step1: "Select Service",
        booking_step2: "Choose Mode",
        booking_step3: "Pick Date",
        booking_step4: "Select Time",
        booking_step5: "Your Details",
        booking_step6: "Review & Pay",
        booking_step7: "Confirmation",
        booking_phone: "Phone Call",
        booking_chat: "Chat",
        booking_select_service: "Select Service",
        booking_next: "Next",
        booking_previous: "Previous",
        booking_confirm: "Confirm Booking",
        
        // Dashboard
        dashboard_title: "My Dashboard",
        dashboard_appointments: "My Appointments",
        dashboard_upcoming: "Upcoming",
        dashboard_completed: "Completed",
        dashboard_cancelled: "Cancelled",
        dashboard_no_appointments: "No appointments found",
        
        // Footer
        footer_about: "About Hrimkar Astro",
        footer_about_text: "Guiding lives through authentic Vedic astrology since 2016. We provide personalized astrological consultations for marriage, career, health, and spiritual growth.",
        footer_brand_text: "Guiding lives through authentic Vedic astrology and Hrimkar Astro since 2015.",
        footer_quick_links: "Quick Links",
        footer_services: "Our Services",
        footer_legal: "Legal",
        footer_contact: "Contact Us",
        footer_rights: "All rights reserved.",
        footer_disclaimer: "Astrology services are advisory in nature. Results may vary based on individual circumstances.",
        
        // CTA Section
        cta_title: "Ready to Discover Your Cosmic Path?",
        cta_subtitle: "Book your personalized consultation today and unlock the wisdom of the stars.",
        cta_book: "Book Consultation",
        cta_view_services: "View Services",
        cta_secure: "Secure & Confidential",
        
        // About Page
        about_title: "About Us",
        about_subtitle: "Your Cosmic Guide",
        about_tagline: "Cosmic Energy That Heals, Guides, and Protects",
        about_heading: "Guiding you through the stars to smarter life choices",
        about_intro: "I am Kavita Shah, an experienced Occult Guru dedicated to helping individuals overcome life's challenges through the power of karma and cosmic wisdom.",
        about_para1: "For more than a decade, I have been practicing Occult Sciences, with deep expertise in Vedic Astrology and Krishnamurthy Paddhati (KP System), known for its accuracy and practical predictions.",
        about_para2: "Alongside astrology, I offer Numerology guidance, including mobile number selection, to help align personal energies with success, peace, and clarity. My guidance is honest, ethical, and focused on real-life solutions.",
        about_para3: "Through the wisdom of karma, I help transform difficult times into simple, practical solutions. From hard times to clear solutions – that's my promise to you.",
        about_years_exp: "Years of Experience",
        about_consultations: "Consultations",
        about_rating: "Rating",
        
        // Why Choose Me Section
        why_choose_badge: "Why Choose Me",
        why_choose_title: "Trust & Expertise",
        why_choose_subtitle: "Guided by Karma, Empowered by Knowledge",
        trust_item1_title: "Occult Guru with 10+ Years of Experience",
        trust_item1_desc: "Over a decade of dedicated practice in occult sciences, helping thousands transform their lives through cosmic wisdom.",
        trust_item2_title: "Expert in Vedic Astrology & Krishnamurthy Paddhati",
        trust_item2_desc: "Specialized in both traditional Vedic astrology and the highly accurate KP System for precise predictions.",
        trust_item3_title: "Karma-Based Life Guidance",
        trust_item3_desc: "My approach focuses on understanding your karmic patterns to provide meaningful, life-changing guidance.",
        trust_item4_title: "Numerology & Mobile Number Selection",
        trust_item4_desc: "Expert numerology consultations including personalized mobile number selection for positive life alignment.",
        trust_item5_title: "Practical, Ethical & Solution-Oriented",
        trust_item5_desc: "Honest guidance focused on real-life solutions. No false promises – just practical wisdom to help you navigate life.",
        
        // Areas of Expertise
        expertise_badge: "My Specializations",
        expertise_title: "Areas of Expertise",
        expertise_subtitle: "Transforming difficult times into simple, practical solutions",
        expertise_vedic: "Vedic Astrology",
        expertise_vedic_desc: "Deep expertise in traditional Vedic astrology for comprehensive birth chart analysis, predictions, and life guidance based on planetary positions.",
        expertise_kp: "Krishnamurthy Paddhati (KP)",
        expertise_kp_desc: "Specialized in the highly accurate KP System known for its precise timing of events and practical predictions for specific life questions.",
        expertise_numerology: "Numerology",
        expertise_numerology_desc: "Expert numerology consultations to understand your life path, lucky numbers, and personal vibrations for success and harmony.",
        expertise_mobile: "Mobile Number Selection",
        expertise_mobile_desc: "Personalized mobile number selection based on numerology to align your daily communications with positive energy and success.",
        
        // Expertise List Items
        birth_chart_analysis: "Birth Chart Analysis",
        dasha_predictions: "Dasha Predictions",
        marriage_compatibility: "Marriage Compatibility",
        career_guidance: "Career Guidance",
        timing_events: "Timing of Events",
        specific_question: "Specific Question Analysis",
        accurate_predictions: "Accurate Predictions",
        ruling_planets: "Ruling Planets Method",
        life_path_analysis: "Life Path Analysis",
        name_correction: "Name Correction",
        lucky_numbers: "Lucky Numbers",
        personal_year: "Personal Year Forecast",
        auspicious_number: "Auspicious Number Selection",
        energy_alignment: "Energy Alignment",
        business_number: "Business Number Analysis",
        family_harmony: "Family Number Harmony",
        
        // My Approach Section
        approach_badge: "My Philosophy",
        approach_title: "My Approach",
        approach_subtitle: "Honest, ethical guidance focused on real-life solutions",
        approach_karma: "Karma-Centric",
        approach_karma_desc: "Understanding your karmic patterns to provide meaningful guidance that resonates with your soul's journey.",
        approach_compassion: "Compassionate",
        approach_compassion_desc: "Every consultation is handled with empathy, understanding, and genuine care for your wellbeing.",
        approach_practical: "Practical Solutions",
        approach_practical_desc: "No complex rituals or false promises – just actionable advice you can implement in your daily life.",
        approach_ethical: "Ethical Practice",
        approach_ethical_desc: "Complete transparency and honesty. I tell you what you need to hear, not just what you want to hear.",
        
        // Client Stories Section
        client_stories_badge: "Client Stories",
        client_stories_title: "Transformations & Testimonials",
        client_stories_subtitle: "Real experiences from those whose lives have changed",
        read_testimonials: "Read Client Testimonials",
        
        // About CTA
        about_cta_title: "Ready to Transform Your Life Path?",
        about_cta_subtitle: "Book your personalized consultation with Kavita Shah today. From hard times to clear solutions.",
        
        // Cosmic Card Section (index.html)
        cosmic_guidance: "Your Cosmic Guidance",
        cosmic_tagline: "Unlock the secrets of the stars",
        cosmic_birth_chart: "Birth Chart Analysis",
        cosmic_birth_chart_desc: "Decode your destiny through planetary positions",
        cosmic_karma: "Karma & Life Path",
        cosmic_karma_desc: "Understand your karmic journey & purpose",
        cosmic_lucky: "Lucky Numbers",
        cosmic_lucky_desc: "Numerology & mobile number selection",
        cosmic_start: "Start Your Journey",
        cosmic_trust: "10+ Years Experience • 1000+ Lives Transformed",
        
        // Nakshatra Chakra Section
        nakshatra_badge: "27 Lunar Mansions",
        nakshatra_chakra_title: "The Nakshatra Chakra",
        nakshatra_chakra_subtitle: "Discover the celestial constellations that guide your destiny",
        
        // Services Page Detailed
        service_tagline_vedic: "Birth Chart (Kundli) Analysis",
        service_tagline_marriage: "Kundli Milan & Compatibility Analysis",
        service_tagline_career: "Professional & Business Astrology",
        service_tagline_health: "Medical Astrology & Wellness Guidance",
        service_tagline_tarot: "Intuitive Card Guidance",
        service_tagline_numerology: "Power of Numbers",
        service_desc_vedic: "Our comprehensive Vedic astrology consultation provides deep insights into your life path based on the ancient science of Jyotish Shastra. Using your exact birth details, we create and analyze your birth chart to reveal your destiny, strengths, challenges, and life purpose.",
        service_desc_marriage: "Ensure a harmonious and blessed union with our comprehensive marriage matching service. We analyze both partners' birth charts using the traditional Gun Milan system and provide detailed compatibility insights along with remedies for any doshas.",
        service_desc_career: "Discover your true calling and optimal career path through planetary insights. Whether you're choosing a career, considering a job change, or starting a business, our career astrology consultation provides strategic guidance for professional success.",
        service_desc_health: "Identify potential health vulnerabilities and get preventive guidance through medical astrology. Our analysis helps you understand your body's strengths and weaknesses based on planetary positions, enabling proactive health management.",
        service_desc_tarot: "Get clarity on life's pressing questions through intuitive tarot card readings. Our tarot sessions help you gain insights into relationships, career decisions, and spiritual growth through the ancient art of cartomancy.",
        service_desc_numerology: "Unlock the mystical power of numbers to understand your life path, destiny, and personality. Our numerology consultation analyzes your birth date and name to reveal your strengths, challenges, and optimal paths to success.",
        whats_included: "What's Included:",
        available_via: "Available via:",
        call: "Call",
        chat: "Chat",
        book_this_service: "Book This Service",
        testimonials_badge: "What Clients Say",
        testimonials_title: "Client Testimonials",
        testimonials_subtitle: "Real stories of transformation and guidance",
        
        // Contact
        contact_title: "Get In Touch",
        contact_subtitle: "Get in touch with us",
        contact_hero_subtitle: "Connect with us for divine guidance and celestial wisdom. We're here to illuminate your path.",
        contact_name: "Your Name",
        contact_email: "Your Email",
        contact_phone: "Your Phone",
        contact_message: "Your Message",
        contact_send: "Send Message",
        
        // Auth
        login_title: "Welcome Back",
        login_subtitle: "Sign in to your account",
        login_email: "Email Address",
        login_password: "Password",
        login_btn: "Sign In",
        login_forgot: "Forgot Password?",
        login_no_account: "Don't have an account?",
        login_signup: "Sign Up",
        signup_title: "Create Account",
        signup_subtitle: "Join Hrimkar Astro today",
        signup_firstname: "First Name",
        signup_lastname: "Last Name",
        signup_btn: "Create Account",
        signup_have_account: "Already have an account?",
        
        // Language
        language: "Language",
        lang_english: "English",
        lang_hindi: "हिंदी"
    },
    
    hi: {
        // Navigation
        nav_home: "होम",
        nav_about: "हमारे बारे में",
        nav_services: "सेवाएं",
        nav_navagraha: "नवग्रह",
        nav_testimonials: "प्रशंसापत्र",
        nav_contact: "संपर्क",
        nav_book_now: "अभी बुक करें",
        nav_login: "लॉग इन",
        nav_logout: "लॉग आउट",
        nav_dashboard: "डैशबोर्ड",
        
        // Hero Section
        hero_badge: "5000+ ग्राहकों द्वारा विश्वसनीय",
        hero_title: "हृमकार ज्योतिष के माध्यम से जीवन का मार्गदर्शन",
        hero_subtitle: "प्रामाणिक वैदिक ज्योतिष के साथ अपने भाग्य के रहस्यों को खोलें। विवाह, करियर, स्वास्थ्य और आध्यात्मिक विकास के लिए विशेषज्ञ मार्गदर्शन।",
        hero_stat_experience: "वर्षों का अनुभव",
        hero_stat_clients: "खुश ग्राहक",
        hero_stat_accuracy: "सटीकता दर",
        hero_btn_consultation: "परामर्श बुक करें",
        hero_btn_services: "सेवाएं देखें",
        
        // Services
        services_title: "हमारी सेवाएं",
        services_subtitle: "आपकी अनूठी जीवन यात्रा के अनुरूप व्यापक ब्रह्मांडीय मार्गदर्शन",
        service_vedic: "वैदिक ज्योतिष",
        service_vedic_desc: "आपके जीवन पथ, व्यक्तित्व और भविष्य की संभावनाओं के बारे में विस्तृत भविष्यवाणियों के साथ पूर्ण कुंडली विश्लेषण।",
        service_marriage: "विवाह मिलान",
        service_marriage_desc: "गुण मिलान, मांगलिक विश्लेषण और उपायों सहित विवाह अनुकूलता के लिए व्यापक कुंडली मिलान।",
        service_career: "करियर मार्गदर्शन",
        service_career_desc: "करियर निर्णयों, नौकरी परिवर्तन, व्यावसायिक उद्यमों और पेशेवर विकास के लिए ज्योतिषीय अंतर्दृष्टि।",
        service_health: "स्वास्थ्य ज्योतिष",
        service_health_desc: "स्वास्थ्य प्रवृत्तियों, निवारक उपायों और कल्याण मार्गदर्शन को समझने के लिए चिकित्सा ज्योतिष विश्लेषण।",
        service_tarot: "टैरो कार्ड रीडिंग",
        service_tarot_desc: "प्रेम, करियर, वित्त या किसी भी जीवन स्थिति के बारे में विशिष्ट प्रश्नों के लिए सहज टैरो कार्ड मार्गदर्शन।",
        service_numerology: "अंकशास्त्र",
        service_numerology_desc: "भाग्यशाली संख्याओं, नाम विश्लेषण और जीवन पथ मार्गदर्शन सहित अपने जीवन में संख्याओं की शक्ति खोजें।",
        service_love: "प्रेम और अनुकूलता",
        service_love_desc: "प्रेम, विवाह अनुकूलता और सामंजस्यपूर्ण साझेदारी के लिए व्यापक संबंध मार्गदर्शन।",
        
        // Services Section Preview
        services_badge: "हमारी विशेषज्ञता",
        most_popular: "सबसे लोकप्रिय",
        service_vedic_short: "जीवन मार्गदर्शन के लिए प्राचीन ज्योतिष परंपराओं का अनुसरण करते हुए प्रामाणिक जन्म कुंडली विश्लेषण।",
        service_marriage_short: "सामंजस्यपूर्ण और आशीर्वादित मिलन के लिए व्यापक कुंडली मिलान।",
        service_career_short: "ग्रहों की अंतर्दृष्टि के माध्यम से अपनी सच्ची बुलाहट और इष्टतम करियर पथ खोजें।",
        service_tarot_short: "जीवन के महत्वपूर्ण प्रश्नों के लिए सहज कार्ड रीडिंग।",
        service_numerology_short: "अपने जीवन पथ और भाग्य को समझने के लिए संख्याओं की शक्ति को अनलॉक करें।",
        service_love_short: "प्रेम, अनुकूलता और सामंजस्यपूर्ण साझेदारी के लिए व्यापक मार्गदर्शन।",
        
        // Nakshatra Section
        nakshatra_title: "27 नक्षत्र",
        nakshatra_subtitle: "वैदिक ज्योतिष के चंद्र मंडल",
        nakshatra_moon: "चंद्रमा की यात्रा",
        nakshatra_moon_desc: "चंद्रमा लगभग 27.3 दिनों में सभी 27 नक्षत्रों की यात्रा करता है",
        nakshatra_birth: "जन्म नक्षत्र",
        nakshatra_birth_desc: "आपका जन्म नक्षत्र आपके मूल व्यक्तित्व और जीवन पथ को प्रकट करता है",
        nakshatra_muhurta: "मुहूर्त",
        nakshatra_muhurta_desc: "नक्षत्र महत्वपूर्ण कार्यक्रमों के लिए शुभ समय निर्धारित करते हैं",
        nakshatra_discover: "अपना नक्षत्र खोजें",
        
        // Common
        book_now: "अभी बुक करें",
        learn_more: "और जानें",
        view_all: "सभी देखें",
        view_all_services: "सभी सेवाएं देखें",
        cancel: "रद्द करें",
        submit: "जमा करें",
        save: "सहेजें",
        close: "बंद करें",
        loading: "लोड हो रहा है...",
        minutes: "मिनट",
        price: "कीमत",
        duration: "अवधि",
        
        // Booking
        booking_title: "अपना परामर्श बुक करें",
        booking_badge: "आसान ऑनलाइन बुकिंग",
        booking_header: "अपना बुक करें",
        booking_header_consultation: "परामर्श",
        booking_header_subtitle: "कुछ सरल चरणों में अपनी बुकिंग पूरी करें",
        booking_step1: "सेवा चुनें",
        booking_step2: "मोड चुनें",
        booking_step3: "तारीख चुनें",
        booking_step4: "समय चुनें",
        booking_step5: "आपका विवरण",
        booking_step6: "समीक्षा और भुगतान",
        booking_step7: "पुष्टि",
        booking_phone: "फोन कॉल",
        booking_chat: "चैट",
        booking_select_service: "सेवा चुनें",
        booking_next: "अगला",
        booking_previous: "पिछला",
        booking_confirm: "बुकिंग की पुष्टि करें",
        
        // Dashboard
        dashboard_title: "मेरा डैशबोर्ड",
        dashboard_appointments: "मेरी अपॉइंटमेंट्स",
        dashboard_upcoming: "आगामी",
        dashboard_completed: "पूर्ण",
        dashboard_cancelled: "रद्द",
        dashboard_no_appointments: "कोई अपॉइंटमेंट नहीं मिली",
        
        // Footer
        footer_about: "हृमकार ज्योतिष के बारे में",
        footer_about_text: "2016 से प्रामाणिक वैदिक ज्योतिष के माध्यम से जीवन का मार्गदर्शन। हम विवाह, करियर, स्वास्थ्य और आध्यात्मिक विकास के लिए व्यक्तिगत ज्योतिषीय परामर्श प्रदान करते हैं।",
        footer_brand_text: "2015 से प्रामाणिक वैदिक ज्योतिष और हृमकार ज्योतिष के माध्यम से जीवन का मार्गदर्शन।",
        footer_quick_links: "त्वरित लिंक",
        footer_services: "हमारी सेवाएं",
        footer_legal: "कानूनी",
        footer_contact: "संपर्क करें",
        footer_rights: "सर्वाधिकार सुरक्षित।",
        footer_disclaimer: "ज्योतिष सेवाएं सलाहकार प्रकृति की हैं। परिणाम व्यक्तिगत परिस्थितियों के आधार पर भिन्न हो सकते हैं।",
        
        // CTA Section
        cta_title: "अपना ब्रह्मांडीय मार्ग खोजने के लिए तैयार हैं?",
        cta_subtitle: "आज ही अपना व्यक्तिगत परामर्श बुक करें और सितारों की बुद्धि को अनलॉक करें।",
        cta_book: "परामर्श बुक करें",
        cta_view_services: "सेवाएं देखें",
        cta_secure: "सुरक्षित और गोपनीय",
        
        // About Page
        about_title: "हमारे बारे में",
        about_subtitle: "आपके ब्रह्मांडीय मार्गदर्शक",
        about_tagline: "ब्रह्मांडीय ऊर्जा जो ठीक करती है, मार्गदर्शन करती है और रक्षा करती है",
        about_heading: "सितारों के माध्यम से आपको बेहतर जीवन विकल्पों की ओर मार्गदर्शन",
        about_intro: "मैं कविता शाह हूं, एक अनुभवी ओकल्ट गुरु जो कर्म और ब्रह्मांडीय ज्ञान की शक्ति के माध्यम से व्यक्तियों को जीवन की चुनौतियों से उबरने में मदद करने के लिए समर्पित हूं।",
        about_para1: "एक दशक से अधिक समय से, मैं ओकल्ट विज्ञान का अभ्यास कर रही हूं, वैदिक ज्योतिष और कृष्णमूर्ति पद्धति (केपी सिस्टम) में गहरी विशेषज्ञता के साथ, जो अपनी सटीकता और व्यावहारिक भविष्यवाणियों के लिए जानी जाती है।",
        about_para2: "ज्योतिष के साथ-साथ, मैं अंकशास्त्र मार्गदर्शन प्रदान करती हूं, जिसमें मोबाइल नंबर चयन शामिल है, ताकि व्यक्तिगत ऊर्जाओं को सफलता, शांति और स्पष्टता के साथ संरेखित किया जा सके।",
        about_para3: "कर्म की बुद्धि के माध्यम से, मैं कठिन समय को सरल, व्यावहारिक समाधानों में बदलने में मदद करती हूं। कठिन समय से स्पष्ट समाधान तक - यही मेरा आपसे वादा है।",
        about_years_exp: "वर्षों का अनुभव",
        about_consultations: "परामर्श",
        about_rating: "रेटिंग",
        
        // Why Choose Me Section
        why_choose_badge: "मुझे क्यों चुनें",
        why_choose_title: "विश्वास और विशेषज्ञता",
        why_choose_subtitle: "कर्म द्वारा निर्देशित, ज्ञान द्वारा सशक्त",
        trust_item1_title: "10+ वर्षों के अनुभव वाले ओकल्ट गुरु",
        trust_item1_desc: "ओकल्ट विज्ञान में एक दशक से अधिक का समर्पित अभ्यास, हजारों लोगों के जीवन को ब्रह्मांडीय ज्ञान के माध्यम से बदलने में मदद।",
        trust_item2_title: "वैदिक ज्योतिष और कृष्णमूर्ति पद्धति में विशेषज्ञ",
        trust_item2_desc: "सटीक भविष्यवाणियों के लिए पारंपरिक वैदिक ज्योतिष और अत्यधिक सटीक केपी सिस्टम दोनों में विशेषज्ञता।",
        trust_item3_title: "कर्म-आधारित जीवन मार्गदर्शन",
        trust_item3_desc: "मेरा दृष्टिकोण आपके कर्मिक पैटर्न को समझने पर केंद्रित है ताकि सार्थक, जीवन-बदलने वाला मार्गदर्शन प्रदान किया जा सके।",
        trust_item4_title: "अंकशास्त्र और मोबाइल नंबर चयन",
        trust_item4_desc: "सकारात्मक जीवन संरेखण के लिए व्यक्तिगत मोबाइल नंबर चयन सहित विशेषज्ञ अंकशास्त्र परामर्श।",
        trust_item5_title: "व्यावहारिक, नैतिक और समाधान-उन्मुख",
        trust_item5_desc: "वास्तविक जीवन समाधानों पर केंद्रित ईमानदार मार्गदर्शन। कोई झूठे वादे नहीं - बस जीवन को नेविगेट करने में मदद करने के लिए व्यावहारिक ज्ञान।",
        
        // Areas of Expertise
        expertise_badge: "मेरी विशेषज्ञताएं",
        expertise_title: "विशेषज्ञता के क्षेत्र",
        expertise_subtitle: "कठिन समय को सरल, व्यावहारिक समाधानों में बदलना",
        expertise_vedic: "वैदिक ज्योतिष",
        expertise_vedic_desc: "ग्रहों की स्थिति के आधार पर व्यापक जन्म कुंडली विश्लेषण, भविष्यवाणियों और जीवन मार्गदर्शन के लिए पारंपरिक वैदिक ज्योतिष में गहरी विशेषज्ञता।",
        expertise_kp: "कृष्णमूर्ति पद्धति (केपी)",
        expertise_kp_desc: "घटनाओं के सटीक समय और विशिष्ट जीवन प्रश्नों के लिए व्यावहारिक भविष्यवाणियों के लिए जानी जाने वाली अत्यधिक सटीक केपी प्रणाली में विशेषज्ञता।",
        expertise_numerology: "अंकशास्त्र",
        expertise_numerology_desc: "सफलता और सामंजस्य के लिए अपने जीवन पथ, भाग्यशाली संख्याओं और व्यक्तिगत कंपन को समझने के लिए विशेषज्ञ अंकशास्त्र परामर्श।",
        expertise_mobile: "मोबाइल नंबर चयन",
        expertise_mobile_desc: "सकारात्मक ऊर्जा और सफलता के साथ अपने दैनिक संचार को संरेखित करने के लिए अंकशास्त्र पर आधारित व्यक्तिगत मोबाइल नंबर चयन।",
        
        // Expertise List Items
        birth_chart_analysis: "जन्म कुंडली विश्लेषण",
        dasha_predictions: "दशा भविष्यवाणियां",
        marriage_compatibility: "विवाह अनुकूलता",
        career_guidance: "करियर मार्गदर्शन",
        timing_events: "घटनाओं का समय",
        specific_question: "विशिष्ट प्रश्न विश्लेषण",
        accurate_predictions: "सटीक भविष्यवाणियां",
        ruling_planets: "शासक ग्रह विधि",
        life_path_analysis: "जीवन पथ विश्लेषण",
        name_correction: "नाम सुधार",
        lucky_numbers: "भाग्यशाली अंक",
        personal_year: "व्यक्तिगत वर्ष पूर्वानुमान",
        auspicious_number: "शुभ संख्या चयन",
        energy_alignment: "ऊर्जा संरेखण",
        business_number: "व्यापार संख्या विश्लेषण",
        family_harmony: "पारिवारिक संख्या सामंजस्य",
        
        // My Approach Section
        approach_badge: "मेरा दर्शन",
        approach_title: "मेरा दृष्टिकोण",
        approach_subtitle: "वास्तविक जीवन समाधानों पर केंद्रित ईमानदार, नैतिक मार्गदर्शन",
        approach_karma: "कर्म-केंद्रित",
        approach_karma_desc: "आपके कर्मिक पैटर्न को समझना ताकि सार्थक मार्गदर्शन प्रदान किया जा सके जो आपकी आत्मा की यात्रा के साथ प्रतिध्वनित हो।",
        approach_compassion: "दयालु",
        approach_compassion_desc: "हर परामर्श को सहानुभूति, समझ और आपकी भलाई के लिए वास्तविक देखभाल के साथ संभाला जाता है।",
        approach_practical: "व्यावहारिक समाधान",
        approach_practical_desc: "कोई जटिल अनुष्ठान या झूठे वादे नहीं - बस कार्रवाई योग्य सलाह जिसे आप अपने दैनिक जीवन में लागू कर सकते हैं।",
        approach_ethical: "नैतिक अभ्यास",
        approach_ethical_desc: "पूर्ण पारदर्शिता और ईमानदारी। मैं आपको वह बताती हूं जो आपको सुनने की जरूरत है, न कि सिर्फ वह जो आप सुनना चाहते हैं।",
        
        // Client Stories Section
        client_stories_badge: "ग्राहक कहानियां",
        client_stories_title: "परिवर्तन और प्रशंसापत्र",
        client_stories_subtitle: "उन लोगों के वास्तविक अनुभव जिनका जीवन बदल गया",
        read_testimonials: "ग्राहक प्रशंसापत्र पढ़ें",
        
        // About CTA
        about_cta_title: "अपने जीवन पथ को बदलने के लिए तैयार हैं?",
        about_cta_subtitle: "आज ही कविता शाह के साथ अपना व्यक्तिगत परामर्श बुक करें। कठिन समय से स्पष्ट समाधान तक।",
        
        // Cosmic Card Section (index.html)
        cosmic_guidance: "आपका ब्रह्मांडीय मार्गदर्शन",
        cosmic_tagline: "सितारों के रहस्यों को खोलें",
        cosmic_birth_chart: "जन्म कुंडली विश्लेषण",
        cosmic_birth_chart_desc: "ग्रहों की स्थिति के माध्यम से अपने भाग्य को डिकोड करें",
        cosmic_karma: "कर्म और जीवन पथ",
        cosmic_karma_desc: "अपनी कर्मिक यात्रा और उद्देश्य को समझें",
        cosmic_lucky: "भाग्यशाली अंक",
        cosmic_lucky_desc: "अंकशास्त्र और मोबाइल नंबर चयन",
        cosmic_start: "अपनी यात्रा शुरू करें",
        cosmic_trust: "10+ वर्षों का अनुभव • 1000+ जीवन परिवर्तित",
        
        // Nakshatra Chakra Section
        nakshatra_badge: "27 चंद्र मंडल",
        nakshatra_chakra_title: "नक्षत्र चक्र",
        nakshatra_chakra_subtitle: "उन खगोलीय नक्षत्रों की खोज करें जो आपके भाग्य का मार्गदर्शन करते हैं",
        
        // Services Page Detailed
        service_tagline_vedic: "जन्म कुंडली विश्लेषण",
        service_tagline_marriage: "कुंडली मिलान और अनुकूलता विश्लेषण",
        service_tagline_career: "पेशेवर और व्यापार ज्योतिष",
        service_tagline_health: "चिकित्सा ज्योतिष और कल्याण मार्गदर्शन",
        service_tagline_tarot: "सहज कार्ड मार्गदर्शन",
        service_tagline_numerology: "संख्याओं की शक्ति",
        service_desc_vedic: "हमारा व्यापक वैदिक ज्योतिष परामर्श ज्योतिष शास्त्र के प्राचीन विज्ञान के आधार पर आपके जीवन पथ में गहरी अंतर्दृष्टि प्रदान करता है। आपके सटीक जन्म विवरण का उपयोग करके, हम आपके भाग्य, शक्तियों, चुनौतियों और जीवन के उद्देश्य को प्रकट करने के लिए आपकी जन्म कुंडली बनाते और विश्लेषण करते हैं।",
        service_desc_marriage: "हमारी व्यापक विवाह मिलान सेवा के साथ एक सामंजस्यपूर्ण और आशीर्वादित मिलन सुनिश्चित करें। हम पारंपरिक गुण मिलान प्रणाली का उपयोग करके दोनों साथियों की जन्म कुंडली का विश्लेषण करते हैं और किसी भी दोष के लिए उपायों के साथ विस्तृत अनुकूलता अंतर्दृष्टि प्रदान करते हैं।",
        service_desc_career: "ग्रहों की अंतर्दृष्टि के माध्यम से अपनी सच्ची बुलाहट और इष्टतम करियर पथ खोजें। चाहे आप करियर चुन रहे हों, नौकरी बदलने पर विचार कर रहे हों, या व्यवसाय शुरू कर रहे हों, हमारा करियर ज्योतिष परामर्श पेशेवर सफलता के लिए रणनीतिक मार्गदर्शन प्रदान करता है।",
        service_desc_health: "चिकित्सा ज्योतिष के माध्यम से संभावित स्वास्थ्य कमजोरियों की पहचान करें और निवारक मार्गदर्शन प्राप्त करें। हमारा विश्लेषण आपको ग्रहों की स्थिति के आधार पर आपके शरीर की शक्तियों और कमजोरियों को समझने में मदद करता है।",
        service_desc_tarot: "सहज टैरो कार्ड रीडिंग के माध्यम से जीवन के महत्वपूर्ण प्रश्नों पर स्पष्टता प्राप्त करें। हमारे टैरो सत्र आपको कार्टोमैंसी की प्राचीन कला के माध्यम से संबंधों, करियर निर्णयों और आध्यात्मिक विकास में अंतर्दृष्टि प्राप्त करने में मदद करते हैं।",
        service_desc_numerology: "अपने जीवन पथ, भाग्य और व्यक्तित्व को समझने के लिए संख्याओं की रहस्यमय शक्ति को अनलॉक करें। हमारा अंकशास्त्र परामर्श आपकी जन्म तिथि और नाम का विश्लेषण करता है।",
        whats_included: "क्या शामिल है:",
        available_via: "उपलब्ध माध्यम:",
        call: "कॉल",
        chat: "चैट",
        book_this_service: "यह सेवा बुक करें",
        testimonials_badge: "ग्राहक क्या कहते हैं",
        testimonials_title: "ग्राहक प्रशंसापत्र",
        testimonials_subtitle: "परिवर्तन और मार्गदर्शन की वास्तविक कहानियां",
        
        // Contact
        contact_title: "संपर्क में रहें",
        contact_subtitle: "हमसे संपर्क करें",
        contact_hero_subtitle: "दैवीय मार्गदर्शन और ब्रह्मांडीय ज्ञान के लिए हमसे जुड़ें। हम आपके मार्ग को प्रकाशित करने के लिए यहां हैं।",
        contact_name: "आपका नाम",
        contact_email: "आपका ईमेल",
        contact_phone: "आपका फोन",
        contact_message: "आपका संदेश",
        contact_send: "संदेश भेजें",
        
        // Auth
        login_title: "वापसी पर स्वागत है",
        login_subtitle: "अपने खाते में साइन इन करें",
        login_email: "ईमेल पता",
        login_password: "पासवर्ड",
        login_btn: "साइन इन करें",
        login_forgot: "पासवर्ड भूल गए?",
        login_no_account: "खाता नहीं है?",
        login_signup: "साइन अप करें",
        signup_title: "खाता बनाएं",
        signup_subtitle: "आज ही हृमकार ज्योतिष से जुड़ें",
        signup_firstname: "पहला नाम",
        signup_lastname: "अंतिम नाम",
        signup_btn: "खाता बनाएं",
        signup_have_account: "पहले से खाता है?",
        
        // Language
        language: "भाषा",
        lang_english: "English",
        lang_hindi: "हिंदी"
    }
};

// Language Manager
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('hrimkar_lang') || 'en';
        this.init();
    }
    
    init() {
        // Apply saved language on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.applyLanguage(this.currentLang);
            this.updateToggleButton();
        });
    }
    
    // Toggle between English and Hindi
    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'hi' : 'en';
        localStorage.setItem('hrimkar_lang', this.currentLang);
        this.applyLanguage(this.currentLang);
        this.updateToggleButton();
    }
    
    // Set specific language
    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('hrimkar_lang', lang);
            this.applyLanguage(lang);
            this.updateToggleButton();
        }
    }
    
    // Get translation for a key
    t(key) {
        return translations[this.currentLang][key] || translations['en'][key] || key;
    }
    
    // Apply language to all elements with data-translate attribute
    applyLanguage(lang) {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(el => {
            const key = el.getAttribute('data-translate');
            const translation = translations[lang][key] || translations['en'][key];
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
        
        // Update HTML lang attribute
        document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
        
        // Dispatch custom event for dynamic content
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    
    // Update the toggle button appearance
    updateToggleButton() {
        const btn = document.getElementById('langToggleBtn');
        const btnText = document.getElementById('langToggleText');
        if (btn && btnText) {
            btnText.textContent = this.currentLang === 'en' ? 'हिंदी' : 'EN';
            btn.title = this.currentLang === 'en' ? 'Switch to Hindi' : 'Switch to English';
        }
    }
    
    // Get current language
    getCurrentLang() {
        return this.currentLang;
    }
}

// Initialize language manager
const langManager = new LanguageManager();

// Global function for toggle button
function toggleLanguage() {
    langManager.toggleLanguage();
}
