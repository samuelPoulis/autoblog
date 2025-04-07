import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

export default async function meta(topic, keywords, title) {

    const client = new OpenAI({apiKey: process.env.openai_key});

    const completion = await client.chat.completions.create({
        model: "chatgpt-4o-latest",
        messages:[{
            role: 'user',
            content: `You are to generate an SEO optimized meta description for a blog 
            using the following data. The data provided is the topic, keyword, and title 
            of the blog post: ${topic}, ${keywords}, ${title}.  Try not to use generic meta
             descriptions, like using the word discover every time. The description should be 
             below 150 characters for maxiumum SEO optimization. Do not write anything except 
             the meta description, no formating, just the meta description for the post. Thank you.
             Finally, here is a list of words/phrases to never use: ${process.env.donotuse}`
        }

            
        ]
    })
    return completion.choices[0].message.content;
}
