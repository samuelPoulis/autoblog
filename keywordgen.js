import OpenAI from "openai";
import dotenv from 'dotenv';
import get_keywords from "./get_keywords.js";
dotenv.config();

export default async function generate_keyword(topic) {
    const client = new OpenAI({apiKey: process.env.openai_key});
    const keywordsArray = await get_keywords(process.env.base_url);
    const keyword_list = keywordsArray.join(', ')
    const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages:[{
            role: 'user',
            content: `Create exactly two keywords for a blog post based on this topic to try and 
            rank for on Google: ${topic} NOTE: Do not generate anything except 2 keywords separated
             by a comma, no numbers, Nothing except two keywords separated via comma. This is the
              list of previously used keywords, try to come up with something different or new, and 
              pick something that has the potential to rank well on google: ${keyword_list}, 
              again please do not write anything except the two keywords
              Finally, here is a list of words to never use ${process.env.donotuse}`
        }
        ]
    })
    return completion.choices[0].message.content;
}