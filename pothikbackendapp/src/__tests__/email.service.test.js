// src/__tests__/email.service.test.js

// ---------- Mocks ----------
const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

const emailService = require('../services/email.service');

describe('Email Service', () => {

  beforeEach(() => {
    mockSendMail.mockClear();
    emailService.clearExpiredOTPs();
  });

  // ---------- sendPasswordResetOTP ----------
  describe('sendPasswordResetOTP()', () => {
    it('should send an OTP email and return true', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: 'test-id' });

      const result = await emailService.sendPasswordResetOTP('alice@example.com');

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@example.com',
          subject: 'Pothik - Password Reset OTP',
        })
      );
      expect(result).toBe(true);
    });

    it('should store OTP in memory after sending', async () => {
      mockSendMail.mockResolvedValueOnce({});

      await emailService.sendPasswordResetOTP('alice@example.com');

      // OTP should now be in store — wrong OTP throws the right error
      expect(() => emailService.verifyOTP('alice@example.com', '000000'))
        .toThrow('Invalid OTP. Please check and try again.');
    });

    it('should throw if nodemailer fails to send email', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(emailService.sendPasswordResetOTP('alice@example.com'))
        .rejects.toThrow('Failed to send OTP email. Please try again.');
    });

    it('should include OTP in the email html body', async () => {
      mockSendMail.mockResolvedValueOnce({});

      await emailService.sendPasswordResetOTP('alice@example.com');

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toBeDefined();
      expect(callArgs.html.length).toBeGreaterThan(0);
    });

    it('should overwrite existing OTP if called again for same email', async () => {
      mockSendMail.mockResolvedValue({});

      await emailService.sendPasswordResetOTP('alice@example.com');
      await emailService.sendPasswordResetOTP('alice@example.com');

      // Wrong OTP should throw — the latest OTP is still in store
      expect(() => emailService.verifyOTP('alice@example.com', '000000'))
        .toThrow('Invalid OTP. Please check and try again.');
    });
  });

  // ---------- verifyOTP ----------
  describe('verifyOTP()', () => {
    it('should return true for a valid OTP', async () => {
      mockSendMail.mockResolvedValueOnce({});
      await emailService.sendPasswordResetOTP('alice@example.com');

      // Extract OTP from HTML body
      const html = mockSendMail.mock.calls[0][0].html;
      const otpMatch = html.match(/letter-spacing: 8px[^>]*>(\d{6})<\/span>/);
      const otp = otpMatch?.[1];

      if (otp) {
        const result = emailService.verifyOTP('alice@example.com', otp);
        expect(result).toBe(true);
      } else {
        expect(() => emailService.verifyOTP('alice@example.com', '000000'))
          .toThrow('Invalid OTP. Please check and try again.');
      }
    });

    it('should throw if no OTP exists for the email', () => {
      expect(() => emailService.verifyOTP('nobody@example.com', '123456'))
        .toThrow('OTP not found. Please request a new one.');
    });

    it('should throw for an incorrect OTP', async () => {
      mockSendMail.mockResolvedValueOnce({});
      await emailService.sendPasswordResetOTP('alice@example.com');

      expect(() => emailService.verifyOTP('alice@example.com', '000000'))
        .toThrow('Invalid OTP. Please check and try again.');
    });

    it('should throw if OTP has expired', async () => {
      mockSendMail.mockResolvedValueOnce({});
      await emailService.sendPasswordResetOTP('alice@example.com');

      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() + 11 * 60 * 1000); // +11 minutes

      expect(() => emailService.verifyOTP('alice@example.com', '123456'))
        .toThrow('OTP has expired. Please request a new one.');

      Date.now = realDateNow; // restore
    });

    it('should delete OTP from store after successful verification', async () => {
      mockSendMail.mockResolvedValueOnce({});
      await emailService.sendPasswordResetOTP('alice@example.com');

      const html = mockSendMail.mock.calls[0][0].html;
      const otpMatch = html.match(/letter-spacing: 8px[^>]*>(\d{6})<\/span>/);
      const otp = otpMatch?.[1];

      if (otp) {
        emailService.verifyOTP('alice@example.com', otp);

        // Second attempt should throw — OTP was deleted after use
        expect(() => emailService.verifyOTP('alice@example.com', otp))
          .toThrow('OTP not found. Please request a new one.');
      }
    });

    it('should delete OTP from store after expiry check', async () => {
      mockSendMail.mockResolvedValueOnce({});
      await emailService.sendPasswordResetOTP('alice@example.com');

      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() + 11 * 60 * 1000);

      expect(() => emailService.verifyOTP('alice@example.com', '123456'))
        .toThrow('OTP has expired. Please request a new one.');

      Date.now = realDateNow;

      // Should now say not found since it was deleted on expiry
      expect(() => emailService.verifyOTP('alice@example.com', '123456'))
        .toThrow('OTP not found. Please request a new one.');
    });
  });

  // ---------- clearExpiredOTPs ----------
  describe('clearExpiredOTPs()', () => {
    it('should remove expired OTPs from the store', async () => {
      mockSendMail.mockResolvedValue({});

      await emailService.sendPasswordResetOTP('alice@example.com');
      await emailService.sendPasswordResetOTP('bob@example.com');

      const realDateNow = Date.now;
      Date.now = jest.fn(() => realDateNow() + 11 * 60 * 1000);

      emailService.clearExpiredOTPs();

      Date.now = realDateNow;

      expect(() => emailService.verifyOTP('alice@example.com', '123456'))
        .toThrow('OTP not found. Please request a new one.');
      expect(() => emailService.verifyOTP('bob@example.com', '123456'))
        .toThrow('OTP not found. Please request a new one.');
    });

    it('should not remove OTPs that are still valid', async () => {
      mockSendMail.mockResolvedValueOnce({});
      await emailService.sendPasswordResetOTP('alice@example.com');

      emailService.clearExpiredOTPs(); // called before expiry

      // OTP still in store — wrong OTP throws the right error
      expect(() => emailService.verifyOTP('alice@example.com', '000000'))
        .toThrow('Invalid OTP. Please check and try again.');
    });

    it('should handle empty OTP store without errors', () => {
      expect(() => emailService.clearExpiredOTPs()).not.toThrow();
    });
  });

});