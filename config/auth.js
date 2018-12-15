exports.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        console.log('not logged in error');
        res.redirect('/users/login');
    }
};