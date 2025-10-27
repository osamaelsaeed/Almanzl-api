class ApiFeatures {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  filter() {
    const queryObj = { ...this.queryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const query = JSON.parse(queryStr);
    Object.keys(query).forEach((key) => {
      const value = query[key];
      const isNotNumber = Number.isNaN(
        parseFloat(value) && !Number.isFinite(value),
      );
      if (typeof value === 'string' && isNotNumber) {
        query[key] = new RegExp(value, 'i');
      }
    });
    this.query = this.query.find(query);

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
