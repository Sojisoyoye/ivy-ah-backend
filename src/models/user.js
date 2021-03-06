module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      field: 'user_name',
    },
    firstname: {
      type: DataTypes.STRING(255),
      field: 'first_name',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isSubscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ['user', 'moderator', 'admin'],
      defaultValue: 'user',
    },
    lastname: {
      type: DataTypes.STRING(255),
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      },
      unique: {
        args: true,
        msg: 'Email address already in use!'
      }
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true

    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    }
  }, {});

  users.associate = (models) => {
    users.hasMany(models.comment, { foreignKey: 'author' });
    users.hasMany(models.archivedComments, { foreignKey: 'author' });
    users.hasMany(models.reportedComments, { foreignKey: 'userid' });
  };
  return users;
};
