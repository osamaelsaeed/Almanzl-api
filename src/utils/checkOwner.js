import AppError from './AppError.js';
import { asyncHandler } from './asyncHandler.js';

const restrictToOwner = (Model, message) =>
    asyncHandler(async (req, res, next) => {
        const doc = await Model.findById(req.params.id);
        if (!doc) {
            return next(new AppError(`${Model.modelName} not found`, 404));
        }

        if (!doc.user._id.equals(req.id)) {
            return next(new AppError(message ?? 'You are not allowed to perform this action', 403));
        }

        next();
    });

export default restrictToOwner;
