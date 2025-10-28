export default (fn) =>
    // we did this because we dont want any of the controllers to fire this
    // function and execute it instead we need to return the function.
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };
