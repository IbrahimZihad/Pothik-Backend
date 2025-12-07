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

    // -----------------------------
    // 🔗 Define Associations Here
    // -----------------------------
    Review.associate = (models) => {
        // REVIEW → USER
        Review.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });

        // REVIEW → HOTEL (POLYMORPHIC)
        Review.belongsTo(models.Hotel, {
            foreignKey: "service_id",
            constraints: false,
            as: "hotel",
        });

        // REVIEW → TRANSPORT (POLYMORPHIC)
        Review.belongsTo(models.Transport, {
            foreignKey: "service_id",
            constraints: false,
            as: "transport",
        });

        // REVIEW → GUIDE (POLYMORPHIC)
        Review.belongsTo(models.Guide, {
            foreignKey: "service_id",
            constraints: false,
            as: "guide",
        });

        // REVIEW → PACKAGE (POLYMORPHIC)
        Review.belongsTo(models.Package, {
            foreignKey: "service_id",
            constraints: false,
            as: "package",
        });
    };

    return Review;
};