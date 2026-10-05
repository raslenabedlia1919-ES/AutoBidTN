# 🚗 AutoBid TN

AutoBid TN is a full-stack car marketplace and auction platform inspired by online automotive auction websites.

The application allows users to browse vehicles, search and filter cars, save favorites, participate in auctions, place bids in real time, and manage their own vehicle listings.

## ✨ Features

- User registration and login
- JWT authentication
- Browse cars
- Search and advanced filters
- Sorting and pagination
- Car details
- Favorites
- Comments
- Create and manage car listings
- Create auctions
- Auction status management
- Real-time bidding with Socket.IO
- Automatic auction ending
- Winner determination
- User dashboard
- Seller dashboard
- Responsive interface

## 🛠️ Technologies

### Frontend

- React
- React Router
- Axios
- Socket.IO Client
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO

## 📁 Project Structure

```text
AutoBidTN/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── .gitignore
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .gitignore
│   └── package.json
│
└── README.md
