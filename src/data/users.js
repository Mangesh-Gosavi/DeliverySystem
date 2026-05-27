/**
 * MOCK ACCOUNTS — stands in for a real auth backend (there is none).
 *
 * Two roles drive the entire app's access control:
 *   role: "user"  → a customer. Sees ONLY the orders that belong to their
 *                   userId. No edit / status-update controls.
 *   role: "team"  → an internal team member. Sees EVERY customer's orders and
 *                   can update / edit order status from one dashboard.
 *
 * `userId` is the unique login handle. `password` lives here only because this
 * is a no-backend demo — never ship plaintext credentials in a real product.
 */
export const ACCOUNTS = [
  {
    userId: 'CUST-1001',
    password: 'customer123',
    role: 'user',
    name: 'Rohit Sharma',
    title: 'Procurement Lead',
    // The customer only ever sees orders whose userId matches their own.
    company: 'Bosch Mobility',
  },
  {
    userId: 'TEAM-2001',
    password: 'team123',
    role: 'team',
    name: 'Mangesh Gosavi',
    title: 'Production Coordinator',
  },
]

/**
 * Maps each customer company in the order book to a unique customer userId.
 * Only "Bosch Mobility" (CUST-1001) has a real login above — the rest exist so
 * the team dashboard can show, search and filter a realistic spread of
 * customers by their userId.
 */
export const CUSTOMER_DIRECTORY = {
  'Bosch Mobility': 'CUST-1001',
  'Mahindra Aerospace': 'CUST-1004',
  'Tata Hitachi': 'CUST-1005',
  'Cummins India': 'CUST-1006',
  'Larsen & Toubro': 'CUST-1007',
  'ABB Robotics': 'CUST-1008',
  'Siemens Energy': 'CUST-1009',
  'Ashok Leyland': 'CUST-1010',
}

/** The two demo logins, surfaced on the login screen as one-tap fill buttons. */
export const DEMO_LOGINS = [
  { label: 'Customer', userId: 'CUST-1001', password: 'customer123', role: 'user' },
  { label: 'Team member', userId: 'TEAM-2001', password: 'team123', role: 'team' },
]
