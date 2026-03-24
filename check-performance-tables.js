const { query } = require('./src/config/database');

async function checkPerformanceTables() {
  try {
    console.log('🔍 Checking performance tables...');
    
    // Check if performance_reviews table exists
    const [reviewsTable] = await query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'performance_reviews'
    `);
    console.log('performance_reviews table exists:', reviewsTable[0].count > 0 ? '✅' : '❌');
    
    // Check if performance_criteria table exists
    const [criteriaTable] = await query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'performance_criteria'
    `);
    console.log('performance_criteria table exists:', criteriaTable[0].count > 0 ? '✅' : '❌');
    
    // Check if performance_scores table exists
    const [scoresTable] = await query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'performance_scores'
    `);
    console.log('performance_scores table exists:', scoresTable[0].count > 0 ? '✅' : '❌');
    
    // Check if performance_goals table exists
    const [goalsTable] = await query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'performance_goals'
    `);
    console.log('performance_goals table exists:', goalsTable[0].count > 0 ? '✅' : '❌');
    
    // Test a simple query on performance_reviews
    if (reviewsTable[0].count > 0) {
      try {
        const [testQuery] = await query('SELECT COUNT(*) as count FROM performance_reviews');
        console.log('performance_reviews row count:', testQuery[0].count);
      } catch (error) {
        console.log('❌ Error querying performance_reviews:', error.message);
      }
    }
    
    // Test a simple query on performance_criteria
    if (criteriaTable[0].count > 0) {
      try {
        const [testQuery] = await query('SELECT COUNT(*) as count FROM performance_criteria');
        console.log('performance_criteria row count:', testQuery[0].count);
      } catch (error) {
        console.log('❌ Error querying performance_criteria:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking tables:', error.message);
    console.log('Stack:', error.stack);
  }
}

checkPerformanceTables();
