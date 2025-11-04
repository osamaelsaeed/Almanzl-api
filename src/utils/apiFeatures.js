class ApiFeatures {
    constructor(query, queryParams) {
        this.query = query;
        this.queryParams = queryParams;
    }

    filter() {
        const queryObj = { ...this.queryParams };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const parsedQuery = JSON.parse(queryStr);

        /**
         * Normalize query parameters for MongoDB filtering.
         *
         * This loop iterates over each key in `parsedQuery` (e.g., { price: { $gt: "20" }, rating: "5", name: "chair" })
         * and performs three main transformations:
         *
         * 1. **Convert numeric operator values**:
         *    - When a field value is an object (e.g., `{ $gt: "20" }`), it loops through its operators
         *      (like `$gt`, `$gte`, `$lt`, `$lte`) and converts any numeric strings to actual numbers.
         *      Example:
         *      `{ price: { $gt: "20" } } → { price: { $gt: 20 } }`
         *
         * 2. **Convert simple numeric fields**:
         *    - When a field directly contains a numeric string (e.g., `"5"`), it converts it to a number.
         *      Example:
         *      `{ rating: "5" } → { rating: 5 }`
         *
         * 3. **Convert plain strings to case-insensitive regex**:
         *    - When a field value is a plain string (not a number or object),
         *      it converts it to a regular expression for case-insensitive search.
         *      Example:
         *      `{ name: "chair" } → { name: /chair/i }`
         *
         * This ensures that query parameters sent via URLs are correctly typed and
         * compatible with MongoDB filtering and search behavior.
         */

        const isObjectIdLike = (str) => /^[0-9a-fA-F]{24}$/.test(str);

        Object.keys(parsedQuery).forEach((key) => {
            const value = parsedQuery[key];
            // Handle operator-based filters like ?price[gt]=20 → { price: { $gt: 20 } }
            if (typeof value === 'object' && !Array.isArray(value)) {
                Object.keys(value).forEach((op) => {
                    if (!isNaN(value[op])) {
                        value[op] = Number(value[op]);
                    }
                });
                // Handle direct numeric filters like ?rating=5 → { rating: 5 }
            } else if (!isNaN(value)) {
                parsedQuery[key] = Number(value);
                // Handle text filters like ?name=chair → { name: /chair/i }
            } else if (typeof value === 'string') {
                if (!isObjectIdLike(value)) {
                    parsedQuery[key] = new RegExp(value, 'i');
                }
            }
        });

        this.query = this.query.find(parsedQuery);
        return this;
    }

    sort() {
        if (this.queryParams.sort) {
            const sortBy = this.queryParams.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryParams.fields) {
            const fields = this.queryParams.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryParams.page * 1 || 1;
        const limit = this.queryParams.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
export default ApiFeatures;
