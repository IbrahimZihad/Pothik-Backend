// src/models/user.model.js

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable for OAuth users (Google login)
      },
      phone: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM("customer", "owner", "admin"),
        defaultValue: "customer",
      },
      auth_provider: {
        type: DataTypes.ENUM("local", "google"),
        defaultValue: "local",
      },
      firebase_uid: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      loyalty_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  // -----------------------------
  // 🔗 Define Associations Here
  // -----------------------------
  User.associate = (models) => {
    // USER → HOTELS (OWNER)
    User.hasMany(models.Hotel, {
      foreignKey: "owner_id",
      as: "hotels",
    });

    // USER → TRANSPORTS (OWNER)
    User.hasMany(models.Transport, {
      foreignKey: "owner_id",
      as: "transports",
    });

    // USER → GUIDES (OWNER)
    User.hasMany(models.Guide, {
      foreignKey: "owner_id",
      as: "guides",
    });

    // USER → BOOKINGS (CUSTOMER)
    User.hasMany(models.Booking, {
      foreignKey: "user_id",
      as: "bookings",
    });

    // USER → REVIEWS (REVIEWER)
    User.hasMany(models.Review, {
      foreignKey: "user_id",
      as: "reviews",
    });
  };

  return User;
};
