/* eslint-disable no-prototype-builtins */
import 'dotenv/config';
import db from '../../../models/index';
import authenticator from '../../../helpers/authenticator';
import PasswordHasher from '../../../helpers/PasswordHasher';
import emailSender from '../../../helpers/emailSender';
import Templates from '../../../helpers/Templates';

/**
 *
 * contains static methods for creating a user
 * @class User
 */
class User {
  /**
   * method for handling user signup
   * @param {Request} request object
   * @param {Request} response object
   * @param {next} next
   * @returns {void} void
   * @memberof User
   */
  static async userSignup(request, response, next) {
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
      const user = await db.users
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
        email: user.email,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        image: user.image,
        isSubscribed: user.isSubscribed,
        role: user.role,
        username: user.username,
        notification: user.notification
      });

      const confirmEmailPage = `${process.env.FRONTEND_URL}confirmation?token=${token}`;

      await emailSender(email, 'Please Confirm Your Email', Templates.confirmEmail(confirmEmailPage, email));
      return response.status(201).json({
        status: 201,
        message: 'Verification mail has been sent to user',
        user: {
          userid: user.id,
          email,
          token,
          username,
          bio,
          image,
        },
      });
    } catch (err) {
      if (err.message === 'Email address already in use!') {
        return response.status(409).json({
          status: 409,
          error: err.message,
        });
      }
      return next(err);
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
      const user = await db.users
        .findOne({
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          where: { email },
        });
      if (!user) {
        return res.status(400).json({
          status: 400,
          error: 'email or password incorrect'
        });
      }
      if (!PasswordHasher.comparePassword(password, user.password)) {
        return res.status(400).json({
          status: 400,
          error: 'email or password incorrect'
        });
      }

      const token = await authenticator.generateToken({
        email: user.email,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        image: user.image,
        isSubscribed: user.isSubscribed,
        role: user.role,
        username: user.username,
        notification: user.notification
      });
      return res.status(200).json({
        status: 200,
        user: {
          id: user.id,
          email,
          token,
          username: user.username,
          bio: user.bio,
          isVerified: user.isVerified,
          image: user.image
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
 * @param {String} username username
 * @param {String} firstname firstname
 * @param {String} lastname lastname
 * @param {String} image image
 * @returns {Boolean} query user
 * @memberof User
 */
  static async socialAuth(email, username, firstname, lastname, image) {
    const [user] = await db.users
      .findAll({
        where: {
          email
        }
      });
    if (user) {
      const token = await authenticator.generateToken({
        email,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        image: user.image,
        isSubscribed: user.isSubscribed,
        role: user.role,
        username: user.username,
        notification: user.notification
      });
      const userDetails = {
        email,
        token,
        username: user.username,
        bio: user.bio,
        image: user.image
      };
      return userDetails;
    }
    const password = Math.random().toString();
    const hashedPassword = await PasswordHasher.hashPassword(password);
    const userDetails = await db.users
      .create({
        username,
        email,
        password: hashedPassword,
        firstname,
        lastname,
        image
      });
    const token = await authenticator.generateToken({
      email: userDetails.email,
      id: userDetails.id,
      firstname: userDetails.firstname,
      lastname: userDetails.lastname,
      image: userDetails.image,
      isSubscribed: userDetails.isSubscribed,
      role: userDetails.role,
      username: userDetails.username,
      notification: userDetails.notification
    });
    return { username, email, token };
  }
}

export const { userSignup, userLogin, socialAuth } = User;
