const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/user.model');
const { AppError } = require('../errors');
const { getJwtSecret } = require('../config');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function register({ name, email, password } = {}) {
  if (typeof name !== 'string' || !name.trim()) throw new AppError(400, 'Name is required');
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) throw new AppError(400, 'A valid email is required');
  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters');
  }
  const normalized = email.trim().toLowerCase();
  if (users.findOne((u) => u.email === normalized)) throw new AppError(409, 'Email already registered');

  const user = users.create({
    name: name.trim(),
    email: normalized,
    passwordHash: bcrypt.hashSync(password, 10),
  });
  return publicUser(user);
}

function login({ email, password } = {}) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError(400, 'Email and password are required');
  }
  const user = users.findOne((u) => u.email === email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new AppError(401, 'Invalid email or password');
  }
  const token = jwt.sign({ id: user.id, email: user.email }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
  return { token, user: publicUser(user) };
}

module.exports = { register, login };
