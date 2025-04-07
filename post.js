import axios from "axios";
import createCaption from "./createCaption.js";
import createImagePrompt from "./createImagePrompt.js";
import createImage from "./createImage.js";
import dotenv from 'dotenv';
dotenv.config();

export default async function postToSocial(webhook) {
    let caption;
    let webhookData;
    let imageUrl = 'https://sdmntprnorthcentralus.oaiusercontent.com/files/00000000-7368-522f-9c37-c9cab69e09db/raw?se=2025-04-04T17%3A00%3A09Z&sp=r&sv=2024-08-04&sr=b&scid=30251b78-f053-501e-9844-ca0d120d80fa&skoid=de76bc29-7017-43d4-8d90-7a49512bae0f&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-04T15%3A12%3A47Z&ske=2025-04-05T15%3A12%3A47Z&sks=b&skv=2024-08-04&sig=h81UcNIsLakRTEYfvPkBpwnsJdniVMJB5KdQBCeWyXY%3D'
    try {
        caption = await createCaption('https://replockmarketing.com/how-restoration-are-scaling-new-heights/')
        webhookData = {
            image: imageUrl,
            caption: caption
        }
        axios.post(webhook, webhookData, {
            headers: {
              'Content-Type': 'application/json',
            }
          })
          .then(response => {
            console.log("Response: ", response);
          })
          .catch(error => {
            console.error("Error posting:", error.response.data);
          });
        }
    catch (error) {
        console.error('Error:', error);
        throw error;
      } 
    finally {
        console.log(webhookData)
      }

      
}

let confirm = await postToSocial(process.env.webhook_url);
console.log(confirm);