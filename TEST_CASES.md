# Smart Rental Marketplace - Test Cases

## Test Case 1: Advanced Search Functionality with Multiple Filters
**Test Case ID**: TC001
**Priority**: High
**Category**: Search & Discovery

**Objective**: Verify that users can search for items using multiple filters and get accurate results

**Pre-conditions**: 
- User is logged into the application
- Multiple items are available in different categories
- Items have varied pricing and locations

**Test Steps**:
1. Navigate to the search/browse page
2. Enter search keyword: "Camera" in the search bar
3. Apply the following filters:
   - Category: "Electronics"
   - Price Range: "$10 - $50 per day"
   - Location: "Within 5 miles"
   - Availability: "Next 7 days"
4. Click "Apply Filters" or "Search" button
5. Verify search results display
6. Clear filters and search for "Tools"
7. Apply filter: Category "Tools & Equipment"
8. Sort results by "Price: Low to High"
9. Click on a search result to view item details
10. Use back button to return to search results

**Expected Results**:
- Search bar accepts text input and displays suggestions
- Applied filters are visually indicated as active
- Search results show only items matching all applied criteria
- Results display item images, titles, prices, and ratings
- Item count is displayed (e.g., "23 items found")
- Sorting changes the order of results appropriately
- Item details page loads with complete information
- Navigation between search results and item details works smoothly

**Test Data**:
- Search keywords: "Camera", "Tools", "Bicycle", "Drill"
- Location radius: 1, 5, 10, 25 miles
- Price ranges: $0-25, $25-50, $50-100, $100+ per day

---

## Test Case 2: Search with No Results and Error Handling
**Test Case ID**: TC002
**Priority**: Medium
**Category**: Search & Discovery

**Objective**: Verify search behavior when no results are found and error handling

**Pre-conditions**: 
- User has access to search functionality
- Application has a database with sample items

**Test Steps**:
1. Navigate to search page
2. Enter unusual search term: "Quantum Flux Capacitor"
3. Apply any available filters
4. Submit search request
5. Verify "no results" message displays
6. Try searching with special characters: "@@##$$"
7. Test empty search (no keywords, no filters)
8. Search with extremely long text (200+ characters)
9. Test search with only spaces: "     "
10. Verify search suggestions appear for partial matches

**Expected Results**:
- "No results found" message displays clearly when no items match
- Suggested alternative searches or similar items are shown
- Application handles special characters gracefully without errors
- Empty searches show all available items or prompt for input
- Long text is truncated appropriately
- Space-only searches are treated as empty
- Search suggestions help users find relevant items

**Test Data**:
- Invalid search terms: "xyz123nonexistent", "!@#$%", ""
- Valid partial terms: "cam" (for camera), "tool" (for tools)

---

## Test Case 3: Real-time Messaging Between Users
**Test Case ID**: TC003
**Priority**: High
**Category**: Communication

**Objective**: Verify that users can send and receive messages in real-time during booking discussions

**Pre-conditions**: 
- Two user accounts are created (Renter and Lender)
- At least one active booking request exists between them
- Both users have access to messaging functionality

**Test Steps**:
1. Login as Renter (User A)
2. Navigate to "My Bookings" or "Messages"
3. Click on conversation with Lender (User B)
4. Type message: "Hi! Is the camera available this weekend?"
5. Click "Send" button
6. Keep browser/tab open
7. In another browser/tab, login as Lender (User B)
8. Navigate to messages and open conversation with Renter
9. Verify the message from Renter is visible
10. Type reply: "Yes, it's available! When would you like to pick it up?"
11. Send the reply
12. Return to Renter's browser tab (without refreshing)
13. Verify the reply appears automatically
14. Send follow-up message with attachment/image
15. Test message timestamps and read status

**Expected Results**:
- Messages send successfully without page refresh
- Real-time delivery: messages appear instantly in recipient's chat
- Message timestamps are accurate and properly formatted
- Read status indicators work correctly
- Message history is preserved and loads properly
- Attachment uploads work (if supported)
- Conversation thread maintains proper order
- Notifications appear for new messages

**Test Data**:
- Sample messages of varying lengths
- Image attachments (if supported)
- Special characters and emojis in messages

---

## Test Case 4: Message Thread Management and History
**Test Case ID**: TC004
**Priority**: Medium
**Category**: Communication

**Objective**: Verify message thread organization, search within messages, and conversation history management

**Pre-conditions**: 
- User has multiple conversations with different users
- Conversations contain various message types and lengths
- Message history spans multiple days/weeks

**Test Steps**:
1. Login and navigate to messages section
2. Verify all conversations are listed chronologically
3. Open oldest conversation and scroll to view entire history
4. Use search function within conversation (if available)
5. Search for specific keyword across all conversations
6. Test message actions:
   - Delete individual messages
   - Mark conversation as read/unread
   - Archive conversation (if available)
7. Create new conversation by messaging a new contact
8. Send messages with different content types:
   - Plain text
   - Long text (500+ characters)
   - URLs and links
   - Numbers and special characters
9. Navigate between multiple conversation tabs/windows
10. Test notification settings for messages

**Expected Results**:
- Conversation list shows most recent activity first
- Message history loads completely without missing messages
- Search functionality finds relevant messages quickly
- Message actions (delete, mark read) work correctly
- New conversations integrate properly with existing list
- All content types display correctly in messages
- Navigation between conversations is smooth
- Notification preferences save and apply correctly
- Message delivery confirmations work properly

**Test Data**:
- Conversations with 50+ messages each
- Messages containing URLs, phone numbers, addresses
- Search keywords: "pickup", "camera", "weekend", "price"

---

## Test Case 5: Advanced Search Filters and Sorting
**Test Case ID**: TC003
**Priority**: High
**Category**: Listing Management

**Objective**: Verify that lenders can successfully create a new item listing

**Pre-conditions**: 
- User is logged in as a lender or both roles
- User has access to create listing functionality

**Test Steps**:
1. Login to application
2. Navigate to "Create Listing" or "Add Item" section
3. Fill out listing form:
   - Title: "Professional DSLR Camera"
   - Category: "Electronics > Cameras"
   - Description: "Canon EOS R5 with 24-70mm lens, perfect for photography projects"
   - Daily Rate: "$25"
   - Weekly Rate: "$150"
   - Security Deposit: "$200"
4. Upload at least 3 high-quality images
5. Set location: "New York, NY"
6. Set availability dates (next 30 days)
7. Add features: ["Image Stabilization", "4K Video", "Weather Sealed"]
8. Set pickup/delivery options
9. Click "Publish Listing" button

**Expected Results**:
- All form fields accept valid input
- Images upload successfully (max 5MB each)
- Listing is created and appears in user's "My Listings"
- Listing is searchable by other users
- Availability calendar is properly configured
- Confirmation message: "Listing created successfully!"

**Test Data**:
- Valid item information
- High-resolution images under size limit
- Realistic pricing information

---

## Test Case 4: Search and Filter Items
**Test Case ID**: TC004
**Priority**: Medium
**Category**: Search & Discovery

**Objective**: Verify that users can search for items and apply filters effectively

**Pre-conditions**: 
- Multiple listings exist in the system
- User has access to search functionality

**Test Steps**:
1. Navigate to search/browse page
2. Enter search term: "camera" in search bar
3. Click search button
4. Verify results display relevant items
5. Apply filters:
   - Category: "Electronics"
   - Price range: "$10 - $50" per day
   - Location: Within 25 miles
   - Availability: Next week
6. Verify filtered results update accordingly
7. Click on a listing to view details
8. Test "Clear Filters" functionality

**Expected Results**:
- Search returns relevant results within 3 seconds
- Filters properly narrow down results
- Result count updates with each filter applied
- Item details page loads with complete information
- Clear filters resets to all available items
- No results message appears when no items match criteria

**Test Data**:
- Various search terms (camera, tools, bike, etc.)
- Different filter combinations

---

## Test Case 5: Booking Request and Approval Workflow
**Test Case ID**: TC005
**Priority**: High
**Category**: Booking Management

**Objective**: Verify the complete booking workflow from request to approval

**Pre-conditions**: 
- Renter account is created and verified
- Lender has active listings available
- Both users are logged in

**Test Steps**:
1. Login as renter
2. Search and select an available item
3. Choose rental dates (3 days from now, for 2 days)
4. Click "Book Now" button
5. Fill booking details:
   - Message to owner: "Hi, I need this for a weekend photography project"
   - Confirm pickup location
   - Review total cost breakdown
6. Submit booking request
7. Logout and login as lender
8. Navigate to "Booking Requests" or notifications
9. Review booking request details
10. Click "Approve" button
11. Add approval message: "Sounds good! Available for pickup anytime after 9 AM"
12. Confirm approval

**Expected Results**:
- Booking form calculates total cost correctly (daily rate × days + deposit)
- Request is submitted successfully
- Lender receives notification of new booking request
- Booking details are clearly displayed to lender
- Approval updates booking status to "Approved"
- Both parties receive notification of approval
- Booking appears in both user's dashboards

**Test Data**:
- Available item with clear pricing
- Valid rental period dates

---

## Test Case 6: In-App Messaging System
**Test Case ID**: TC006
**Priority**: Medium
**Category**: Communication

**Objective**: Verify that users can communicate through the in-app messaging system

**Pre-conditions**: 
- Two users are registered (renter and lender)
- Active booking exists between the users

**Test Steps**:
1. Login as renter
2. Navigate to active booking
3. Click "Message Owner" button
4. Type message: "What time works best for pickup tomorrow?"
5. Send message
6. Logout and login as lender
7. Check notifications for new message indicator
8. Navigate to messages or booking conversation
9. Read received message
10. Reply: "Anytime between 9 AM and 6 PM works for me"
11. Send reply
12. Login back as renter and verify message received

**Expected Results**:
- Message interface is easily accessible from bookings
- Messages send instantly without errors
- Notification indicators appear for new messages
- Message history is preserved and displayed chronologically
- Real-time or near real-time message delivery
- Messages are associated with correct booking/users

**Test Data**:
- Active booking between two verified users
- Various message types (questions, confirmations, etc.)

---

## Test Case 7: Payment Processing and Transaction
**Test Case ID**: TC007
**Priority**: High
**Category**: Payment System

**Objective**: Verify that payment processing works correctly for approved bookings

**Pre-conditions**: 
- Booking has been approved by lender
- Renter has valid payment method
- Payment system is configured

**Test Steps**:
1. Login as renter with approved booking
2. Navigate to "My Bookings" or payment pending section
3. Click "Complete Payment" on approved booking
4. Review booking summary:
   - Item: Professional DSLR Camera
   - Dates: Dec 1-3, 2025
   - Daily rate: $25 × 2 days = $50
   - Security deposit: $200
   - Total: $250
5. Enter payment information:
   - Card number: 4242424242424242 (test card)
   - Expiry: 12/26
   - CVV: 123
   - Name: John Doe
6. Click "Pay Now" button
7. Verify payment success confirmation
8. Check booking status updates to "Paid"

**Expected Results**:
- Payment form displays correct booking total
- Payment form accepts valid test card information
- Payment processes without errors
- Success confirmation displays with transaction ID
- Booking status updates to "Paid" or "Confirmed"
- Both parties receive payment confirmation notifications
- Transaction appears in user's payment history

**Test Data**:
- Valid test credit card numbers
- Approved booking with calculated totals

---

## Test Case 8: Review and Rating System
**Test Case ID**: TC008
**Priority**: Medium
**Category**: Review System

**Objective**: Verify that users can leave reviews and ratings after completed rentals

**Pre-conditions**: 
- Rental period has been completed
- Item has been returned
- Both parties participated in the rental

**Test Steps**:
1. Login as renter after rental completion
2. Navigate to "Past Bookings" or "Review Pending" section
3. Find completed rental
4. Click "Leave Review" button
5. Fill review form:
   - Rating: 5 stars
   - Review title: "Excellent camera and great owner!"
   - Review text: "The camera worked perfectly for my project. Owner was responsive and flexible with pickup. Highly recommend!"
   - Rate categories:
     - Item condition: 5 stars
     - Communication: 5 stars
     - Overall experience: 5 stars
6. Submit review
7. Login as lender
8. Leave counter-review for renter:
   - Rating: 5 stars
   - Review: "Great renter! Took excellent care of the equipment and returned it on time and in perfect condition."
9. Submit review

**Expected Results**:
- Review form is accessible after rental completion
- All rating categories can be selected (1-5 stars)
- Text review accepts up to character limit
- Review submits successfully
- Reviews appear on both user profiles
- Average ratings update on user profiles
- Reviews display on item listing page
- Mutual review system works for both parties

**Test Data**:
- Completed rental transaction
- Various rating combinations and review text lengths

---

## Test Execution Notes

**Environment**: Production environment at https://smart-rental-marketplace.vercel.app
**Browser Compatibility**: Test on Chrome, Firefox, Safari, Edge
**Mobile Testing**: Verify responsive design on mobile devices
**Data Cleanup**: Use test accounts that can be cleaned up after testing

**Pass Criteria**: 
- All test steps complete without errors
- Expected results match actual results
- No broken functionality or UI issues
- Performance is acceptable (page loads within 5 seconds)

**Fail Criteria**:
- Any step fails to execute as expected
- Error messages appear inappropriately
- Data is not saved correctly
- UI elements are not responsive or accessible