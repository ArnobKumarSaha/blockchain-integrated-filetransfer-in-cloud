
module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {  // isLoggedIn was set on authController/postLogin route.
        return res.redirect('/login'); // If No loggedIn user found , then promt user to log in first.
    }
    next();
}