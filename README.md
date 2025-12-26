# ✨ Cosmic Wisdom Astrology - Premium Consultation Website

A modern, premium astrology consultation website featuring 3D interactive Navagraha planets, booking system, user dashboards, and admin panel.

![Website Preview](images/preview.png)

## 🌟 Features

### Frontend Features
- **3D Interactive Navagraha Planets** - Beautiful Three.js rendered planets with glow effects and click interactions
- **Premium Design** - Deep blue, royal purple, and gold color scheme with cosmic aesthetics
- **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations** - CSS3 and JavaScript animations throughout

### Core Pages
| Page | Description |
|------|-------------|
| `index.html` | Home page with hero section, services preview, 3D planets, testimonials |
| `about.html` | Astrologer bio, guru lineage, expertise, and certifications |
| `services.html` | Service offerings with pricing and consultation modes |
| `planets.html` | Dedicated Navagraha page with detailed planetary information |
| `booking.html` | Calendar-based booking with timezone support and payment integration |
| `contact.html` | Contact form, FAQ section, consultation hours |
| `testimonials.html` | Customer reviews and ratings |

### User System
| Page | Description |
|------|-------------|
| `login.html` | Authentication with login/register forms, social login, OTP support |
| `dashboard.html` | User dashboard with appointments, reports, chat history, settings |

### Admin Panel
| Page | Description |
|------|-------------|
| `admin.html` | Admin dashboard with scheduling, booking management, analytics |

### Legal Pages
| Page | Description |
|------|-------------|
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service |
| `disclaimer.html` | Astrology disclaimer |
| `refund.html` | Refund and cancellation policy |

## 📁 Project Structure

```
MOM/
├── index.html
├── about.html
├── services.html
├── planets.html
├── booking.html
├── contact.html
├── testimonials.html
├── login.html
├── dashboard.html
├── admin.html
├── privacy.html
├── terms.html
├── disclaimer.html
├── refund.html
├── README.md
│
├── css/
│   ├── styles.css      # Main stylesheet with CSS variables
│   ├── planets.css     # 3D planet styling and modals
│   ├── forms.css       # Form elements, calendar, payment UI
│   ├── dashboard.css   # User dashboard layouts
│   ├── admin.css       # Admin panel styles
│   └── auth.css        # Authentication page styling
│
├── js/
│   ├── main.js         # Core navigation, mobile menu, sliders
│   ├── planets.js      # Three.js Navagraha implementation
│   ├── booking.js      # Calendar generation, booking flow
│   ├── dashboard.js    # Dashboard navigation and charts
│   ├── admin.js        # Admin panel functionality
│   └── auth.js         # Form validation, OTP handling
│
└── images/             # Add your images here (see below)
```

## 🖼️ Required Images

Create an `images/` folder and add the following:

### Essential Images
| Filename | Dimensions | Description |
|----------|------------|-------------|
| `astrologer.jpg` | 500x600px | Main astrologer portrait photo |
| `astrologer-about.jpg` | 600x800px | Full-length or alternate photo for About page |
| `hero-bg.jpg` | 1920x1080px | Hero section background (cosmic/stars theme) |
| `logo.png` | 200x60px | Website logo (transparent PNG) |
| `favicon.ico` | 32x32px | Browser tab icon |

### Service Images
| Filename | Dimensions | Description |
|----------|------------|-------------|
| `service-kundli.jpg` | 400x300px | Kundli/birth chart image |
| `service-matchmaking.jpg` | 400x300px | Matchmaking/compatibility image |
| `service-career.jpg` | 400x300px | Career guidance image |
| `service-remedies.jpg` | 400x300px | Remedies/gemstones image |

### Planet Textures (Optional for 3D enhancement)
| Filename | Dimensions | Description |
|----------|------------|-------------|
| `sun-texture.jpg` | 1024x512px | Sun surface texture |
| `moon-texture.jpg` | 1024x512px | Moon surface texture |
| `mars-texture.jpg` | 1024x512px | Mars surface texture |
| `mercury-texture.jpg` | 1024x512px | Mercury surface texture |
| `jupiter-texture.jpg` | 1024x512px | Jupiter surface texture |
| `venus-texture.jpg` | 1024x512px | Venus surface texture |
| `saturn-texture.jpg` | 1024x512px | Saturn surface texture |
| `rahu-texture.jpg` | 1024x512px | Rahu (shadow) texture |
| `ketu-texture.jpg` | 1024x512px | Ketu (shadow) texture |

### Testimonial Avatars
| Filename | Dimensions | Description |
|----------|------------|-------------|
| `testimonial-1.jpg` | 100x100px | Customer photo 1 |
| `testimonial-2.jpg` | 100x100px | Customer photo 2 |
| `testimonial-3.jpg` | 100x100px | Customer photo 3 |

## 🎨 Color Palette

```css
:root {
    --cosmic-blue: #0a1628;      /* Primary background */
    --deep-space: #050d18;       /* Darker sections */
    --royal-purple: #6b21a8;     /* Accent purple */
    --gold: #fbbf24;             /* Primary accent */
    --gold-dark: #d97706;        /* Darker gold */
    --silver: #9ca3af;           /* Secondary text */
    --mystic-teal: #0d9488;      /* Alternative accent */
}
```

## 🔧 Customization

### Update Contact Information
Search and replace these placeholders across all files:
- `+91 98765 43210` → Your phone number
- `contact@cosmicwisdom.com` → Your email
- `123 Celestial Tower, Zodiac Lane, Mumbai` → Your address

### Update Astrologer Details
Edit `about.html` to add:
- Your name and bio
- Education and certifications
- Years of experience
- Guru lineage (if applicable)

### Update Pricing
Edit `services.html` and `booking.html` to reflect your actual pricing structure.

### Add Google Analytics
Add before `</head>` in all HTML files:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### Add Payment Gateway
The booking page is pre-configured for demo purposes. To add real payments:

1. **Razorpay Integration:**
   ```javascript
   // Replace in booking.js
   var options = {
       key: 'YOUR_RAZORPAY_KEY',
       amount: amount * 100, // in paise
       currency: 'INR',
       // ... rest of config
   };
   ```

2. **Stripe Integration:**
   Follow Stripe's documentation for Indian Rupee payments.

## 🚀 Deployment

### Option 1: Static Hosting (Recommended for start)
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Push to gh-pages branch

### Option 2: Traditional Hosting
Upload all files to your web hosting via FTP/SFTP.

### Option 3: With Backend
To add authentication and booking backend:
1. Set up Node.js/Express or PHP backend
2. Create database (MongoDB/MySQL)
3. Update form actions to point to your API endpoints

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Opera 67+

## 🔒 Security Considerations

Before going live:
1. Add SSL certificate (HTTPS)
2. Implement proper form validation on backend
3. Add CSRF protection
4. Set up rate limiting for API endpoints
5. Sanitize all user inputs
6. Implement proper authentication (JWT/Sessions)

## 📄 License

This template is provided for personal and commercial use. Please customize content and images before deployment.

## 🙏 Credits

- **Fonts**: Google Fonts (Cormorant Garamond, Montserrat)
- **Icons**: Font Awesome 6.4.0
- **3D Library**: Three.js
- **Design Inspiration**: Traditional Vedic aesthetics with modern web design

---

**Need Help?** Contact the developer for customization and deployment assistance.

⭐ Star this repository if you found it helpful!
