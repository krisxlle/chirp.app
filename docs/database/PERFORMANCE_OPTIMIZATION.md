# Database Performance Optimization Recommendations

## Current Issues

The Chirp app is experiencing database timeout issues (error code 57014) when fetching basic chirps. This document outlines the optimizations implemented and additional recommendations.

## Implemented Optimizations

### 1. Query Optimization
- **Simplified SELECT statements**: Reduced fields fetched from users table
- **Separated queries**: Split chirp and user data fetching for better performance
- **Reduced limits**: Decreased from 20 to 10 chirps per query
- **Aggressive timeouts**: Set 3-second timeout for main query, 2-second for counts

### 2. Caching Strategy
- **Extended cache TTL**: Increased from 1 minute to 5-10 minutes
- **Basic feed caching**: Added dedicated cache for basic feed queries
- **Mock data fallback**: Cache mock data when database times out

### 3. Error Handling
- **Graceful degradation**: Fall back to mock data on timeout
- **Timeout warnings**: Clear logging for performance issues
- **Count query fallbacks**: Show 0 counts instead of failing

## Database Schema Recommendations

### 1. Indexes (Critical)
```sql
-- Primary chirps query optimization
CREATE INDEX CONCURRENTLY idx_chirps_reply_to_id_created_at 
ON chirps (reply_to_id, created_at DESC) 
WHERE reply_to_id IS NULL;

-- User lookups
CREATE INDEX CONCURRENTLY idx_users_id_handle 
ON users (id, custom_handle, handle);

-- Reaction counts
CREATE INDEX CONCURRENTLY idx_reactions_chirp_id 
ON reactions (chirp_id);

-- Reply counts
CREATE INDEX CONCURRENTLY idx_chirps_reply_to_id 
ON chirps (reply_to_id) 
WHERE reply_to_id IS NOT NULL;
```

### 2. Query Optimization
```sql
-- Optimized basic feed query
SELECT 
  c.id,
  c.content,
  c.created_at,
  c.author_id,
  u.first_name,
  u.custom_handle,
  u.handle,
  u.profile_image_url
FROM chirps c
INNER JOIN users u ON c.author_id = u.id
WHERE c.reply_to_id IS NULL
ORDER BY c.created_at DESC
LIMIT 10;
```

### 3. Materialized Views (Advanced)
```sql
-- Pre-computed reaction counts
CREATE MATERIALIZED VIEW mv_chirp_reaction_counts AS
SELECT 
  chirp_id,
  COUNT(*) as reaction_count
FROM reactions
GROUP BY chirp_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW mv_chirp_reaction_counts;
```

## Application-Level Optimizations

### 1. Connection Pooling
- Implement connection pooling for Supabase client
- Use read replicas for read-heavy operations
- Configure appropriate pool sizes

### 2. Query Batching
- Batch multiple count queries into single requests
- Use Supabase's batch API where possible
- Implement request deduplication

### 3. Caching Strategy
- Redis cache for frequently accessed data
- CDN caching for static user data
- Client-side caching with proper invalidation

## Monitoring and Alerting

### 1. Performance Metrics
- Query execution time monitoring
- Timeout frequency tracking
- Cache hit/miss ratios
- Database connection pool status

### 2. Alerts
- Query timeout alerts (>2 seconds)
- High error rate alerts
- Cache miss rate alerts
- Database connection issues

## Immediate Actions

1. **Add the recommended indexes** (highest priority)
2. **Monitor query performance** after index creation
3. **Implement connection pooling** if not already done
4. **Set up performance monitoring** and alerting
5. **Consider read replicas** for read-heavy workloads

## Long-term Solutions

1. **Database sharding** for horizontal scaling
2. **Caching layer** (Redis) implementation
3. **Query result materialization** for complex aggregations
4. **Database migration** to a more performant solution if needed

## Testing

After implementing optimizations:

1. **Load testing** with realistic data volumes
2. **Performance benchmarking** before/after changes
3. **Timeout testing** under various load conditions
4. **Cache effectiveness** validation

## Notes

- All database changes should be tested in staging first
- Monitor application performance after each change
- Consider gradual rollout for production changes
- Document any schema changes for team reference
