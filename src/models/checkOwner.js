import AppError from '../utils/AppError.js';

const restrictToOwner = (Model) => async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
        return next(new AppError('Document not found', 404));
    }

    if (!doc.user._id.equals(req.id)) {
        return next(new AppError('You are not allowed to perform this action', 403));
    }

    next();
};

export default restrictToOwner;
