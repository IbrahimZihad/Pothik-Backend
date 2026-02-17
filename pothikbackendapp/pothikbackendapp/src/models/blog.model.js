/**
 * Tittle:  Blog Model
 * ----------
 * Description: Stores travel blog posts written by users.
 *
 * Table: blogs
 * 
 * Build by: Asif Mia
 * 
 * Date: 4 December 2025
 *
 * Relationships:
 *  - Blog.belongsTo(User)
 */

module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "Blog",
    {
      blog_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING(200),
        unique: true,
      },

      content: {
        type: DataTypes.TEXT,
      },

      image: {
        type: DataTypes.STRING(255),
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "blogs",
      timestamps: false, // because created_at is handled manually
    }
  );

  Blog.associate = (models) => {
    Blog.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return Blog;
};
