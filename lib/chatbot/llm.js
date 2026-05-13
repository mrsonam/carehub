import { formatDoctorStructuredReply } from "./doctor-format.js";
const DEFAULT_MODEL = process.env.CHATBOT_MODEL || "gpt-4o-mini";

function createFallbackReply({ intent, context }) {
  if (intent === "doctor_info") {
    return formatDoctorStructuredReply({ doctors: context.doctors });
  }

  if (intent === "website_navigation") {
    const routeList = context.website.map((item) => `${item.label}: ${item.path}`).join("\n");
    return `I can help you navigate these clinic pages:\n${routeList}`;
  }

  return `I can help with clinic information, booking steps, doctor profiles, and contact details. You can also reach us at ${context.contact.email}.`;
}

export async function askClinicModel({ userMessage, intent, context }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createFallbackReply({ intent, context });
  }

  const systemPrompt =
    "You are CareHub's clinic assistant. Only answer questions about this clinic, its website, booking flows, and doctors from the provided context. Never provide diagnosis or treatment plans. If data is missing, say it is not available and direct users to contact the clinic. For doctor_info intent, always return a structured list with fields: Name, Title, Bio, Availability, Booking.";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            question: userMessage,
            intent,
            context,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return createFallbackReply({ intent, context });
  }

  const payload = await response.json().catch(() => null);
  const answer = payload?.choices?.[0]?.message?.content?.trim?.();
  return answer || createFallbackReply({ intent, context });
}
