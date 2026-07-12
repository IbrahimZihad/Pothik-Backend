const { Booking, Coupon, User, LoyaltyHistory } = require("../models");
const { Op, Sequelize } = require("sequelize");

class BookingService {

  // -----------------------------
  // APPLY COUPON
  // -----------------------------
  static async applyCoupon(code, total_price) {
    if (!code) return { discount: 0, coupon: null };

    const coupon = await Coupon.findOne({
      where: {
        code,
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        valid_to: { [Op.gte]: new Date() },
        used_count: { [Op.lt]: Sequelize.col("usage_limit") },
      },
    });

    if (!coupon) {
      throw new Error("Invalid or expired coupon");
    }

    let discount = 0;

    if (coupon.discount_type === "fixed") {
      discount = coupon.discount_value;
    } else if (coupon.discount_type === "percent") {
      discount = (total_price * coupon.discount_value) / 100;
    }

    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }

    return { discount, coupon };
  }

  // -----------------------------
  // VALIDATE LOYALTY POINTS
  // -----------------------------
  static async useLoyaltyPoints(user, pointsRequested) {
    if (!pointsRequested || pointsRequested <= 0) {
      return { deducted: 0 };
    }

    if (user.loyalty_points < pointsRequested) {
      throw new Error("Not enough loyalty points");
    }

    user.loyalty_points -= pointsRequested;
    await user.save();

    await LoyaltyHistory.create({
      user_id: user.user_id,
      points_deducted: pointsRequested,
      description: "Used for booking discount",
    });

    return { deducted: pointsRequested };
  }

  // -----------------------------
  // EARN LOYALTY POINTS
  // -----------------------------
  static async earnLoyaltyPoints(user, amountPaid) {
    const pointsEarned = Math.floor(amountPaid / 100); // 1 point per 100 taka

    user.loyalty_points += pointsEarned;
    await user.save();

    await LoyaltyHistory.create({
      user_id: user.user_id,
      points_added: pointsEarned,
      description: "Earned from booking",
    });

    return pointsEarned;
  }

  // -----------------------------
  // CREATE BOOKING (MAIN LOGIC)
  // -----------------------------
  static async createBooking(data) {
    const {
      user_id,
      package_type,
      package_id,
      session_id,
      total_price,
      coupon_id,
      coupon_discount,
      loyalty_points_used,
      // Accept all extra fields from frontend
      travel_date,
      num_travelers,
      adults,
      children,
      paid_amount,
      payment_type,
      special_requests,
      emergency_contact,
      traveler_details,
    } = data;

    const user = await User.findByPk(user_id);
    if (!user) throw new Error("User not found");

    // Frontend already calculated pricing (coupon + loyalty).
    // We just store the booking record. Loyalty deduction is handled
    // by the frontend calling /loyalty/deduct separately.
    // Loyalty EARNING happens in markAsPaid after payment succeeds.

    const discounted_price = total_price;

    // Create booking (no points earned yet — awarded after payment)
    const booking = await Booking.create({
      user_id,
      package_type: package_type || "prebuilt",
      package_id,
      session_id,
      total_price,
      coupon_id: coupon_id || null,
      coupon_discount: coupon_discount || 0,
      loyalty_points_used: loyalty_points_used || 0,
      loyalty_points_earned: 0, // will be set after payment success
      discounted_price,
      status: "pending",
      travel_date,
      num_travelers,
      adults,
      children,
      paid_amount,
      payment_type,
      special_requests,
      emergency_contact,
      traveler_details,
    });

    return booking;
  }
}

module.exports = BookingService;
