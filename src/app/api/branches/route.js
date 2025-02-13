import dbConnect from '@/lib/db';
import Branch from '@/lib/models/Branch';

export async function GET(req, res) {
  await dbConnect();

  try {
    const branches = await Branch.find({});
    return new Response(JSON.stringify(branches), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching branches' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
