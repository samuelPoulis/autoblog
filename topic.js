import OpenAI from "openai";
import get_titles from './get_titles.js';
import dotenv from 'dotenv';
dotenv.config();
export default async function topic(user_instructions) {
    if (user_instructions == null || '') {
        user_instructions = "No additional Instructions";
    }
    const api_key = process.env.openai_key;
    const client = new OpenAI({apiKey: api_key});
    const titlesArray = await get_titles();
    const post_titles = titlesArray.join(', ');
    const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages:[{
            role: 'user', 
            content: `You are to come up with a topic for writing a blog posts, 
            and give a very brief description. Here is a list of blog titles that 
            have already been written, Take note of the types of blogs that are written, 
            and try to come up with a new topic about something that has not been done 
            yet according to these articles. ${post_titles}, Please take into account
             the post titles, however these are additional user instructions: ${user_instructions}`
        }
        ]
    })
    return completion.choices[0].message.content
}
