module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define("Review", {
        review_id: {
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
        service_type: {
            type: DataTypes.ENUM('hotel', 'transport', 'guide', 'package'),
            allowNull: false,
        },
        service_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: "reviews",
        timestamps: false,
    });

    return Review;
};