import User from '../models/User.js';
import { signToken } from '../services/auth.js';

interface UserArgs {
  _id: string;
  username: string;
}

interface AddUserArgs {
  username: string;
  email: string;
  password: string;
}

interface Context {
  user?: UserArgs;
}
const resolvers = {
  Query: {

    me: async (_parent: any, _args: any, context: Context): Promise<UserArgs | null> => {
      // Check if user is authenticated
      if (context.user) {
        const userData = await User.findById(context.user._id).populate('savedBooks');
        return userData;
      }
      throw new Error('Not logged in');
    },

    users: async () => {
      return await User.find();
    },

    getSingleUser: async (_: unknown, { _id, username }: UserArgs) => {
      const foundUser = await User.findOne({
        $or: [{ _id: _id }, { username }],
      });

      if (!foundUser) {
        throw new Error('Cannot find a user with this id!');
      }

      return foundUser;
    },
  },
  Mutation: {
    addUser: async (_: unknown, { username, email, password }: AddUserArgs) => {
      const user = await User.create({ username, email, password });
      if (!user) {
        throw new Error('Something is wrong!');
      }
      // Generate token using username, email, and user ID
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    login: async (_: unknown, { username, email, password }: AddUserArgs) => {
      const user = await User.findOne({ $or: [{ username }, { email }] });
      if (!user) {
        throw new Error("Can't find this user");
      }

      // Verify the password using the method defined in the User model
      const correctPw = await user.isCorrectPassword(password);
  

      if (!correctPw) {
        throw new Error('Wrong password!');
      }
      // Generate token using username, email, and user ID
      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    saveBook: async (_: unknown, { bookData }: any, { user }: any) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );
      return updatedUser;
    },
    removeBook: async (_: unknown, { bookId }: any, { user }: any) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }
      return updatedUser;
    },
  },
};

export default resolvers;