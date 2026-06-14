import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "articles");
const expansions = {
  "perception": {
    readTime: "12 min read",
    sections: [
      ["Build a practical perception scorecard", "Turn vague impressions into evidence. Score the touchpoints a prospect experiences before, during, and after contacting you: search results, reviews, website clarity, response time, proposals, onboarding, delivery, and follow-up. Use a simple one-to-five scale for trust, relevance, ease, and differentiation. The lowest scores identify where perception is leaking revenue."],
      ["Test the message before scaling it", "Before buying more traffic, run small message tests. Change one promise, proof point, or call to action at a time and compare qualified inquiries, booked conversations, and close rate. A message that earns more clicks but worse prospects is not an improvement. The goal is profitable alignment between what customers expect and what you deliver."],
      ["Measure the commercial effect", "Track branded search volume, direct traffic, review sentiment, lead-to-meeting rate, proposal acceptance, and referrals. These indicators reveal whether the market understands and trusts your position. Review them monthly and pair the numbers with actual customer language so the dashboard never becomes detached from reality."]
    ],
    failures: ["Trying to fix perception with a new logo alone", "Copying a competitor's language instead of owning a specific strength", "Ignoring operational signals such as slow replies or confusing proposals", "Measuring awareness without measuring lead quality and revenue"],
    faqs: [["How long does it take to change brand perception?", "Visible improvements can appear within weeks when the problem is tactical, but meaningful market repositioning usually requires several months of consistent messaging and delivery."], ["Should a small business conduct formal research?", "Yes, but it can be lightweight. Ten customer interviews, a review audit, lost-prospect feedback, and search-result analysis often reveal more than a large generic survey."], ["What should we fix first?", "Start with the highest-friction touchpoint closest to revenue, usually response speed, offer clarity, proof, or the sales conversation."]]
  },
  "business-character": {
    readTime: "11 min read",
    sections: [
      ["Define character in observable behavior", "Words such as innovative, caring, and professional are too broad to guide decisions. Translate each value into behavior. If your character is candid, proposals should explain tradeoffs. If it is disciplined, deadlines and reporting should be dependable. If it is inventive, customers should encounter useful ideas before they buy."],
      ["Use character to make faster choices", "A clear character acts as a filter for partnerships, content, hiring, service recovery, and pricing. Ask whether an action reinforces the reputation you want to earn. The strongest brands are not endlessly flexible; they are reliably themselves."],
      ["Audit consistency across the customer journey", "Review your website, sales calls, email, packaging, invoices, and support. Note where the voice or standard changes. Consistency does not mean repetition. It means the same recognizable judgment and values showing up in different situations."]
    ],
    failures: ["Choosing values because they sound admirable", "Letting every channel use a different voice", "Promising a personality operations cannot support", "Confusing character with a visual style guide"],
    faqs: [["Is brand character only for consumer businesses?", "No. In professional services and B2B markets, character reduces perceived risk because buyers know how the company is likely to behave."], ["Can a company have more than one personality?", "It can have range, but it needs a stable center. Choose three or four traits that remain true across channels and situations."], ["How often should character be revisited?", "Review it annually or after a major change in leadership, audience, service mix, or market position."]]
  },
  "shoestring-budget": {
    readTime: "12 min read",
    sections: [
      ["Prioritize by proximity to revenue", "When money is tight, improve the steps closest to a sale before buying more reach. Tighten the offer, improve follow-up, request reviews, reactivate past customers, and make referrals easy. These moves use demand and relationships you already have."],
      ["Build one repeatable acquisition loop", "Choose one audience, one painful problem, one useful piece of content, one follow-up sequence, and one clear offer. Run the loop every week. A modest system that compounds is more valuable than scattered experiments that are abandoned before they teach you anything."],
      ["Use a ninety-day allocation", "Reserve roughly seventy percent for proven activity, twenty percent for improving conversion, and ten percent for experiments. Set a stop rule for every test. If it cannot produce a measurable signal within the agreed budget or period, pause it and record what you learned."]
    ],
    failures: ["Spreading a small budget across too many channels", "Buying traffic before fixing the offer and follow-up", "Treating free tactics as free when they consume substantial time", "Stopping a promising campaign before enough data accumulates"],
    faqs: [["What is the best first marketing investment?", "For most service businesses, improve the offer, website conversion path, review profile, and lead follow-up before increasing advertising."], ["How much should a small business spend?", "The right amount depends on margin, capacity, sales cycle, and customer value. Start from an allowable acquisition cost rather than an arbitrary percentage."], ["Can content marketing work with a small team?", "Yes, when one strong idea is repurposed into an article, email, short posts, sales follow-up, and customer education."]]
  },
  "finding-balance": {
    readTime: "10 min read",
    sections: [
      ["Design capacity before the calendar fills", "Start with the hours and energy you can sustainably commit, then assign them to leadership, delivery, selling, and recovery. If every hour is promised before the week begins, any surprise becomes a crisis. Capacity is a strategic resource, not leftover space."],
      ["Separate urgent work from important work", "Create two protected blocks each week for decisions that improve the business rather than merely maintain it. Use them for positioning, process improvement, relationship building, and financial review. The work rarely becomes urgent, which is why it is easy to postpone indefinitely."],
      ["Build a recovery operating system", "Define shutdown cues, communication boundaries, delegation triggers, and a short weekly review. Recovery should not depend on reaching exhaustion. Leaders make better commercial decisions when attention is not permanently fragmented."]
    ],
    failures: ["Treating burnout as evidence of commitment", "Using every open hour for delivery and none for improvement", "Keeping decisions that should be delegated", "Changing priorities daily instead of reviewing them weekly"],
    faqs: [["Is balance realistic during a growth period?", "Perfect balance is not, but deliberate tradeoffs are. A growth sprint should have a defined purpose, duration, and recovery plan."], ["What should an owner delegate first?", "Delegate repeatable work with clear standards and low strategic consequence, then document the process before expanding responsibility."], ["How do we protect focus in a responsive business?", "Use response-time promises, escalation rules, office hours, and shared visibility so not every message becomes an immediate interruption."]]
  },
  "checking-givens": {
    readTime: "10 min read",
    sections: [
      ["Run an assumption inventory", "List the statements your plan treats as facts: who the best customer is, why people buy, which channel works, what price the market accepts, and what your team can deliver. Mark each as proven, partly proven, or inherited. Inherited beliefs deserve immediate scrutiny."],
      ["Design the smallest useful test", "Do not debate an assumption for weeks when a small test can answer it. Interview five customers, change one landing page, call ten lost prospects, or price a pilot differently. Define in advance what evidence would change your mind."],
      ["Create a quarterly challenge session", "Ask a person who was not involved in the original decision to challenge the givens behind your plan. Reward useful dissent. The purpose is not to undermine confidence; it is to prevent confidence from hardening into expensive blindness."]
    ],
    failures: ["Treating past success as permanent proof", "Asking questions that only confirm the preferred answer", "Collecting data without defining a decision", "Refusing to retire a tactic because of sunk cost"],
    faqs: [["Which assumptions are most dangerous?", "Assumptions about customer motivation, unit economics, differentiation, and team capacity have the greatest ability to distort an entire plan."], ["How much evidence is enough?", "Enough to make the next reversible decision. Use more evidence as the cost and irreversibility of the decision increase."], ["What if the team disagrees?", "Write the competing assumptions down and test them against the same success measure rather than resolving the issue through seniority or volume."]]
  },
  "phone-etiquette": {
    readTime: "10 min read",
    sections: [
      ["Engineer the first sixty seconds", "Answer with a clear company name, a calm pace, and a helpful next question. Confirm the caller's name and reason for calling. Avoid sounding rushed or forcing a prospect to repeat information. The goal is to make competence audible immediately."],
      ["Create standards for holds, transfers, and voicemail", "Ask permission before placing someone on hold, explain where a transfer is going, and provide a fallback if the connection fails. Voicemail should state when the caller can expect a response. Small courtesies prevent uncertainty from becoming distrust."],
      ["Coach from real conversations", "Review a small sample of calls for clarity, warmth, discovery, and next-step accuracy. Use coaching, not scripts alone. A rigid script can remove the judgment and humanity that make a conversation persuasive."]
    ],
    failures: ["Answering with an internal department name customers do not recognize", "Transferring without context", "Ending a call without confirming the next action", "Measuring call volume but not appointment or resolution quality"],
    faqs: [["Should every employee use the same script?", "Use a shared structure and required information, but allow natural language so employees can listen and respond intelligently."], ["How quickly should calls be returned?", "Set a promise the business can reliably keep. Same-business-day response is a strong baseline for most professional services."], ["Can phone quality affect marketing ROI?", "Absolutely. Advertising creates the opportunity; the call experience determines whether that opportunity becomes revenue."]]
  },
  "direct-mail": {
    readTime: "11 min read",
    sections: [
      ["Match the list, offer, and moment", "Direct mail succeeds when the recipient, reason, and timing align. A beautiful piece sent to a weak list will fail. Define the buying signal, geographic or customer criteria, and the action you want before choosing format or creative."],
      ["Design for the five-second scan", "The recipient should understand who it is for, why it matters, who sent it, and what to do next without reading every word. Use a strong headline, one visual hierarchy, specific proof, and a single dominant call to action."],
      ["Connect offline response to measurement", "Use a memorable landing page, dedicated phone number, QR code with campaign parameters, offer code, or matched customer list. Measure response, qualified leads, sales, revenue, and payback period. A response rate without economics is incomplete."]
    ],
    failures: ["Sending one drop and declaring the channel ineffective", "Using a generic offer for a broad purchased list", "Hiding the call to action in dense copy", "Failing to train the phone team on the campaign"],
    faqs: [["Does direct mail still work?", "Yes, particularly when the audience is identifiable, the offer has meaningful value, and the physical piece is coordinated with digital follow-up."], ["Postcard or letter?", "Use a postcard for immediate, simple offers and a letter when credibility, explanation, or a higher-consideration decision requires more space."], ["How many touches are needed?", "Plan a sequence rather than a single event. The right frequency depends on urgency, customer value, and how quickly the list changes."]]
  },
  "best-mascots": {
    readTime: "10 min read",
    sections: [
      ["Start with a strategic role", "Decide what the character must do: simplify a complex service, make a serious category approachable, signal local identity, or create continuity across campaigns. A mascot without a job becomes decoration."],
      ["Build a usable character system", "Define personality, vocabulary, expressions, poses, color rules, and situations the character should never enter. The system must work at favicon size, in social content, in print, and in motion without becoming unrecognizable."],
      ["Measure memory, not applause", "Track aided and unaided recall, branded search, direct traffic, engagement with character-led creative, and conversion quality. A mascot can earn attention while distracting from the offer, so measure whether people remember the business and promise, not only the character."]
    ],
    failures: ["Choosing a character because it is cute rather than strategically useful", "Changing the voice and appearance from campaign to campaign", "Letting humor undermine trust in a sensitive category", "Failing to protect usage rights and source files"],
    faqs: [["Does every business need a mascot?", "No. A mascot is useful when personality, memorability, or explanation is a genuine business need. A strong spokesperson or distinctive visual system may work better."], ["Can a professional service use one?", "Yes, if the tone remains credible and the character makes the service easier to understand rather than less serious."], ["Should a mascot be human, animal, or object?", "Choose the form that best supports the promise and audience. Distinctiveness and usability matter more than category convention."]]
  },
  "repeat-business": {
    readTime: "11 min read",
    sections: [
      ["Define the next logical purchase", "Do not leave the next engagement to chance. Map what a successful client usually needs thirty, ninety, and 180 days after the initial service. Present the next step as continuity of results, not an unrelated upsell."],
      ["Create a client memory system", "Record goals, preferences, milestones, concerns, and personal context in a usable CRM. Trigger meaningful follow-up based on the relationship and service cycle. Relevance beats frequent generic communication."],
      ["Measure retention economics", "Track repeat purchase rate, time to second purchase, customer lifetime value, referral rate, and churn reasons. Segment by service and acquisition source. The clients who are easiest to acquire are not always the clients who create the most durable value."]
    ],
    failures: ["Disappearing after the invoice is paid", "Sending the same follow-up to every customer", "Waiting for dissatisfaction before checking in", "Discounting repeatedly instead of increasing value and convenience"],
    faqs: [["When should we ask for another project?", "When the next need is clear and the first value has been demonstrated. Frame the conversation around the customer's objective and timing."], ["What is a healthy repeat rate?", "It varies by service cycle. Establish your baseline by cohort, then improve the time to second purchase and lifetime value."], ["How do referrals fit into retention?", "Satisfied repeat clients often become the strongest referral source because they have seen consistent delivery over time."]]
  }
};

function render(item) {
  const sections = item.sections.map(([heading, text]) => `<h2>${heading}</h2><p>${text}</p>`).join("\n");
  const failures = `<h2>Common mistakes that reduce ROI</h2><ul>${item.failures.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  const faq = `<h2>Frequently asked questions</h2><div class="article-faq">${item.faqs.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join("")}</div>`;
  const cta = `<div class="callout"><h4>Turn the idea into a measurable plan</h4><p>Strategic Marketing Advisors helps owners connect positioning, execution, and measurement so marketing produces better customers, not just more activity. <a href="../contact.html">Book a complimentary strategy conversation.</a></p></div>`;
  return `${sections}\n${failures}\n${faq}\n${cta}`;
}

for (const [slug, expansion] of Object.entries(expansions)) {
  const file = path.join(dir, `${slug}.json`);
  const article = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!article.body.includes("Common mistakes that reduce ROI")) article.body += `\n${render(expansion)}`;
  article.readTime = expansion.readTime;
  article.faqs = expansion.faqs.map(([question, answer]) => ({ question, answer }));
  fs.writeFileSync(file, `${JSON.stringify(article, null, 2)}\n`);
  console.log(`Expanded ${slug}`);
}
