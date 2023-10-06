import { OpenAI } from "langchain/llms/openai";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const models: Record<string, OpenAI> = {};

async function sha256(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Allows you to call an LLM model with a certain prompt, and caches
 * the result in the DB to not have to worry about costs.
 */
export async function cachedCall(modelName: string, prompt: string) {
  const promptHashShort = (await sha256(prompt)).slice(0, 10);
  const key = `call-${modelName}-${promptHashShort}`;

  const row = await prisma.kvStoreLong.findUnique({
    where: {
      key,
    },
  });

  if (row) {
    return row.value;
  }

  // Cache miss, so call the model.
  let model = models[modelName];
  if (!model) {
    models[modelName] = new OpenAI({
      modelName,
      temperature: 0,
    });
    model = models[modelName];
  }

  const completion = await model.call(prompt);

  // Cache the result.
  await prisma.kvStoreLong.create({
    data: {
      key,
      value: completion,
    },
  });

  return completion;
}
