const userRouter = require("./userRouter");


const mountRoutes = (app) => {
  const routes = {
   "/user": userRouter,
  };

  Object.entries(routes).forEach(([path, router]) => {
    app.use(path, router);
  });
};

module.exports = mountRoutes;