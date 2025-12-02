/* This is for initializing the database and the admin if there's none. */
db.createUser({
  user: process.env.INIT_MONGO_USERNAME,
  pwd: process.env.INIT_MONGO_PASSWORD,
  roles: [
    {
      role: "readWrite",
      db: process.env.INIT_MONGO_DATABASE,
    },
  ],
});
