const db = require('../config/database');

const generateAgeDistributionReport = async () => {
  const query = `
    SELECT 
      SUM(CASE WHEN age < 20 THEN 1 ELSE 0 END) as under_20,
      SUM(CASE WHEN age >= 20 AND age < 40 THEN 1 ELSE 0 END) as age_20_40,
      SUM(CASE WHEN age >= 40 AND age <= 60 THEN 1 ELSE 0 END) as age_40_60,
      SUM(CASE WHEN age > 60 THEN 1 ELSE 0 END) as age_60_plus,
      COUNT(*) as total
    FROM public.users
  `;

  const { rows } = await db.query(query);
  const data = rows[0];
  const total = Number(data.total);

  if (total === 0) return { message: 'No data available' };

  const p1 = ((Number(data.under_20) / total) * 100).toFixed(2);
  const p2 = ((Number(data.age_20_40) / total) * 100).toFixed(2);
  const p3 = ((Number(data.age_40_60) / total) * 100).toFixed(2);
  const p4 = ((Number(data.age_60_plus) / total) * 100).toFixed(2);

  console.log('\nAge-Group | % Distribution');
  console.log('---------------------------');
  console.log(`< 20      | ${p1}`);
  console.log(`20 to 40  | ${p2}`);
  console.log(`40 to 60  | ${p3}`);
  console.log(`> 60      | ${p4}`);
  console.log('---------------------------\n');

  return {
    distribution: {
      '< 20': p1,
      '20 to 40': p2,
      '40 to 60': p3,
      '> 60': p4
    }
  };
};

module.exports = { generateAgeDistributionReport };