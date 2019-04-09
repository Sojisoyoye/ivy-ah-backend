/* eslint-disable no-prototype-builtins */
import db from '../../../models/index';
import authenticator from '../../../helpers/authenticator';
import PasswordHasher from '../../../helpers/PasswordHasher';

/**
 *
 * contains static methods for creating a user
 * @class User
 */
class Auth {
  /**
   * method for handling user signup
   * @param {Request} request object
   * @param {Request} response object
   * @returns {void} void
   * @memberof User
   */
  static async userSignup(request, response) {
    try {
      const {
        username,
        firstname,
        lastname,
        email,
        bio,
        image,
        password
      } = request.body;
      const hashedPassword = await PasswordHasher.hashPassword(password);
      const result = await db.user
        .create({
          username,
          firstname,
          lastname,
          email,
          bio,
          image,
          password: hashedPassword,
        });
      const token = await authenticator.generateToken({
        email: result.email
      });
      return response.status(201).json({
        status: 201,
        user: {
          email,
          token,
          username,
          bio,
          image,
        },
      });
    } catch (err) {
      return response.status(409).json({
        status: 409,
        errors: {
          body: [err.message]
        },
      });
    }
  }

  /**
   * method to handle user login
   * @param {Request} req object
   * @param {Response} res object
   * @returns {void} void
   * @memberof User
   */
  static async userLogin(req, res) {
    const {
      email,
      password
    } = req.body;
    try {
      const result = await db.user
        .findOne({
          attributes: ['password', 'email', 'username', 'bio', 'image'],
          where: { email },
        });
      if (!result) {
        return res.status(400).json({
          status: 400,
          error: 'email or password incorrect'
        });
      }
      if (!PasswordHasher.comparePassword(password, result.password)) {
        return res.status(400).json({
          status: 400,
          error: 'email or password incorrect'
        });
      }

      const token = await authenticator.generateToken({ email: result.email });
      return res.status(200).json({
        status: 200,
        user: {
          email,
          token,
          username: result.username,
          bio: result.bio,
          image: result.image
        },
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        error: 'unexpected server error'
      });
    }
  }

  /**
 * method for checking if user is already registered
 * @param {String} email user email
 * @param {String} username user email
 * @returns {Boolean} query result
 * @memberof User
 */
  static async socialAuth(email, username) {
    const [result] = await db.user
      .findAll({
        where: {
          email
        }
      });
    if (result) {
      const token = await authenticator.generateToken({ email });
      const userDetails = {
        email,
        token,
        username: result.username,
        bio: result.bio,
        image: result.image
      };
      return userDetails;
    }
    const password = Math.random().toString();
    const hashedPassword = await PasswordHasher.hashPassword(password);
    await db.user
      .create({
        username,
        email,
        password: hashedPassword,
      });
    const token = await authenticator.generateToken({ email });
    return { username, email, token };
  }
}

export const { userSignup, userLogin, socialAuth } = Auth;
