import axios from "axios";
import dotenv from 'dotenv';
import title from './title.js';
import topic from './topic.js';
import meta from './meta.js';
import generate_keyword from './keywordgen.js';
import content from "./content.js";
import readline from "readline";

dotenv.config();

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    })
  );
}

const username = process.env.wp_user;
const app_pass = process.env.app_password;
const auth = Buffer.from(`${username}:${app_pass}`).toString('base64');

async function generateAndPostBlog(scheduledDate = null) {

  const topic_gen = await topic(process.env.topic_instructions);
  console.log("Topic:", topic_gen);
  
  const keyword_gen = await generate_keyword(topic_gen);
  console.log("Keywords:", keyword_gen);
  
  const title_gen = await title(topic_gen, keyword_gen);
  console.log("Title:", title_gen);
  
  const meta_gen = await meta(topic_gen, keyword_gen, title_gen);
  console.log("Meta Description:", meta_gen);
  
  console.log("Generating article content...");
  const content_gen = await content(
    topic_gen,
    keyword_gen,
    title_gen,
    meta_gen,
    process.env.content_instructions
  );
  console.log("Finished generating content.");
  console.log("Posting...");

 
  let postData = {
    title: title_gen,
    content: content_gen,
    meta: {
      rank_math_description: meta_gen,
      rank_math_focus_keyword: keyword_gen
    }
  };

  if (scheduledDate) {
    postData.status = 'future'; // scheduled post
    postData.date = scheduledDate; // ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
  } else {
    postData.status = 'draft';
  }

  axios.post(`${process.env.base_url}wp-json/wp/v2/posts`, postData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    }
  })
  .then(response => {
    console.log("Check the post via link:", response.data.link);
  })
  .catch(error => {
    console.error("Error posting:", error.response.data);
  });
}

async function run() {

  const numBlogsStr = await prompt("How many blogs to generate: ");
  const numBlogs = parseInt(numBlogsStr, 10);
  

  const dateOption = await prompt('Would you like to schedule these posts to be published? (y/n): ');
  
  let dates = [];
  if (dateOption.toLowerCase() === 'y') {
    console.log('Type in the date and time in the following format: YYYY-MM-DDTHH:mm:ss');
    console.log('Example: "2025-04-25T15:00:00" NOTE: if you fuck up you gotta kill the terminal and start over.');
    // Collect a date for each blog
    for (let i = 0; i < numBlogs; i++) {
      dates[i] = await prompt(`Date for Blog ${i + 1}: `);
    }
  }

  for (let i = 0; i < numBlogs; i++) {
    const scheduledDate = (dateOption.toLowerCase() === 'y') ? dates[i] : null;
    await generateAndPostBlog(scheduledDate);
  }
}

run();
