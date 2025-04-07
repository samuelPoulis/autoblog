import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

export default async function content(topic, keywords, title, meta, content_instructions) {
    if (content_instructions == null || "") {
        content_instructions = "No additional instructions."
    }
    const client = new OpenAI({apiKey: process.env.openai_key});
    const completion = await client.chat.completions.create({
        model: 'chatgpt-4o-latest',
        messages:[{
            role: 'user',
            content:`${process.env.character_instructions};
            You are to write an SEO optimized article using the data given to you, 
            this data will be the topic, keywords to rank for, the title, and the meta description. 
            You are writing the bulk of the content based on these factors to create a value packed article to rank 
            on google. Make sure it is at least 2500 words long. Here is the data: 
            TOPIC: ${topic}, TITLE: ${title}, KEYWORDS: ${keywords}, META DESCRIPTION: ${meta}. 
            Everything you write will be inserted inside the Wordpress API as the blog Content, so please format it 
            accordingly using html tags so that it looks good on a wordpress site. However, since this content will be 
            inserted directly do not put any code tags for the chat version of chatgpt. Also do not add any ending comments 
            after writing the article. I just want pure content with the appropriate html tags. Since this is going 
            in wordpress directly using the API, do not include the <!DOCTYPE html> and <head> and <body> or “html , as those are not needed 
            for the Wordpress API. Also no H1 tags are needed as that is handled already elsewhere. 
            Go easy on the numbers and bullet points, the less numbers and bullet points the better, 
            but you can still use them very occasionally. 
            Do not use any dashes in the Article at all. Before adding the first h2 tag, write a small intro about the article. 
            There is no need to have the h1 then the exact same h2 title immediately after. 
            There is no need to have a conclustion at the end, but you can summarize the content at the end if needed, however 
            do not just title it "Summary" or something like that. Try to have single statements, 
            not using the word "and" in every sentence unless neccessary, focus on going deeper .
            Make sure to provide sufficient content when you include a H2 heading. If you have a title, there should be a long
            enough paragraph to go deep into that topic. You don't need to bold the focus keyword either, maybe on occation, 
            but it should not be common. Never use dashes of any kind. Also limit h2 tags to 50 characters,
             any more than fifty characters starts to get pixel heavy which we do not want.
            Finally, here is a list of words/phrases to never use: ${process.env.donotuse}
            Additional Instructions: ${content_instructions}`
        }]
    })
    let raw = completion.choices[0].message.content;
    raw = raw.replace(/"`html/g, "")
    raw = raw.replace(/"`/g, "")
    return raw;
}
