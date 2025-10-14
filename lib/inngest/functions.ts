import { getAllUsersForNewsEmail, UserForNewsEmail } from "../actions/user.actions";
import { sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { getNews } from "../actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";

export const sendSignUpEmail = inngest.createFunction(
    {id: 'sign-up-email'},
    {event: 'app/user.created'},
    async ({event, step}) => {
        const userProfile = `
        - Country: ${event.data.country}
        - Investment Goals: ${event.data.investmentGoals}
        - Risk Tolerance: ${event.data.riskTolerance}
        - Preferred Industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);

        const response = await step.ai.infer('generate-welcome-intro',{
            model:step.ai.models.gemini({model:"gemini-2.5-flash-lite"}),
                body: {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {text: prompt}
                            ]
                        }]
                }
            })

        await step.run('send-welcome-email', async()=>{
            const part=response.candidates?.[0]?.content?.parts?.[0];
            const introText=(part && 'text' in part ? part.text: null) || 'Thanks for joining StockSage! We are excited to have you on board.';

            const {data: {email,name}}=event;
            return await sendWelcomeEmail({
                email,
                name,
                intro: introText
            });
        })

        return {
            success: true,
            message: "Welcome email sent successfully!!",
        }
    }
);

export const sendDailyNewsSummary = inngest.createFunction(
    {id: 'daily-news-summary'},
    [
        {event: 'app/send.daily.news'},
        {cron: '0 12 * * *'}],

        async ({step}) => {
            const users = await step.run('get-all-users', getAllUsersForNewsEmail)

            if(!users || users.length===0) return {success: false, message: 'No users found for news email'};

        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });



        const userNewsSummaries: {user: User; newsContent: string | null}[]=[];

        for (const {user, news} of results as Array<{user: User; news: MarketNewsArticle[]}>) {
            try{
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(news, null, 2));

                const response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({
                        model: 'gemini-2.5-flash-lite'
                    }),
                    body: {
                        contents: [{ role: 'user', parts: [{text: prompt}]}]
                    }
                });
                
                const part=response.candidates?.[0]?.content?.parts?.[0];

            } catch(e) {
                console.error('Failed to summarize news for: ', user.email);
                userNewsSummaries.push({user, newsContent: null})
            }
        }
    
    }
)