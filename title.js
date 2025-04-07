import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

export default async function title(topic, keywords) {
    const client = new OpenAI({apiKey: process.env.openai_key});

    const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages:[{
            role: "user", 
            content: `You are to come up with a title for a blog post based on 
            this particular topic: ${topic} Keywords: ${keywords}  Make sure the
             title is less than less than 60 characters, less than 50 characters
              would be even better. Do not return or generate anthing but an SEO 
              optimized title, or any fancy format. Just the title in plain text please. 
              Do not use a colon of any kind in the title/heading, do not use — or any kind of dash.
              Finally, here is a list of words/phrases to never use: ${process.env.donotuse}`

        }]

    })
    return completion.choices[0].message.content;
}