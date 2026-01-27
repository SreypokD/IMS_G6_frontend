
# IMS-G6 Frontend

React (Vite) frontend for Inventory Management System (Group 6).

## Setup

1. Install dependencies:
	```sh
	npm install
	```
2. Start the development server:
	```sh
	npm run start
	```

## Project Structure

- `src/`
  - `components/` - Reusable UI components
  - `pages/` - Main app pages (Dashboard, Products, Order Requests, etc.)
  - `app/` - App shell, layout, navigation
  - `context/` - React context for authentication and global state
  - `api/` - API utility functions

## Features
- User authentication (JWT)
- Role-based access (admin, staff, supplier)
- Product, category, supplier, and order request management
- Inventory and reporting dashboard
- Responsive, modern UI

## Backend
See [IMS-G6-backend](../IMS-G6-backend/README.md) for backend setup and API details.
