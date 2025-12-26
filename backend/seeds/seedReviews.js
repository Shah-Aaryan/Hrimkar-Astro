/**
 * Seed Reviews Script
 * Populates the database with sample testimonials
 * Run with: node seeds/seedReviews.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Review = require('../models/Review');
const User = require('../models/User');

const sampleReviews = [
    {
        name: 'Rajesh Kumar',
        occupation: 'IT Professional',
        location: 'Bangalore',
        rating: 5,
        title: 'Life-changing Career Guidance',
        content: "Pandit Shastri Ji's prediction about my career change came true within 6 months. His guidance helped me take the leap at the right time, and I'm now in my dream job. The accuracy of his birth chart reading was remarkable.",
        category: 'career',
        serviceType: 'Career Guidance',
        isFeatured: true,
        isApproved: true
    },
    {
        name: 'Priya & Amit Sharma',
        occupation: 'Married Couple',
        location: 'Delhi',
        rating: 5,
        title: 'Found Our Perfect Match',
        content: "After years of failed relationships, the marriage matching consultation gave us confidence to proceed. Guruji explained the doshas and remedies clearly. We've been happily married for 3 years now. Forever grateful!",
        category: 'marriage',
        serviceType: 'Marriage Matching',
        isFeatured: true,
        isApproved: true
    },
    {
        name: 'Sunita Verma',
        occupation: 'Homemaker',
        location: 'Mumbai',
        rating: 5,
        title: 'Perfect Education Guidance',
        content: "I was skeptical at first, but the detailed analysis of my son's education horoscope helped us make the right choice for his higher studies. He's now pursuing his passion and thriving academically.",
        category: 'vedic',
        serviceType: 'Education Astrology',
        isFeatured: true,
        isApproved: true
    },
    {
        name: 'Ananya Singh',
        occupation: 'Software Engineer',
        location: 'Hyderabad',
        rating: 5,
        content: 'The birth chart analysis was incredibly detailed. Pandit Ji explained complex concepts in simple terms. His prediction about my overseas travel came true!',
        category: 'vedic',
        serviceType: 'Birth Chart Analysis',
        isApproved: true
    },
    {
        name: 'Rohit Malhotra',
        occupation: 'Marketing Manager',
        location: 'Pune',
        rating: 4,
        content: 'Career consultation helped me understand my strengths. Got promoted within 3 months of following the suggested remedies. Highly recommend!',
        category: 'career',
        serviceType: 'Career Consultation',
        isApproved: true
    },
    {
        name: 'Kavita Patel',
        occupation: 'Teacher',
        location: 'Ahmedabad',
        rating: 5,
        content: "Got my daughter's kundli matched here. Very thorough analysis and transparent about both positive aspects and doshas. Remedies were practical.",
        category: 'marriage',
        serviceType: 'Kundli Matching',
        isApproved: true
    },
    {
        name: 'Divya Kapoor',
        occupation: 'Fashion Designer',
        location: 'Mumbai',
        rating: 5,
        content: 'Amazing tarot reading session! The insights about my creative blocks were spot on. Feeling more confident about my new collection launch now.',
        category: 'tarot',
        serviceType: 'Tarot Reading',
        isApproved: true
    },
    {
        name: 'Arun Nair',
        occupation: 'Business Owner',
        location: 'Kerala',
        rating: 5,
        content: 'Been consulting for 5 years now. Every major business decision I make is after consulting Pandit Ji. His timing predictions have never failed me.',
        category: 'vedic',
        serviceType: 'Business Astrology',
        isApproved: true
    },
    {
        name: 'Sneha Reddy',
        occupation: 'Doctor',
        location: 'Chennai',
        rating: 5,
        content: 'Was confused about specialization choice. The career consultation gave me clarity and confidence. Now happily pursuing Cardiology as predicted!',
        category: 'career',
        serviceType: 'Career Guidance',
        isApproved: true
    },
    {
        name: 'Vikram Chauhan',
        occupation: 'Entrepreneur',
        location: 'Jaipur',
        rating: 5,
        title: 'Business Success Through Astrology',
        content: 'Started my business based on the muhurat suggested by Pandit Ji. First year revenue exceeded expectations. The planetary remedies have brought amazing results.',
        category: 'vedic',
        serviceType: 'Business Muhurat',
        isFeatured: true,
        isApproved: true
    },
    {
        name: 'Meera Krishnan',
        occupation: 'Bank Manager',
        location: 'Kochi',
        rating: 4,
        content: 'The annual horoscope prediction was very accurate. Helped me plan my finances and personal life better. Will definitely consult again.',
        category: 'vedic',
        serviceType: 'Annual Prediction',
        isApproved: true
    },
    {
        name: 'Sanjay Gupta',
        occupation: 'Retired Professor',
        location: 'Lucknow',
        rating: 5,
        content: "Have been following Pandit Ji's guidance for over a decade. His remedies helped my family through difficult times. A true gem in the field of astrology.",
        category: 'general',
        serviceType: 'General Consultation',
        isApproved: true
    },
    {
        name: 'Neha Sharma',
        occupation: 'HR Professional',
        location: 'Gurgaon',
        rating: 5,
        content: 'The tarot reading gave me insights I never expected. Pandit Ji has a gift for connecting with energies. Highly recommended for anyone seeking guidance.',
        category: 'tarot',
        serviceType: 'Tarot Reading',
        isApproved: true
    },
    {
        name: 'Arjun Menon',
        occupation: 'Film Director',
        location: 'Mumbai',
        rating: 5,
        content: 'Got my movie launch muhurat from here. The film was a success! Now I consult for all my projects. Pandit Ji understands the creative industry well.',
        category: 'vedic',
        serviceType: 'Muhurat Selection',
        isApproved: true
    },
    {
        name: 'Pooja Agarwal',
        occupation: 'Lawyer',
        location: 'Delhi',
        rating: 4,
        content: 'Very professional consultation. The marriage compatibility report was detailed and helped us understand our relationship dynamics better.',
        category: 'marriage',
        serviceType: 'Compatibility Analysis',
        isApproved: true
    }
];

const seedReviews = async () => {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get a user to associate reviews with (or create a dummy one)
        let user = await User.findOne({ role: 'admin' });
        
        if (!user) {
            user = await User.findOne();
        }
        
        if (!user) {
            console.log('Creating a dummy user for reviews...');
            user = await User.create({
                firstName: 'System',
                lastName: 'Reviews',
                email: 'reviews@hrimkarastro.com',
                phone: '+911234567890',
                password: 'ReviewSystem123!',
                role: 'admin'
            });
        }

        // Clear existing reviews
        await Review.deleteMany({});
        console.log('Cleared existing reviews');

        // Add user reference to all reviews
        const reviewsWithUser = sampleReviews.map(review => ({
            ...review,
            user: user._id,
            isVisible: true
        }));

        // Insert reviews
        await Review.insertMany(reviewsWithUser);
        console.log(`Successfully seeded ${sampleReviews.length} reviews!`);

        // Get stats
        const stats = await Review.getAverageRating();
        console.log(`\nReview Stats:`);
        console.log(`- Total Reviews: ${stats.totalReviews}`);
        console.log(`- Average Rating: ${stats.averageRating}/5`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding reviews:', error);
        process.exit(1);
    }
};

seedReviews();
