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

    // -----------------------------
    // 🔗 Define Associations Here
    // -----------------------------
    Review.associate = (models) => {
        // REVIEW → USER
        Review.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    };

    return Review;
};