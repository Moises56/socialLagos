import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://mougrind_db_user:RslHLoHSNAafvGFY@cluster0.7xxjlmd.mongodb.net/socialforge?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  await mongoose.connect(MONGODB_URI);

  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@socialforge.com' },
    {
      $set: {
        plan: 'agency',
        'usage.contentGenerated': 0,
        'usage.postsPublished': 0,
        'usage.periodStart': new Date(),
        'usage.periodEnd': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }
    }
  );

  console.log('Updated:', result.modifiedCount, 'document(s)');

  const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin@socialforge.com' });
  console.log('Plan:', user.plan);
  console.log('Content generated:', user.usage.contentGenerated);
  console.log('Period end:', user.usage.periodEnd);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
