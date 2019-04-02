import express from 'express';
import validate from '../../../middlewares/validator';
import auth from './auth';


const usersRoute = express.Router();

usersRoute.post('/users', validate.userSignup, auth);

export default usersRoute;