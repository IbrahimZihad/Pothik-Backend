const SSLCommerzPayment = require('sslcommerz-lts');
const config = require('../config');
const { Payment, Booking } = require('../models');

const VALID_SSL_STATUSES = new Set(['VALID', 'VALIDATED']);
const FAILED_SSL_STATUSES = new Set(['FAILED', 'FAILED_TRANSACTION']);
const CANCELLED_SSL_STATUSES = new Set(['CANCELLED', 'CANCELED']);

const validationBaseUrl = config.SSLCOMMERZ_IS_LIVE
  ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

const isGatewayConfigured = () => Boolean(config.SSLCOMMERZ_STORE_ID && config.SSLCOMMERZ_STORE_PASSWORD);

const generateTranId = (bookingId) => `BK${bookingId}-${Date.now()}`;

const toFixedAmount = (amount) => Number.parseFloat(amount).toFixed(2);

const jsonOrNull = (data) => {
  try {
    return JSON.stringify(data || {});
  } catch (err) {
    return null;
  }
};

const getPayload = (req) => ({
  ...(req.query || {}),
  ...(req.body || {}),
});

const buildStatusRedirectUrl = (req, { status, tranId, message }) => {
  const baseUrl = config.POTHIK_FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
  const url = new URL(config.POTHIK_FRONTEND_URL ? '/payment/status' : '/api/payment/status', baseUrl);
  url.searchParams.set('status', status);
  if (tranId) {
    url.searchParams.set('tran_id', String(tranId));
  }
  if (message) {
    url.searchParams.set('message', message);
  }
  return url.toString();
};

const prefersJson = (req) => {
  const accept = String(req.get('accept') || '').toLowerCase();
  return accept.includes('application/json');
};

const sendCallbackResponse = (req, res, { httpStatus = 200, status, tranId, message, data }) => {
  if (prefersJson(req)) {
    return res.status(httpStatus).json({
      success: httpStatus < 400,
      message,
      data,
    });
  }

  const redirectUrl = buildStatusRedirectUrl(req, { status, tranId, message });
  return res.redirect(302, redirectUrl);
};

const validateSslTransaction = async (valId) => {
  const url = new URL(validationBaseUrl);
  url.searchParams.set('val_id', valId);
  url.searchParams.set('store_id', config.SSLCOMMERZ_STORE_ID);
  url.searchParams.set('store_passwd', config.SSLCOMMERZ_STORE_PASSWORD);
  url.searchParams.set('v', '1');
  url.searchParams.set('format', 'json');

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Validation API failed with HTTP ${response.status}`);
  }

  return response.json();
};

const updateBookingIfExists = async (bookingId, status) => {
  if (!bookingId) return;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) return;

  await booking.update({ status });
};

const markAsPaid = async ({ payment, payload, validation }) => {
  const amountFromValidation = validation?.amount ? Number.parseFloat(validation.amount) : null;
  const paymentAmount = Number.parseFloat(payment.amount);

  if (amountFromValidation !== null && amountFromValidation !== paymentAmount) {
    throw new Error('Amount mismatch during validation');
  }

  const currency = validation?.currency_type || payload.currency || payment.currency || 'BDT';

  await payment.update({
    status: 'paid',
    method: payload.card_type || payment.method || 'sslcommerz',
    currency,
    val_id: validation?.val_id || payload.val_id || payment.val_id,
    bank_tran_id: validation?.bank_tran_id || payload.bank_tran_id || payment.bank_tran_id,
    gateway_response: jsonOrNull({ payload, validation }),
  });

  await updateBookingIfExists(payment.booking_id, 'confirmed');

  return payment;
};

exports.initiateSslCommerzPayment = async (req, res) => {
  try {
    if (!isGatewayConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'SSLCommerz is not configured',
      });
    }

    const {
      booking_id,
      amount,
      currency = 'BDT',
      customer_name,
      customer_email,
      customer_phone,
      customer_address = 'Dhaka',
      customer_city = 'Dhaka',
      customer_postcode = '1207',
      customer_country = 'Bangladesh',
    } = req.body;

    if (!booking_id || !amount || !customer_name || !customer_email || !customer_phone) {
      return res.status(400).json({
        success: false,
        error: 'booking_id, amount, customer_name, customer_email, customer_phone are required',
      });
    }

    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    const tran_id = generateTranId(booking_id);

    const payment = await Payment.create({
      booking_id,
      amount,
      currency,
      method: 'sslcommerz',
      status: 'pending',
      tran_id,
    });

    const sslcz = new SSLCommerzPayment(
      config.SSLCOMMERZ_STORE_ID,
      config.SSLCOMMERZ_STORE_PASSWORD,
      config.SSLCOMMERZ_IS_LIVE
    );

    const paymentRequest = {
      total_amount: toFixedAmount(amount),
      currency,
      tran_id,
      success_url: config.SSLCOMMERZ_SUCCESS_URL,
      fail_url: config.SSLCOMMERZ_FAIL_URL,
      cancel_url: config.SSLCOMMERZ_CANCEL_URL,
      ipn_url: config.SSLCOMMERZ_IPN_URL,
      shipping_method: 'NO',
      product_name: `Booking-${booking_id}`,
      product_category: 'Tour Package',
      product_profile: 'general',
      cus_name: customer_name,
      cus_email: customer_email,
      cus_add1: customer_address,
      cus_city: customer_city,
      cus_postcode: customer_postcode,
      cus_country: customer_country,
      cus_phone: customer_phone,
      ship_name: customer_name,
      ship_add1: customer_address,
      ship_city: customer_city,
      ship_postcode: customer_postcode,
      ship_country: customer_country,
      value_a: String(booking_id),
      value_b: String(payment.payment_id),
    };

    const apiResponse = await sslcz.init(paymentRequest);

    if (!apiResponse?.GatewayPageURL) {
      await payment.update({
        status: 'failed',
        gateway_response: jsonOrNull(apiResponse),
      });

      return res.status(502).json({
        success: false,
        error: 'Failed to initialize SSLCommerz session',
        data: apiResponse,
      });
    }

    await payment.update({
      session_key: apiResponse.sessionkey || null,
      gateway_response: jsonOrNull(apiResponse),
    });

    return res.status(201).json({
      success: true,
      message: 'SSLCommerz session created successfully',
      data: {
        payment_id: payment.payment_id,
        tran_id,
        gateway_url: apiResponse.GatewayPageURL,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Payment initialization failed',
      details: err.message,
    });
  }
};

exports.sslCommerzSuccess = async (req, res) => {
  try {
    const payload = getPayload(req);
    const { tran_id, val_id } = payload;

    if (!tran_id || !val_id) {
      return sendCallbackResponse(req, res, {
        httpStatus: 400,
        status: 'failed',
        tranId: tran_id,
        message: 'tran_id and val_id are required in success callback',
      });
    }

    const payment = await Payment.findOne({ where: { tran_id } });
    if (!payment) {
      return sendCallbackResponse(req, res, {
        httpStatus: 404,
        status: 'failed',
        tranId: tran_id,
        message: 'Payment not found',
      });
    }

    if (payment.status === 'paid') {
      return sendCallbackResponse(req, res, {
        status: 'paid',
        tranId: tran_id,
        message: 'Payment already confirmed',
        data: payment,
      });
    }

    const validation = await validateSslTransaction(val_id);
    if (!VALID_SSL_STATUSES.has(validation?.status)) {
      await payment.update({
        status: 'failed',
        gateway_response: jsonOrNull({ payload, validation }),
      });

      return sendCallbackResponse(req, res, {
        httpStatus: 400,
        status: 'failed',
        tranId: tran_id,
        message: 'Transaction validation failed',
        data: validation,
      });
    }

    await markAsPaid({ payment, payload, validation });

    return sendCallbackResponse(req, res, {
      status: 'paid',
      tranId: tran_id,
      message: 'Payment validated and confirmed',
      data: payment,
    });
  } catch (err) {
    const payload = getPayload(req);
    return sendCallbackResponse(req, res, {
      httpStatus: 500,
      status: 'failed',
      tranId: payload.tran_id,
      message: `Success callback processing failed: ${err.message}`,
    });
  }
};

exports.sslCommerzFail = async (req, res) => {
  try {
    const payload = getPayload(req);
    const { tran_id } = payload;

    if (!tran_id) {
      return sendCallbackResponse(req, res, {
        httpStatus: 400,
        status: 'failed',
        message: 'tran_id is required in fail callback',
      });
    }

    const payment = await Payment.findOne({ where: { tran_id } });
    if (!payment) {
      return sendCallbackResponse(req, res, {
        httpStatus: 404,
        status: 'failed',
        tranId: tran_id,
        message: 'Payment not found',
      });
    }

    await payment.update({
      status: 'failed',
      gateway_response: jsonOrNull(payload),
    });
    await updateBookingIfExists(payment.booking_id, 'pending');

    return sendCallbackResponse(req, res, {
      status: 'failed',
      tranId: tran_id,
      message: 'Payment marked as failed',
      data: payment,
    });
  } catch (err) {
    const payload = getPayload(req);
    return sendCallbackResponse(req, res, {
      httpStatus: 500,
      status: 'failed',
      tranId: payload.tran_id,
      message: `Fail callback processing failed: ${err.message}`,
    });
  }
};

exports.sslCommerzCancel = async (req, res) => {
  try {
    const payload = getPayload(req);
    const { tran_id } = payload;

    if (!tran_id) {
      return sendCallbackResponse(req, res, {
        httpStatus: 400,
        status: 'cancelled',
        message: 'tran_id is required in cancel callback',
      });
    }

    const payment = await Payment.findOne({ where: { tran_id } });
    if (!payment) {
      return sendCallbackResponse(req, res, {
        httpStatus: 404,
        status: 'cancelled',
        tranId: tran_id,
        message: 'Payment not found',
      });
    }

    await payment.update({
      status: 'cancelled',
      gateway_response: jsonOrNull(payload),
    });
    await updateBookingIfExists(payment.booking_id, 'pending');

    return sendCallbackResponse(req, res, {
      status: 'cancelled',
      tranId: tran_id,
      message: 'Payment marked as cancelled',
      data: payment,
    });
  } catch (err) {
    const payload = getPayload(req);
    return sendCallbackResponse(req, res, {
      httpStatus: 500,
      status: 'cancelled',
      tranId: payload.tran_id,
      message: `Cancel callback processing failed: ${err.message}`,
    });
  }
};

exports.sslCommerzIpn = async (req, res) => {
  try {
    const payload = getPayload(req);
    const { tran_id, val_id, status } = payload;

    if (!tran_id) {
      return res.status(400).json({
        success: false,
        error: 'tran_id is required in IPN payload',
      });
    }

    const payment = await Payment.findOne({ where: { tran_id } });
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    if (payment.status === 'paid') {
      return res.json({ success: true, message: 'Already processed' });
    }

    if (VALID_SSL_STATUSES.has(String(status).toUpperCase()) && val_id) {
      const validation = await validateSslTransaction(val_id);
      await markAsPaid({ payment, payload, validation });
      return res.json({ success: true, message: 'IPN payment verified' });
    }

    if (FAILED_SSL_STATUSES.has(String(status).toUpperCase())) {
      await payment.update({
        status: 'failed',
        gateway_response: jsonOrNull(payload),
      });
      await updateBookingIfExists(payment.booking_id, 'pending');
      return res.json({ success: true, message: 'IPN marked as failed' });
    }

    if (CANCELLED_SSL_STATUSES.has(String(status).toUpperCase())) {
      await payment.update({
        status: 'cancelled',
        gateway_response: jsonOrNull(payload),
      });
      await updateBookingIfExists(payment.booking_id, 'pending');
      return res.json({ success: true, message: 'IPN marked as cancelled' });
    }

    await payment.update({
      gateway_response: jsonOrNull(payload),
    });

    return res.json({
      success: true,
      message: 'IPN received',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'IPN processing failed',
      details: err.message,
    });
  }
};

exports.validatePaymentByTranId = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const payment = await Payment.findOne({ where: { tran_id } });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    const valId = req.query.val_id || payment.val_id;
    if (!valId) {
      return res.status(400).json({
        success: false,
        error: 'val_id not found for this transaction',
      });
    }

    const validation = await validateSslTransaction(valId);

    return res.json({
      success: true,
      data: {
        payment,
        validation,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Transaction validation failed',
      details: err.message,
    });
  }
};

// Create new payment
exports.createPayment = async (req, res) => {
  try {
    const { booking_id, amount, method, status } = req.body;

    const payment = await Payment.create({
      booking_id,
      amount,
      method,
      status: status || 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Payment creation failed',
      details: err.message
    });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get payments by booking ID
exports.getPaymentsByBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const payments = await Payment.findAll({
      where: { booking_id }
    });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    await payment.update({ status });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    await payment.destroy();

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
