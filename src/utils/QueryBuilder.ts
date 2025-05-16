import { Model, Document } from 'mongoose';
import { QueryOptions, FilterOptions } from '../types';

class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private queryOptions: QueryOptions;

  constructor(model: Model<T>, queryOptions: QueryOptions = {}) {
    this.model = model;
    this.queryOptions = queryOptions;
  }

  private buildFilterConditions(): Record<string, any> {
    const { filters = {}, searchTerm, searchFields = [] } = this.queryOptions;
    const filterConditions: Record<string, any> = { ...filters };

    // Add search functionality if searchTerm and searchFields are provided
    if (searchTerm && searchFields.length > 0) {
      const searchRegex = new RegExp(searchTerm, 'i');
      const searchConditions = searchFields.map((field) => ({
        [field]: searchRegex,
      }));

      if (searchConditions.length > 0) {
        filterConditions.$or = searchConditions;
      }
    }

    return filterConditions;
  }

  async findAll(): Promise<{
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { pagination = {}, sort = { createdAt: 'desc' } } = this.queryOptions;

    // Set default pagination values
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const filterConditions = this.buildFilterConditions();

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.model
        .find(filterConditions)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filterConditions),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(): Promise<T | null> {
    const filterConditions = this.buildFilterConditions();
    return this.model.findOne(filterConditions).exec();
  }
}

export default QueryBuilder;
