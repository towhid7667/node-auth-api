import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  class User extends Model {
    // Model methods here
  }

  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profilePhoto: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
