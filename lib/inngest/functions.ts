import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompts";
import { getNews } from "../actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getFormattedTodayDate } from "../utils";

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
        - Country: ${event.data.country}
        - Investment Goals: ${event.data.investmentGoals}
        - Risk Tolerance: ${event.data.riskTolerance}
        - Preferred Industry: ${event.data.preferredIndustry}
        `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining StockSage! We are excited to have you on board.";

      const {
        data: { email, name },
      } = event;
      return await sendWelcomeEmail({
        email,
        name,
        intro: introText,
      });
    });

    return {
      success: true,
      message: "Welcome email sent successfully!!",
    };
  }
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],

  async ({ step }) => {
    console.log("Starting daily news summary function...");

    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    console.log(`Found ${users?.length || 0} users for news email`);

    if (!users || users.length === 0) {
      console.log("No users found, exiting function");
      return { success: false, message: "No users found for news email" };
    }

    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{ user: User; articles: MarketNewsArticle[] }> = [];
      for (const user of users as User[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);

          articles = (articles || []).slice(0, 6);

          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }
          perUser.push({ user, articles });
        } catch (e) {
          console.error("daily-news: error preparing user news", user.email, e);
          perUser.push({ user, articles: [] });
        }
      }
      return perUser;
    });

    const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

    for (const { user, articles } of results as Array<{
      user: User;
      articles: MarketNewsArticle[];
    }>) {
      try {
        console.log(
          `Processing news for user: ${user.email}, articles count: ${articles.length}`
        );

        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2)
        );

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({
            model: "gemini-2.5-flash-lite",
          }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent = (part && "text" in part ? part.text : null) || null;

        console.log(
          `Generated news content for ${user.email}: ${newsContent ? "SUCCESS" : "FAILED"
          }`
        );

        userNewsSummaries.push({ user, newsContent });
      } catch (e) {
        console.error("Failed to summarize news for: ", user.email, e);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }

    await step.run("send-news.email", async () => {
      console.log(
        `Attempting to send emails to ${userNewsSummaries.length} users`
      );

      const emailResults = await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) {
            console.log(`No news content for user: ${user.email}`);
            return false;
          }

          try {
            console.log(`Sending email to: ${user.email}`);
            await sendNewsSummaryEmail({
              email: user.email,
              date: getFormattedTodayDate(),
              newsContent,
            });
            console.log(`Email sent successfully to: ${user.email}`);
            return true;
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
            return false;
          }
        })
      );

      const successCount = emailResults.filter(Boolean).length;
      console.log(
        `Successfully sent ${successCount} out of ${userNewsSummaries.length} emails`
      );

      return true;
    });

    return {
      success: true,
      messege: "Daily news summary emails sent successfully!",
    };
  }
);
