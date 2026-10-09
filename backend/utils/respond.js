function handleError(res, err) {
  if (err && err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ error: first ? first.message : 'Invalid data.' });
  }
  if (err && err.code === 11000) {
    return res.status(400).json({ error: 'That name or email is already taken!' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server.' });
}

const NAME_RE  = /^[\p{L}\p{N} _-]{2,20}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = { handleError, NAME_RE, EMAIL_RE };
