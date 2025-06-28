# JMT Archery Payment Gateway System

## Overview

The JMT Archery Payment Gateway is a comprehensive payment processing system that simulates real-world payment gateways with multiple payment methods, transaction tracking, and verification systems.

## Features

### 🏦 Payment Methods Supported
- **Digital Wallets**: DANA, GoPay, ShopeePay, LinkAja
- **Bank Transfers**: BCA, Mandiri, BRI, BNI, BSI
- **Cards**: Credit Card, Debit Card, Debit
- **Real-time Processing**: Simulated payment processing with realistic delays

### 🔐 Payment Security & Verification
- **Transaction IDs**: Unique identifiers for each payment
- **Verification Codes**: 6-digit codes for payment verification
- **Payment Expiration**: 24-hour payment windows
- **Status Tracking**: Real-time payment status updates

### 📊 Payment Status Management
- **Pending**: Payment initiated but not yet processed
- **Processing**: Payment being processed by gateway
- **Success**: Payment completed successfully
- **Failed**: Payment failed or rejected
- **Expired**: Payment window expired

### 📱 User Interface Features
- **Payment Selection**: Intuitive payment method selection with icons
- **Payment Instructions**: Step-by-step instructions for each payment method
- **Transaction Details**: Complete payment information display
- **Receipt Generation**: Printable and downloadable payment receipts
- **Order History**: Comprehensive order and payment tracking

## API Endpoints

### Payment Processing

#### `POST /api/payment`
Process a new payment transaction.

**Request Body:**
```json
{
  "orderId": 123,
  "amount": 500000,
  "method": "dana",
  "bank": "bca", // Optional, for bank transfers
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pembayaran DANA sedang diproses. Silakan selesaikan pembayaran di aplikasi DANA.",
  "payment": {
    "id": 1,
    "transactionId": "TXN-1703123456789-ABC123DEF",
    "status": "processing",
    "verificationCode": "123456",
    "expiresAt": "2024-12-22T10:30:00.000Z"
  }
}
```

#### `GET /api/payment`
Get payment status by transaction ID or order ID.

**Query Parameters:**
- `transactionId`: Payment transaction ID
- `orderId`: Order ID

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "orderId": 123,
    "amount": 500000,
    "method": "dana",
    "status": "success",
    "transactionId": "TXN-1703123456789-ABC123DEF",
    "paidAt": "2024-12-21T10:30:00.000Z",
    "order": {
      "id": 123,
      "totalAmount": 500000,
      "status": "paid",
      "items": [...]
    }
  }
}
```

### Payment Verification

#### `POST /api/payment/verify`
Verify a payment using verification code.

**Request Body:**
```json
{
  "transactionId": "TXN-1703123456789-ABC123DEF",
  "verificationCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pembayaran berhasil diverifikasi!",
  "payment": {
    "id": 1,
    "status": "success",
    "paidAt": "2024-12-21T10:30:00.000Z"
  }
}
```

## Database Schema

### Enhanced Payment Table
```sql
CREATE TABLE Payment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  amount INT NOT NULL,
  method VARCHAR(191) NOT NULL,
  bank VARCHAR(191) NULL,
  status VARCHAR(191) DEFAULT 'pending',
  transactionId VARCHAR(191) UNIQUE NULL,
  gatewayResponse LONGTEXT NULL,
  verificationCode VARCHAR(191) NULL,
  paidAt DATETIME NULL,
  expiresAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES Order(id)
);
```

## Frontend Pages

### 1. Payment Page (`/frontend/payment`)
- Payment method selection with icons
- Bank selection for transfers
- Order summary display
- Payment processing with status updates
- Payment instructions display

### 2. Order History (`/frontend/order-history`)
- Complete order listing
- Payment status tracking
- Payment verification interface
- Order details and items
- Payment information display

### 3. Payment Status (`/frontend/payment-status`)
- Payment status lookup by Transaction ID or Order ID
- Detailed payment information
- Receipt generation
- Payment verification codes

## Payment Gateway Service

### Core Features
- **Singleton Pattern**: Ensures single instance across application
- **Transaction ID Generation**: Unique identifiers for each payment
- **Verification Code Generation**: 6-digit codes for payment verification
- **Success Rate Simulation**: Different success rates per payment method
- **Processing Delays**: Realistic 1-3 second processing delays

### Payment Method Success Rates
- DANA: 95%
- GoPay: 93%
- ShopeePay: 92%
- LinkAja: 91%
- Bank Transfer: 98%
- Debit: 96%
- Credit Card: 94%
- Debit Card: 95%

## Usage Examples

### 1. Making a Payment
```javascript
// Select payment method and process payment
const response = await fetch('/api/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 123,
    amount: 500000,
    method: 'dana',
    userId: 1
  })
});

const result = await response.json();
console.log('Transaction ID:', result.payment.transactionId);
console.log('Verification Code:', result.payment.verificationCode);
```

### 2. Verifying a Payment
```javascript
// Verify payment with code
const response = await fetch('/api/payment/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transactionId: 'TXN-1703123456789-ABC123DEF',
    verificationCode: '123456'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Payment verified successfully!');
}
```

### 3. Checking Payment Status
```javascript
// Check payment status
const response = await fetch('/api/payment?transactionId=TXN-1703123456789-ABC123DEF');
const result = await response.json();
console.log('Payment Status:', result.payment.status);
```

## Security Features

### Transaction Security
- **Unique Transaction IDs**: Prevents duplicate payments
- **Verification Codes**: Secure payment confirmation
- **Payment Expiration**: Automatic expiration after 24 hours
- **Status Validation**: Prevents invalid status changes

### Data Protection
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling and logging
- **Database Constraints**: Foreign key relationships and unique constraints

## Integration Points

### Cart Integration
- Seamless integration with existing cart system
- Automatic order creation from cart items
- Stock management during payment processing

### User Management
- User authentication required for payments
- User-specific order history
- Profile integration for payment details

### Admin Features
- Payment monitoring and management
- Transaction reporting
- Order status management

## Error Handling

### Common Error Scenarios
- **Invalid Payment Method**: Returns 400 with error message
- **Expired Payment**: Returns 400 with expiration message
- **Invalid Verification Code**: Returns 400 with verification error
- **Order Not Found**: Returns 404 with appropriate message
- **Payment Already Exists**: Returns 400 with duplicate payment error

### Error Response Format
```json
{
  "error": "Error message description",
  "status": 400
}
```

## Testing

### Payment Flow Testing
1. **Create Order**: Add items to cart and create order
2. **Select Payment**: Choose payment method and process
3. **Verify Payment**: Use verification code to complete payment
4. **Check Status**: Verify payment status and order updates

### Test Scenarios
- Successful payment processing
- Payment failure simulation
- Payment expiration handling
- Verification code validation
- Duplicate payment prevention

## Future Enhancements

### Planned Features
- **Real Payment Gateway Integration**: Connect to actual payment providers
- **Webhook Support**: Real-time payment notifications
- **Refund Processing**: Automated refund handling
- **Payment Analytics**: Detailed payment reporting
- **Multi-currency Support**: International payment support

### Technical Improvements
- **WebSocket Integration**: Real-time status updates
- **Payment Retry Logic**: Automatic retry for failed payments
- **Advanced Fraud Detection**: Machine learning-based fraud prevention
- **Payment Scheduling**: Scheduled payment processing

## Support

For technical support or questions about the payment gateway system, please refer to the main application documentation or contact the development team.

---

**Note**: This payment gateway is a simulation system designed for development and testing purposes. For production use, integrate with actual payment service providers like Midtrans, Xendit, or similar services. 