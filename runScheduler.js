// blogPoster.js
import axios from 'axios';
import dotenv from 'dotenv';
import readline from 'readline';

import title from './title.js';
import topic from './topic.js';
import meta from './meta.js';
import generate_keyword from './keywordgen.js';
import content from './content.js';
import {
  getDistributedWeekdayDates as spread,
  // getWeekdayDates as firstN     // still available if you want it
} from './scheduler.js';

dotenv.config();

/* ---------- prompt helper ---------- */
function prompt(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, a => (rl.close(), resolve(a))));
}

/* ---------- auth ---------- */
const auth = Buffer
  .from(`${process.env.wp_user}:${process.env.app_password}`)
  .toString('base64');

/* ---------- post builder ---------- */
async function generateAndPostBlog(scheduledISO = null) {
  const topic_gen   = await topic(process.env.topic_instructions);
  const keyword_gen = await generate_keyword(topic_gen);
  const title_gen   = await title(topic_gen, keyword_gen);
  const meta_gen    = await meta(topic_gen, keyword_gen, title_gen);
  const content_gen = await content(
    topic_gen,
    keyword_gen,
    title_gen,
    meta_gen,
    process.env.content_instructions
  );

  const postData = {
    title:  title_gen,
    content: content_gen,
    meta: {
      rank_math_description:   meta_gen,
      rank_math_focus_keyword: keyword_gen
    },
    status: scheduledISO ? 'future' : 'draft',
  };

  if (scheduledISO) postData.date = scheduledISO;  // ISO 8601

  try {
    const res = await axios.post(
      `${process.env.base_url}wp-json/wp/v2/posts`,
      postData,
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` } }
    );
    console.log('Check the post via link:', res.data.link);
  } catch (err) {
    console.error('Error posting:', err.response?.data || err.message);
  }
}

/* ---------- main ---------- */
async function run() {
  const numBlogs = parseInt(await prompt('How many blogs to generate: '), 10);
  if (!Number.isInteger(numBlogs) || numBlogs < 1) return console.error('Invalid number.');

  const scheduleChoice = (await prompt('Schedule the posts? (y/n): ')).trim().toLowerCase();
  let scheduleDates = [];

  if (scheduleChoice === 'y') {
    const year  = parseInt(await prompt('Year (YYYY): '), 10);
    const month = parseInt(await prompt('Month (1-12): '), 10);

    try {
      // Monday-Friday dates, evenly spread, ISO YYYY-MM-DD
      const days = spread(year, month, numBlogs);
      scheduleDates = days.map(d => `${d}T12:00:00`);
      console.log('Scheduling on:', scheduleDates);
    } catch (e) {
      return console.error(e.message);
    }
  }

  // fire off each blog
  for (let i = 0; i < numBlogs; i++) {
    const date = scheduleChoice === 'y' ? scheduleDates[i] : null;
    console.log(`\n=== Generating blog ${i + 1}/${numBlogs} ===`);
    await generateAndPostBlog(date);
  }
}

run();
