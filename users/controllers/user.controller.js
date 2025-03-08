const User = require("../models/user.model");
const boom = require("boom");

const fastify = require("../../app")

const getAllUsers = async(req, rep)=> {
    try {
        const user = fastify.jwt.decode(req.cookies.token)
        if (user){console.log(user)}

        const result = await User.find()
        return result;
    } catch (error) {
        rep.status(500).send({ error: 'An error occurred while fetching users.' });
    }
};
const getOneUser = async(req, rep)=>{
    try {
        const user = await User.findOne({username: req.params.username});
    
        rep.code(200).send(user);
      } catch (err) {
        throw boom.boomify(err);
      }
}
const createOneUser = async (req, rep) => {
  try {
      const body = req.body;
      const password = req.body.password;
      const user = new User({
          name: body.name,
          username: body.username
      });
      user.password = await fastify.bcrypt.hash(password);

      const token = fastify.jwt.sign({ user });
      console.log(token);
      
      await user.save();
      
      rep.setCookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          path: '/',
          maxAge: 60 * 60 * 24
      });
      rep.setCookie('username', user.username,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
        maxAge: 60 * 60 * 24
      })

      rep.code(201).send({ user: user });
  } catch (err) {
      throw boom.boomify(err);
  }
};


const updateOneUser = async (req, rep)=> {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });
    
        rep.code(200).send(user);
      } catch (err) {
        throw boom.boomify(err);
      }
} 
const deleteOneUser = async (req, reply) => {
    try {
      await User.findByIdAndDelete(req.params.id);
  
      reply.code(204).send();
    } catch (err) {
      throw boom.boomify(err);
    }
  };
  const login = async (req, rep) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
        return rep.code(400).send('Username or password are not correct');
    }

    const isPasswordValid = await fastify.bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return rep.code(400).send('Username or password are not correct');
    }

    const token = fastify.jwt.sign(user);
    rep.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 60 * 60 * 24
  });
  rep.setCookie('username', username,{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24
  })
    return rep.code(200).send({ message: 'Login successful', token });
};
const logout = async (req, rep) => {
  console.log('logout');
  console.log(req.cookies.token);
  
  // Clear the token cookie properly
  rep.clearCookie('token'); // Assuming 'token' is the name of the cookie
  rep.clearCookie('username')
  console.log('Token cleared');
  // Optionally, you can send a response back to the client
  rep.send({ message: 'Logged out successfully' });
  // rep.redirect('/auth'); // Uncomment if you want to redirect from the server side
};

module.exports = {
    getAllUsers,
    getOneUser,
    createOneUser,
    updateOneUser,
    deleteOneUser,
    login,
    logout,
}