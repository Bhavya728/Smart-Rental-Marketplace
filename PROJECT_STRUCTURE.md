# Smart Rental Marketplace - Project Structure

```
Smart-Rental-Marketplace/
├── .git/
├── .gitignore
├── .venv/
├── .vscode/
│   └── settings.json
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .env.production
│   ├── .gitignore
│   ├── BACKEND_TEST_SUMMARY.md
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── vercel.json
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── constants.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── chatController.js
│   │   ├── listingController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   ├── searchController.js
│   │   ├── userController.js
│   │   └── verificationController.js
│   ├── logs/
│   │   ├── combined.log
│   │   └── error.log
│   ├── middleware/
│   │   ├── adminAuth.js
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/
│   │   ├── AuditLog.js
│   │   ├── Booking.js
│   │   ├── Conversation.js
│   │   ├── index.js
│   │   ├── Listing.js
│   │   ├── Message.js
│   │   ├── Review.js
│   │   ├── Transaction.js
│   │   ├── User.js
│   │   └── VerificationCode.js
│   ├── public/
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── searchRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   ├── services/
│   │   ├── adminService.js
│   │   ├── analyticsService.js
│   │   ├── bookingService.js
│   │   ├── chatService.js
│   │   ├── cloudinaryService.js
│   │   ├── emailService.js
│   │   ├── imageService.js
│   │   ├── listingService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   ├── reviewService.js
│   │   ├── searchService.js
│   │   └── userService.js
│   ├── socket/
│   │   └── socketManager.js
│   ├── temp/
│   │   └── uploads/
│   ├── tests/
│   │   └── phase5-search-tests.js
│   └── utils/
│       ├── catchAsync.js
│       ├── codeGenerator.js
│       ├── errorHandler.js
│       ├── logger.js
│       └── validation.js
├── build.sh
├── docs/
│   ├── APPROVAL_WORKFLOW.md
│   ├── FRONTEND_TESTING_GUIDE.md
│   ├── NAVIGATION_ROUTING_VERIFICATION.md
│   └── REVIEW_SYSTEM.md
├── frontend/
│   ├── .env
│   ├── .env.production
│   ├── .gitignore
│   ├── index.html
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── package.test.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── test-script.cjs
│   ├── vercel.json
│   ├── vite.config.js
│   ├── coverage/
│   │   ├── base.css
│   │   ├── block-navigation.js
│   │   ├── favicon.png
│   │   ├── index.html
│   │   ├── lcov.info
│   │   ├── prettify.css
│   │   ├── prettify.js
│   │   ├── sort-arrow-sprite.png
│   │   ├── sorter.js
│   │   └── lcov-report/
│   │       ├── (detailed coverage files...)
│   │       └── src/
│   │           ├── components/
│   │           ├── config/
│   │           ├── contexts/
│   │           ├── hooks/
│   │           ├── pages/
│   │           ├── routes/
│   │           ├── services/
│   │           ├── styles/
│   │           └── utils/
│   ├── dist/
│   │   ├── index.html
│   │   ├── _redirects
│   │   └── assets/
│   │       ├── index-24279126.js
│   │       ├── index-24279126.js.map
│   │       ├── index-7f27f217.css
│   │       ├── router-47c6dbd0.js
│   │       ├── router-47c6dbd0.js.map
│   │       ├── ui-44e7eb9e.js
│   │       ├── ui-44e7eb9e.js.map
│   │       ├── vendor-af01e41c.js
│   │       └── vendor-af01e41c.js.map
│   ├── public/
│   │   └── _redirects
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       │   ├── icons/
│       │   └── images/
│       ├── components/
│       │   ├── admin/
│       │   │   ├── ActivityChart.jsx
│       │   │   ├── AuditLog.jsx
│       │   │   ├── DashboardStats.jsx
│       │   │   ├── index.js
│       │   │   ├── ListingTable.jsx
│       │   │   ├── QuickActions.jsx
│       │   │   ├── RevenueChart.jsx
│       │   │   └── UserTable.jsx
│       │   ├── auth/
│       │   │   ├── AdminRoute.jsx
│       │   │   ├── AuthGuard.jsx
│       │   │   ├── EmailVerificationForm.jsx
│       │   │   ├── ForgotPasswordForm.jsx
│       │   │   ├── index.js
│       │   │   ├── LoginForm.jsx
│       │   │   ├── NavigationGuard.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   ├── RegisterForm.jsx
│       │   │   └── ResetPasswordForm.jsx
│       │   ├── booking/
│       │   │   ├── ApprovalStep.jsx
│       │   │   ├── BookingCard.jsx
│       │   │   ├── BookingForm.jsx
│       │   │   ├── BookingTimeline.jsx
│       │   │   ├── BookingWidget.jsx
│       │   │   ├── CostBreakdown.jsx
│       │   │   ├── DateSelector.jsx
│       │   │   └── MockPayment.jsx
│       │   ├── chat/
│       │   │   ├── ChatSidebar.jsx
│       │   │   ├── ChatWindow.jsx
│       │   │   ├── ConversationItem.jsx
│       │   │   ├── MessageBubble.jsx
│       │   │   ├── MessageInput.jsx
│       │   │   ├── MessageList.jsx
│       │   │   ├── OnlineStatus.jsx
│       │   │   └── TypingIndicator.jsx
│       │   ├── damage/
│       │   ├── layout/
│       │   │   ├── Container.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Navbar.jsx
│       │   │   └── Navigation.jsx
│       │   ├── listings/
│       │   │   ├── AvailabilityCalendar.jsx
│       │   │   ├── CategorySelector.jsx
│       │   │   ├── ImageUploader.jsx
│       │   │   ├── ListingCard.jsx
│       │   │   ├── ListingForm.jsx
│       │   │   ├── ListingGrid.jsx
│       │   │   └── PricingSection.jsx
│       │   ├── notifications/
│       │   │   ├── NotificationCenter.jsx
│       │   │   └── RenterNotificationCenter.jsx
│       │   ├── profile/
│       │   │   ├── PhotoUpload.jsx
│       │   │   ├── ProfileEditForm.jsx
│       │   │   ├── ProfileHeader.jsx
│       │   │   ├── ProfileStats.jsx
│       │   │   └── RatingDisplay.jsx
│       │   ├── reviews/
│       │   │   ├── RatingStars.jsx
│       │   │   ├── ReviewCard.jsx
│       │   │   ├── ReviewForm.jsx
│       │   │   ├── ReviewList.jsx
│       │   │   ├── ReviewStats.jsx
│       │   │   └── ReviewWidget.jsx
│       │   ├── search/
│       │   │   ├── FilterPanel.jsx
│       │   │   ├── index.js
│       │   │   ├── MapView.jsx
│       │   │   ├── QuickFilters.jsx
│       │   │   ├── SavedSearches.jsx
│       │   │   ├── SearchBar.jsx
│       │   │   ├── SearchResults.jsx
│       │   │   └── SearchSuggestions.jsx
│       │   └── ui/
│       │       ├── Accordion.jsx
│       │       ├── Alert.jsx
│       │       ├── AnimatedCounter.jsx
│       │       ├── Avatar.jsx
│       │       ├── Badge.jsx
│       │       ├── Breadcrumb.jsx
│       │       ├── Button.jsx
│       │       ├── Card.jsx
│       │       ├── Carousel.jsx
│       │       ├── Chart.jsx
│       │       ├── Checkbox.jsx
│       │       ├── DateRangePicker.css
│       │       ├── DateRangePicker.jsx
│       │       ├── Dropdown.jsx
│       │       ├── EmptyState.jsx
│       │       ├── FileUpload.jsx
│       │       ├── ImageGallery.jsx
│       │       ├── index.js
│       │       ├── Input.jsx
│       │       ├── LoadingSpinner.jsx
│       │       ├── LoadingStates.jsx
│       │       ├── MicroInteractions.jsx
│       │       ├── Modal.jsx
│       │       ├── PageTransition.jsx
│       │       ├── ProgressBar.jsx
│       │       ├── Radio.jsx
│       │       ├── RangeSlider.jsx
│       │       ├── ScrollArea.jsx
│       │       ├── SearchInput.jsx
│       │       ├── Skeleton.jsx
│       │       ├── StatCard.jsx
│       │       ├── Stepper.jsx
│       │       ├── Switch.jsx
│       │       ├── Table.jsx
│       │       ├── Tabs.jsx
│       │       ├── Tag.jsx
│       │       ├── Toast.jsx
│       │       └── Tooltip.jsx
│       ├── config/
│       │   ├── api.js
│       │   └── constants.js
│       ├── contexts/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   ├── useDebounce.js
│       │   ├── useGeolocation.js
│       │   ├── useInfiniteScroll.js
│       │   └── useSocket.js
│       ├── pages/
│       │   ├── About.jsx
│       │   ├── Accessibility.jsx
│       │   ├── BookingCheckout.jsx
│       │   ├── BookingConfirmation.jsx
│       │   ├── BookingDetail.jsx
│       │   ├── CategoryPage.jsx
│       │   ├── Cookies.jsx
│       │   ├── CreateListing.jsx
│       │   ├── EditListing.jsx
│       │   ├── EditProfile.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── Home.jsx
│       │   ├── HowItWorks.jsx
│       │   ├── ListingDetail.jsx
│       │   ├── ListingsPage.jsx
│       │   ├── Login.jsx
│       │   ├── Messages.css
│       │   ├── Messages.jsx
│       │   ├── MyBookings.jsx
│       │   ├── MyListings.jsx
│       │   ├── Privacy.jsx
│       │   ├── Profile.jsx
│       │   ├── Register.jsx
│       │   ├── Reviews.jsx
│       │   ├── SearchPage.jsx
│       │   ├── SearchPage_Fixed.jsx
│       │   ├── Terms.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── Analytics.jsx
│       │       ├── Listings.jsx
│       │       └── Users.jsx
│       ├── routes/
│       │   ├── PrivateRoute.jsx
│       │   └── PublicRoute.jsx
│       ├── services/
│       │   ├── adminService.js
│       │   ├── api.js
│       │   ├── apiClient.js
│       │   ├── authService.js
│       │   ├── bookingService.js
│       │   ├── chatService.js
│       │   ├── listingService.js
│       │   ├── messageService.js
│       │   ├── paymentService.js
│       │   ├── reviewService.js
│       │   ├── searchService.js
│       │   ├── socketService.js
│       │   └── userService.js
│       ├── styles/
│       │   ├── animations.css
│       │   ├── reviews.css
│       │   └── theme.js
│       └── utils/
│           ├── animations.js
│           ├── auth.js
│           ├── cn.js
│           ├── formatters.js
│           ├── index.js
│           ├── requestCircuitBreaker.js
│           ├── searchDebug.js
│           └── transitions.jsx
├── index.html
├── node_modules/
├── package-frontend.json
├── package-lock.json
├── package.json
├── PROJECT_OVERVIEW.md
├── Test Case Example (2).pdf
├── TEST_CASES.md
└── vite.config.js
```

## Project Overview

This is a full-stack **Smart Rental Marketplace** application built with:

### Backend (Node.js/Express)
- **Architecture**: RESTful API with MVC pattern
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with email verification
- **File Upload**: Cloudinary integration
- **Real-time**: Socket.io for chat functionality
- **Features**: Listings, bookings, reviews, payments, admin panel

### Frontend (React/Vite)
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS with custom components
- **State Management**: Context API with custom hooks
- **Routing**: React Router v6
- **UI Components**: Custom component library
- **Features**: Responsive design, real-time chat, search & filters

### Key Features
- User authentication and profile management
- Listing creation and management
- Advanced search with filters
- Booking system with approval workflow
- Real-time messaging
- Review and rating system
- Payment integration (mock)
- Admin dashboard
- Responsive design

### Deployment
- **Frontend**: Vercel (Static deployment)
- **Backend**: Vercel (Serverless functions)
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary