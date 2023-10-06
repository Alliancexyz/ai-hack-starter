import type { NextApiRequest, NextApiResponse } from "next";
import TelegramBot from "node-telegram-bot-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Create our new bot handler with the token
    // that the Botfather gave us
    // Use an environment variable so we don't expose it in our code
    const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

    // Retrieve the POST request body that gets sent from Telegram
    const { body } = req;

    // Ensure that this is a message being sent
    if (body.message) {
      // Retrieve the ID for this chat
      // and the text that the user sent
      const {
        chat: { id },
        text,
        from,
      } = body.message;

      const allowedUsers = [
        "madavidj",
        "DangerWillRobin",
        "QwQiao",
        "mfouda",
        "imrank",
      ];
      const username = from.username;
      if (!allowedUsers.includes(username)) {
        return res.status(200).send("Unauthorized user");
      }

      // Create a message to send back
      // We can use Markdown inside this
      const message = "Hello, world!";

      // Send our new message back in Markdown and
      // wait for the request to finish
      await bot.sendMessage(id, message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    }
  } catch (error) {
    // If there was an error sending our message then we
    // can log it into the Vercel console
    console.error("Error sending message");
    console.log(error.toString());
  }

  // Acknowledge the message with Telegram
  // by sending a 200 HTTP status code
  // The message here doesn't matter.
  res.send("OK");
}
