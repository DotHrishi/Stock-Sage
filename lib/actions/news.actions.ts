'use server'



export interface NewsArticle {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export const getMarketNews = async (limit = 8, page = 1): Promise<NewsArticle[]> => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY || "6dbd004eb6d64ec1a98f39663945e410"
            if (!apiKey) {
                console.error("NewsAPI key is missing")
                return []
            }

            // Fetch top business headlines with pagination
            const res = await fetch(`https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=${limit}&page=${page}&apiKey=${apiKey}`, {
                next: { revalidate: 300 } // Cache for 5 minutes
            })

            if (!res.ok) {
                console.error("Failed to fetch market news from NewsAPI:", res.statusText)
                return []
            }

            const data = await res.json()
            
            if (data.status !== 'ok' || !data.articles) {
                return []
            }
            
            const articles: NewsArticle[] = data.articles.map((article: any, index: number) => ({
                category: 'general',
                datetime: new Date(article.publishedAt).getTime() / 1000,
                headline: article.title ? article.title.replace(/\s+-\s+[^-]+$/, '') : '',
                id: index,
                image: article.urlToImage || '',
                related: '',
                source: article.source?.name || 'News',
                summary: article.description || '',
                url: article.url
            }));

            // Filter out empty headlines and slice
            return articles.filter(article => article.headline && article.headline !== '[Removed]').slice(0, limit)
        } catch (error) {
            console.error("Error fetching market news:", error)
            return []
        }
    }

export const getCompanyNews = async (symbol: string, limit = 5): Promise<NewsArticle[]> => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY || "6dbd004eb6d64ec1a98f39663945e410"
            if (!apiKey) {
                console.error("NewsAPI key is missing")
                return []
            }

            // Extract the base symbol/name without suffixes like .NS for a better search query
            const query = symbol.replace(/\.[A-Z]+$/, '');
            
            // NewsAPI date range: last 7 days
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(toDate.getDate() - 7);
            const to = toDate.toISOString().split('T')[0];
            const from = fromDate.toISOString().split('T')[0];

            const url = `https://newsapi.org/v2/everything?q=${query}&from=${from}&to=${to}&sortBy=relevancy&language=en&apiKey=${apiKey}`;

            const res = await fetch(url, {
                next: { revalidate: 300 } // Cache for 5 minutes
            })

            if (!res.ok) {
                console.error(`Failed to fetch company news for ${symbol} from NewsAPI:`, res.statusText)
                return []
            }

            const data = await res.json()
            
            if (data.status !== 'ok' || !data.articles) {
                return []
            }

            // Map NewsAPI format to our universal NewsArticle interface
            const articles: NewsArticle[] = data.articles.map((article: any, index: number) => ({
                category: 'company',
                datetime: new Date(article.publishedAt).getTime() / 1000,
                headline: article.title ? article.title.replace(/\s+-\s+[^-]+$/, '') : '',
                id: index,
                image: article.urlToImage || '',
                related: symbol,
                source: article.source?.name || 'News',
                summary: article.description || '',
                url: article.url
            }));
            
            // Filter out removed or empty articles and slice to limit
            return articles.filter(article => article.headline && article.headline !== '[Removed]').slice(0, limit)
        } catch (error) {
            console.error(`Error fetching company news for ${symbol}:`, error)
            return []
        }
    }
