import Ajv from 'ajv';
import AppError from '../utils/AppError.js';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

export default (schema) => {
    return (req, res, next) => {
        const isValid = ajv.validate(schema, req.body);
        if (!isValid) {
            const errors = ajv.errors.map((err) => err.message).join(', ');
            return next(new AppError(errors, 400));
        }
        next();
    };
};
