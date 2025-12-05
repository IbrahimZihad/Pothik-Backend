module.exports = (sequelize, DataTypes) => {
    const Booking = sequelize.define("Booking", {
        booking_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        package_type: {
            type: DataTypes.ENUM('prebuilt', 'custom'),
            allowNull: true,
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        discounted_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        loyalty_points_used: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        loyalty_points_earned: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
            defaultValue: 'pending',
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: "bookings",
        timestamps: false,
    });

    return Booking;
};
