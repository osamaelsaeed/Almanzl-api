import ApiFeatures from './apiFeatures';
import AppError from './AppError';
import asyncHandler from 'express-async-handler';
import { SUCCESS } from './reposnseStatus';

const getModelNameInLowerCase = (Model) => Model.modelName.toLowerCase();

export const deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        const modelName = getModelNameInLowerCase(Model);
        if (!doc) {
            return next(new AppError(`No ${modelName} found with that ID`, 404));
        }
        res.status(204).json({ status: SUCCESS, data: null });
    });

export const updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        const modelName = getModelNameInLowerCase(Model);

        if (!doc) {
            return next(new AppError(`No ${modelName} found with that ID`, 404));
        }
        res.status(200).json({ status: SUCCESS, data: doc });
    });

export const createOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: SUCCESS,
            data: doc,
        });
    });

export const getOne = (Model, populateOptions) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        // Here we have query
        let query = Model.findById(id).select('-__v');

        if (populateOptions) {
            query = query.populate(populateOptions);
        }
        const doc = await query;

        const modelName = getModelNameInLowerCase(Model);
        if (!doc) {
            return next(new AppError(`No ${modelName} found with that ID`, 404));
        }

        res.status(200).json({
            status: SUCCESS,
            data: doc,
        });
    });

export const getAll = (Model, populateOptions = null, nestedFilter = {}) =>
    asyncHandler(async (req, res, next) => {
        const filter = {};
        Object.entries(nestedFilter || {}).forEach(([paramName, fieldName]) => {
            if (req.params && req.params[paramName]) {
                filter[fieldName] = req.params[paramName];
            }
        });
        //EXECUTE QUERY
        const features = new ApiFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // const docs = await features.query.explain();
        let { query } = features;
        if (populateOptions) {
            query = query.populate(populateOptions);
        }
        const docs = await query;

        res.status(200).json({
            status: SUCCESS,
            results: docs.length,
            // This is called envelope
            data: docs,
        });
    });
