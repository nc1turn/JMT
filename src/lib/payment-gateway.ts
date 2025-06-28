import { v4 as uuidv4 } from 'uuid';

export interface PaymentRequest {
  orderId: number;
  amount: number;
  method: string;
  bank?: string;
  userId: number;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
  message: string;
  gatewayResponse?: any;
  expiresAt?: Date;
  verificationCode?: string;
}

export interface PaymentVerification {
  transactionId: string;
  verificationCode: string;
}

export class PaymentGateway {
  private static instance: PaymentGateway;
  
  private constructor() {}
  
  public static getInstance(): PaymentGateway {
    if (!PaymentGateway.instance) {
      PaymentGateway.instance = new PaymentGateway();
    }
    return PaymentGateway.instance;
  }

  // Generate unique transaction ID
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Generate verification code for manual verification
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Simulate payment processing delay
  private async simulateProcessing(): Promise<void> {
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Process payment based on method
  public async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = this.generateTransactionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    try {
      // Simulate processing delay
      await this.simulateProcessing();
      
      // Simulate different success rates based on payment method
      const successRate = this.getSuccessRate(request.method);
      const isSuccess = Math.random() < successRate;
      
      if (isSuccess) {
        const verificationCode = this.generateVerificationCode();
        
        return {
          success: true,
          transactionId,
          status: 'processing',
          message: this.getProcessingMessage(request.method, request.bank),
          gatewayResponse: {
            transactionId,
            amount: request.amount,
            method: request.method,
            bank: request.bank,
            timestamp: new Date().toISOString(),
            status: 'processing'
          },
          expiresAt,
          verificationCode
        };
      } else {
        return {
          success: false,
          transactionId,
          status: 'failed',
          message: this.getFailureMessage(request.method),
          gatewayResponse: {
            transactionId,
            amount: request.amount,
            method: request.method,
            bank: request.bank,
            timestamp: new Date().toISOString(),
            status: 'failed',
            error: 'Payment gateway temporarily unavailable'
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        message: 'Terjadi kesalahan pada sistem pembayaran',
        gatewayResponse: {
          transactionId,
          amount: request.amount,
          method: request.method,
          bank: request.bank,
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Verify payment with code
  public async verifyPayment(verification: PaymentVerification): Promise<PaymentResponse> {
    try {
      await this.simulateProcessing();
      
      // Simulate verification success (90% success rate)
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        return {
          success: true,
          transactionId: verification.transactionId,
          status: 'success',
          message: 'Pembayaran berhasil diverifikasi!',
          gatewayResponse: {
            transactionId: verification.transactionId,
            verificationCode: verification.verificationCode,
            timestamp: new Date().toISOString(),
            status: 'success'
          }
        };
      } else {
        return {
          success: false,
          transactionId: verification.transactionId,
          status: 'failed',
          message: 'Kode verifikasi salah atau sudah kadaluarsa',
          gatewayResponse: {
            transactionId: verification.transactionId,
            verificationCode: verification.verificationCode,
            timestamp: new Date().toISOString(),
            status: 'failed',
            error: 'Invalid verification code'
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        transactionId: verification.transactionId,
        status: 'failed',
        message: 'Gagal memverifikasi pembayaran',
        gatewayResponse: {
          transactionId: verification.transactionId,
          verificationCode: verification.verificationCode,
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Get success rate based on payment method
  private getSuccessRate(method: string): number {
    const rates: { [key: string]: number } = {
      'dana': 0.95,
      'gopay': 0.93,
      'shopeepay': 0.92,
      'linkaja': 0.91,
      'transfer_bank': 0.98,
      'debit': 0.96,
      'credit_card': 0.94,
      'debit_card': 0.95
    };
    return rates[method] || 0.90;
  }

  // Get processing message based on payment method
  private getProcessingMessage(method: string, bank?: string): string {
    const messages: { [key: string]: string } = {
      'dana': 'Pembayaran DANA sedang diproses. Silakan transfer ke nomor +62 895-6013-77400 (JMT Archery) di aplikasi DANA.',
      'gopay': 'Pembayaran GoPay sedang diproses. Silakan transfer ke nomor +62 895-6013-77400 (JMT Archery) di aplikasi GoPay.',
      'shopeepay': 'Pembayaran ShopeePay sedang diproses. Silakan transfer ke nomor +62 895-6013-77400 (JMT Archery) di aplikasi ShopeePay.',
      'linkaja': 'Pembayaran LinkAja sedang diproses. Silakan transfer ke nomor +62 895-6013-77400 (JMT Archery) di aplikasi LinkAja.',
      'transfer_bank': `Pembayaran transfer bank ${bank?.toUpperCase()} sedang diproses. Silakan transfer sesuai instruksi.`,
      'debit': 'Pembayaran debit sedang diproses. Silakan masukkan PIN kartu debit Anda.',
      'credit_card': 'Pembayaran kartu kredit sedang diproses. Silakan masukkan detail kartu kredit.',
      'debit_card': 'Pembayaran kartu debit sedang diproses. Silakan masukkan detail kartu debit.'
    };
    return messages[method] || 'Pembayaran sedang diproses.';
  }

  // Get failure message based on payment method
  private getFailureMessage(method: string): string {
    const messages: { [key: string]: string } = {
      'dana': 'Pembayaran DANA gagal. Silakan coba lagi atau pilih metode pembayaran lain.',
      'gopay': 'Pembayaran GoPay gagal. Silakan coba lagi atau pilih metode pembayaran lain.',
      'shopeepay': 'Pembayaran ShopeePay gagal. Silakan coba lagi atau pilih metode pembayaran lain.',
      'linkaja': 'Pembayaran LinkAja gagal. Silakan coba lagi atau pilih metode pembayaran lain.',
      'transfer_bank': 'Pembayaran transfer bank gagal. Silakan coba lagi atau pilih metode pembayaran lain.',
      'debit': 'Pembayaran debit gagal. Silakan coba lagi atau pilih metode pembayaran lain.',
      'credit_card': 'Pembayaran kartu kredit gagal. Silakan coba lagi atau pilih metode pembayaran lain.',
      'debit_card': 'Pembayaran kartu debit gagal. Silakan coba lagi atau pilih metode pembayaran lain.'
    };
    return messages[method] || 'Pembayaran gagal. Silakan coba lagi.';
  }

  // Check payment status
  public async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      await this.simulateProcessing();
      
      // Simulate status check (80% chance of success)
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
        return {
          success: true,
          transactionId,
          status: 'success',
          message: 'Pembayaran berhasil dikonfirmasi',
          gatewayResponse: {
            transactionId,
            timestamp: new Date().toISOString(),
            status: 'success'
          }
        };
      } else {
        return {
          success: false,
          transactionId,
          status: 'pending',
          message: 'Pembayaran masih dalam proses',
          gatewayResponse: {
            transactionId,
            timestamp: new Date().toISOString(),
            status: 'pending'
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        message: 'Gagal memeriksa status pembayaran',
        gatewayResponse: {
          transactionId,
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

export const paymentGateway = PaymentGateway.getInstance(); 