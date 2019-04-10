import db from '../../../models/index';
/**
 * @class Users
 */
class Users {
  /**
   * @static
   * @param {obj} req
   * @param {obj} res
   * @param {function} next
   * @returns {obj} res
   * @memberof Users
   */
  static async getAllUsers(req, res, next) {
    try {
      const users = await db.users
        .findAll({
          attributes: { exclude: ['password'] }
        });
      return res.status(200)
        .json({
          status: 200,
          users
        });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * method for handling get user profile
   * @param {Request} request
   * @param {Request} response
   * @returns {void} void
   * @memberof User
   */
  static async getAProfile(request, response) {
    try {
      const { userid } = request.params;
      const user = await db.users.findOne({
        attributes: { exclude: ['password'] },
        where: { userid },
      });
      if (user) {
        response.status(200).json({
          status: 200,
          profile: user,
        });
      }
      if (!user) {
        response.status(404).json({
          status: 404,
          errors: 'Profile not found',
        });
      }
    } catch (err) {
      return response.status(500).json({
        status: 500,
        errors: { body: [err.message] },
      });
    }
  }
}
export default Users;
