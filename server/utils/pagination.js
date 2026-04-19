/**
 * Pagination Utility
 * Provides standardized pagination for list endpoints
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @param {Object} options - Default options
 * @returns {Object} Parsed pagination parameters
 */
export const parsePaginationParams = (query, options = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 12,
    maxLimit = 100
  } = options;

  const page = Math.max(1, parseInt(query.page) || defaultPage);
  const limit = Math.max(1, Math.min(maxLimit, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build pagination metadata for response
 * @param {number} total - Total number of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {string} baseUrl - Base URL for building links (optional)
 * @returns {Object} Pagination metadata
 */
export const buildPaginationMeta = (total, page, limit, baseUrl = null) => {
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const meta = {
    pagination: {
      total,
      count: limit,
      perPage: limit,
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
      from: total > 0 ? (page - 1) * limit + 1 : 0,
      to: Math.min(page * limit, total)
    }
  };

  // Add links if baseUrl provided
  if (baseUrl) {
    meta.links = {
      self: `${baseUrl}?page=${page}&limit=${limit}`,
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
      next: hasNextPage ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: hasPrevPage ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null
    };
  }

  return meta;
};

/**
 * Apply pagination to a Mongoose query
 * @param {Query} query - Mongoose query object
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Number of documents to return
 * @returns {Query} Paginated query
 */
export const applyPagination = (query, skip, limit) => {
  return query.skip(skip).limit(limit);
};

/**
 * Standard paginated response format
 * @param {Object} res - Express response object
 * @param {Array} data - Data array
 * @param {Object} paginationMeta - Pagination metadata
 * @param {Object} extra - Extra fields to include
 */
export const sendPaginatedResponse = (res, data, paginationMeta, extra = {}) => {
  res.status(200).json({
    success: true,
    data,
    ...paginationMeta,
    ...extra
  });
};

/**
 * Middleware to parse pagination from query
 */
export const paginationMiddleware = (options = {}) => {
  return (req, res, next) => {
    const { page, limit, skip } = parsePaginationParams(req.query, options);
    req.pagination = { page, limit, skip };
    next();
  };
};

export default {
  parsePaginationParams,
  buildPaginationMeta,
  applyPagination,
  sendPaginatedResponse,
  paginationMiddleware
};
