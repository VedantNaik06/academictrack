// Converts a user document to a plain object WITHOUT the password,
// so it is safe to send to the client.
export const toSafeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};