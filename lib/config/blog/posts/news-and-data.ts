import type { BlogPost } from '../types'

export const newsAndData: BlogPost[] = [
  {
    slug: 'how-much-americans-spend-on-subscriptions',
    topics: ['data', 'money'],
    title: 'How much do Americans spend on subscriptions? (2025 survey)',
    description:
      'How much do Americans spend on subscriptions? A 2025 CNET survey puts it at about $1,080 a year - with roughly $200 of that wasted on services they barely use.',
    publishedAt: '2026-06-24',
    updatedAt: '2026-09-02',
    subscriptionEra: true,
    landingTitle: 'People waste ~$200/yr on subscriptions they never use',
    landingBlurb:
      'Based on a survey, the average American spends $1,080 a year on subscriptions and barely touches $200 of it.',
    source: 'CNET',
    sourceLogo: '/sources_logos/cnet.svg',
    sourceUrl: 'https://www.cnet.com/tech/services-and-software/subscription-survey-2025/',
    readingTimeMin: 6,
    intro:
      'The average American spends around $1,080 a year on subscriptions, and roughly $205 of that goes to services they rarely or never use. Those figures come from a 2025 CNET survey, and they line up with a feeling most people already have: the small monthly charges add up to a lot more than expected.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'What is the best free app to track subscriptions?',
      'How do renewal reminders work?',
    ],
    faq: [
      {
        question: 'How much does the average American spend on subscriptions per year?',
        answer:
          'About $1,080 a year - roughly $90 a month - according to the 2025 CNET survey conducted with YouGov, which covered 2,440 Americans of whom 1,932 had paid for at least one subscription in the previous year. Around $205 of that annual total goes to services the respondents said they rarely or never use.',
      },
      {
        question: 'Which subscription categories do most people pay for?',
        answer:
          'Streaming video leads by a wide margin at 61% of respondents, followed by e-commerce memberships such as Amazon Prime and Walmart+ at 37%, and streaming music at 33%. Because each renews on its own schedule, these three are rarely reviewed together - which is how the combined total climbs without any single decision to spend more.',
      },
      {
        question: 'Are people actually cancelling subscriptions, or just saying they will?',
        answer:
          'Both. In the CNET survey, 61% of respondents said they were reconsidering at least one subscription and one in four said they had already cancelled one. The appetite to cut is clearly there; what most people lack is a complete list of what they are paying for in the first place.',
      },
    ],
    relatedSlugs: ['how-to-save-money-fast', 'subscription-fatigue', 'how-to-cancel-subscriptions'],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: According to a 2025 CNET survey conducted with YouGov, the average American spends about $90 a month - roughly $1,080 a year - on subscriptions, and around $17 of that monthly total (about $205 a year) goes to services they barely touch. Streaming video is the most common category, and most people underestimate their own total until they add it up.',
      },
      {
        type: 'p',
        text: 'It is easy to dismiss any single subscription as a few dollars a month. The problem is that almost nobody has just one. CNET surveyed 2,440 Americans in 2025 in partnership with YouGov, of whom 1,932 had paid for at least one subscription in the past year, and the results put a hard number on a soft, creeping cost most households never sit down to total. The figures below are drawn from that survey.',
      },
      {
        type: 'h2',
        text: 'What Americans Actually Spend',
      },
      {
        type: 'p',
        text: 'The headline numbers are larger than most people guess for themselves. When CNET asked respondents to account for everything they pay for on a recurring basis, the averages came out like this:',
      },
      {
        type: 'table',
        table: {
          caption: 'Average American subscription spending, CNET/YouGov 2025',
          rowHeaders: true,
          headers: ['What', 'Per month', 'Per year'],
          rows: [
            ['All subscriptions', '~$90', '~$1,080'],
            ['Subscriptions rarely or never used', '~$17', '~$205'],
          ],
        },
      },
      {
        type: 'p',
        text: 'That last figure is the one worth pausing on. Over $200 a year, for most people, is money leaving the account every month for something that delivers no value - not because of a single bad decision, but because forgotten subscriptions quietly renew in the background.',
      },
      {
        type: 'h2',
        text: 'Where the Money Goes',
      },
      {
        type: 'p',
        text: 'The survey also mapped which categories dominate household subscription budgets. Streaming led by a wide margin, but the long tail of e-commerce memberships and music services adds up:',
      },
      {
        type: 'table',
        table: {
          caption: 'Most common subscription categories, by share of respondents',
          rowHeaders: true,
          headers: ['Category', 'Share of respondents'],
          rows: [
            ['Streaming video', '61%'],
            ['E-commerce memberships (Amazon Prime, Walmart+)', '37%'],
            ['Streaming music', '33%'],
          ],
        },
      },
      {
        type: 'p',
        text: 'These three categories alone explain a large share of the monthly total, and because each one auto-renews on its own schedule, they are rarely reviewed together. That is precisely how the bill creeps upward without any single moment where someone decided to spend more.',
      },
      {
        type: 'h2',
        text: 'People Are Already Cutting Back',
      },
      {
        type: 'p',
        text: 'The CNET survey found that subscription fatigue is translating into action. With economic pressure on household budgets, 61% of respondents said they were reconsidering at least one subscription, and one in four said they had already cancelled one. The appetite to trim is clearly there - what most people lack is a clear, complete picture of what they are paying for in the first place.',
      },
      {
        type: 'h2',
        text: 'How to Audit Your Own Subscriptions',
      },
      {
        type: 'p',
        text: 'The survey numbers are averages, but the only ones that matter are yours. A short audit usually surfaces at least one or two charges worth cutting. Work through it in order:',
      },
      {
        type: 'ol',
        items: [
          'List every recurring charge you have - check email receipts and bank statements, or use a tracker so nothing slips through',
          'Convert each one to a monthly cost and add them up to get your real total',
          'For each subscription ask: did I actually use this in the last 30 days?',
          'For the ones you did not: will I realistically use it in the next 30 days?',
          'Cancel everything that fails both questions',
        ],
      },
      {
        type: 'callout',
        text: 'Be honest at step 3. "I might watch it one day" is not the same as using a service. If it sat untouched for a month, it will probably sit untouched for the next one - and that is exactly the $205-a-year category the CNET survey identified.',
      },
      {
        type: 'h2',
        text: 'Stop Paying for the Ones You Forgot',
      },
      {
        type: 'p',
        text: 'The reason these costs accumulate is that each subscription is forgettable on its own. The fix is a single live list of every service, what it costs, and when it renews - so the total is always visible and every renewal is a conscious choice rather than a surprise charge. Suprascribe is free for manual tracking with no bank access required. The Pro upgrade adds automatic email discovery to surface subscriptions you have forgotten, plus renewal reminders that email you before each charge so you can decide to keep or cancel in time.',
      },
      {
        type: 'callout',
        text: 'Suprascribe Pro is a one-time payment, not another monthly fee. You should not have to pay a recurring subscription just to keep your other recurring subscriptions under control.',
      },
    ],
  },
  {
    slug: 'car-feature-subscriptions',
    topics: ['data', 'policy'],
    title: 'Car feature subscriptions: BMW dropped the heated seat fee, not the model',
    description:
      'Car feature subscriptions arrived when BMW charged £15 a month to switch on heated seats already fitted to your car. It backed down on that one - and stayed committed to selling car features after you have bought the car.',
    publishedAt: '2026-07-16',
    updatedAt: '2026-09-02',
    subscriptionEra: true,
    landingTitle: 'Even your car is becoming a subscription',
    landingBlurb:
      'BMW dropped the £15 a month heated seat fee. It did not drop the model - and the rest of the industry is heading the same way.',
    source: 'BBC',
    sourceLogo: '/sources_logos/bbc.svg',
    sourceUrl: 'https://www.bbc.com/news/technology-62142208',
    readingTimeMin: 6,
    intro:
      'BMW once offered UK drivers a £15 per month subscription to turn on the heated front seats already fitted to their cars. That specific fee is gone - the backlash worked. What did not go anywhere is the business model behind it, and BMW is far from the only manufacturer committed to it.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'How do I cancel a subscription I forgot about?',
    ],
    faq: [
      {
        question: 'Does BMW still charge a subscription for heated seats?',
        answer:
          'No. BMW withdrew the \u00a315-a-month UK heated-seat fee after the backlash, and heated seats are not sold as a subscription today. What it did not withdraw is the ConnectedDrive store behind it - BMW told The Drive it remains "fully committed" to selling features after a car has been purchased.',
      },
      {
        question: 'Which car features are commonly sold as subscriptions?',
        answer:
          'Tesla moved Full Self-Driving from a one-time upgrade to a subscription, GM has charged OnStar membership fees since the mid-1990s, and most manufacturers now bill monthly for semi-autonomous driving software after a free trial. Infotainment and concierge add-ons are going the same way across the industry.',
      },
      {
        question: "Why don't car subscriptions show up when I check my subscriptions?",
        answer:
          'Because they are billed by the manufacturer, not through an app store. They never appear in your Apple or Google Play subscription lists - the two places most people check - and they are often charged annually or bundled into a manufacturer account, so they skip a three-month statement scan too. They are also attached to a purchase you mentally filed as finished, so you are not looking for them.',
      },
    ],
    relatedSlugs: [
      'subscription-fatigue',
      'how-much-americans-spend-on-subscriptions',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: BMW charged UK drivers £15 per month to activate heated front seats that were already installed in the car, sold through its ConnectedDrive online store. After the backlash it dropped that fee - heated seats are not a subscription any more. But BMW told The Drive it remains "fully committed" to selling features after purchase through the same platform, and anything requiring a data package will likely carry a recurring charge. Tesla has moved Full Self-Driving to a subscription, GM has billed for OnStar since the 1990s, and most semi-autonomous driving software now comes with a monthly fee.',
      },
      {
        type: 'p',
        text: 'A car used to be the clearest example of a thing you buy once. You pay, you own it, the hardware is yours. That assumption is quietly being unwound. The hardware still ships in the vehicle - the question is now whether you are allowed to use it without a monthly payment.',
      },
      {
        type: 'h2',
        text: 'The Fee That Made Everyone Notice',
      },
      {
        type: 'p',
        text: 'BMW offered UK owners a £15 per month subscription to switch on their heated front seats, activated remotely through the ConnectedDrive online store with no dealer visit needed. The seats, the elements, the wiring - all of it shipped in the car regardless. As The Verge put it at the time, owners already had every necessary component, and BMW had simply placed a software block on the functionality that buyers then paid to remove. The Register was blunter: it may feel like buying a mug and having to rent the handle.',
      },
      {
        type: 'p',
        text: 'BMW told the BBC that "where heated seats, or any feature available in the ConnectedDrive store have been purchased when a customer vehicle is ordered, no subsequent subscription or payment is necessary", and framed the store as flexibility - owners who change their minds after purchase can add features later, second-hand buyers can add features the original owner did not choose, and short-term trials let you test before committing.',
      },
      {
        type: 'p',
        text: 'The objection was never really about £15. It was about what the charge implies - that a switch physically present in something you own can be disabled at the factory and rented back to you. Kurt Opsahl, then general counsel of the Electronic Frontier Foundation, put it as a repair question: a seat heater blocked by software is broken, and the owner should have the right to fix their seats.',
      },
      {
        type: 'h2',
        text: 'BMW Dropped the Fee, Not the Model',
      },
      {
        type: 'p',
        text: 'The backlash worked, in the narrow sense. BMW backed down on heated seats, and they are not sold as a subscription today. It is tempting to file that away as a win. It was not, really - what got withdrawn was the single example that made the model impossible to ignore, not the model itself.',
      },
      {
        type: 'p',
        text: 'BMW has been explicit about that. "BMW remains fully committed to the ConnectedDrive environment as an essential part of the global BMW Aftersales strategy," a spokesperson told The Drive. "With these established digital offerings, we offer our customers even more comfort and flexibility in line with their individual wishes after they purchase a vehicle. This allows customers to opt for additional functions and services retroactively."',
      },
      {
        type: 'p',
        text: '"Retroactively" is doing a lot of work in that sentence. It means the feature set of your car is no longer settled at the point of sale - it stays open, indefinitely, as a place to sell you something. And the dividing line BMW now works to is a practical one: if a feature needs a data connection of some kind, it will probably carry a recurring fee. BMW says its customers are already comfortable subscribing to that sort of add-on.',
      },
      {
        type: 'p',
        text: 'That is the shape the model settled into everywhere. Physical hardware held behind a paywall produces an obvious moment of outrage. Data-dependent and connected features do not, because there is no switch you can point at and say you already paid for it. The charge just appears, and it keeps appearing.',
      },
      {
        type: 'h2',
        text: 'It Is Not Just BMW',
      },
      {
        type: 'p',
        text: 'Treating this as one company misreading its customers misses the pattern. Manufacturers and dealers have always made money after the sale, mostly through maintenance - and electric cars need far less of it. Recurring software revenue is what fills that gap, which is why the direction is industry-wide:',
      },
      {
        type: 'table',
        table: {
          caption: 'Car features sold as subscriptions',
          rowHeaders: true,
          headers: ['Carmaker', 'What became a subscription'],
          rows: [
            ['BMW', 'Heated front seats, £15/month in the UK - later withdrawn'],
            ['Tesla', 'Full Self-Driving, previously sold as a one-time upgrade'],
            ['GM', 'OnStar membership fees, since the mid-1990s'],
            ['Most manufacturers', 'Semi-autonomous driving software, usually after a free trial'],
            ['Across the industry', 'Infotainment and concierge add-ons'],
          ],
        },
      },
      {
        type: 'p',
        text: 'When every major player moves the same way, opting out stops being a choice you make between brands. It becomes a condition of buying a car at all.',
      },
      {
        type: 'h2',
        text: 'What This Means for Your Monthly Total',
      },
      {
        type: 'p',
        text: 'The practical problem is not the price of any one car feature. It is that recurring charges are now arriving from categories that never had them, and those charges are much harder to see than the ones you are used to.',
      },
      {
        type: 'ul',
        items: [
          'Car feature subscriptions do not appear in your Apple or Google Play subscription list - the two places most people think to check',
          'They are often billed annually or bundled into a manufacturer account, so they skip the monthly statement scan entirely',
          'They are attached to a purchase you mentally filed as finished years ago, so you are not looking for them',
          'The same logic is spreading to appliances, software and hardware you assumed you owned outright',
        ],
      },
      {
        type: 'p',
        text: 'This is how subscription creep actually works. Nobody sits down and decides to spend more every month. The total rises because each individual charge is small, defensible, and invisible from wherever you happen to be looking.',
      },
      {
        type: 'h2',
        text: 'Get the Full Picture Back',
      },
      {
        type: 'p',
        text: 'You cannot opt out of an industry-wide shift in how products are sold. You can refuse to lose track of what it is costing you. The defence is the same as it has always been: one live list of every recurring charge, what it costs, and when it renews - so that each renewal is a decision you make rather than a line you discover later. Suprascribe is free for manual tracking with no bank access required. The Pro upgrade scans your inbox for the charges you have forgotten, including the ones that never show up in an app store, and reminds you before each renewal.',
      },
      {
        type: 'callout',
        text: 'Suprascribe will never be a subscription. Pro is a one-time payment - because paying a monthly fee to keep track of your monthly fees is exactly the problem, not the fix.',
      },
    ],
  },
  {
    slug: 'netflix-price-increase-2026',
    topics: ['data', 'streaming'],
    title: 'The Netflix price increase in 2026: every plan went up again',
    description:
      'The Netflix price increase of March 2026 raised every US plan, the second hike in under two years. Here are the new prices and what repricing means for your subscription total.',
    publishedAt: '2026-07-16',
    updatedAt: '2026-09-02',
    subscriptionEra: true,
    landingTitle: 'The price you signed up for was never the price',
    landingBlurb:
      'Netflix raised every US plan in March 2026 - the second hike in under two years. Each rise is small enough to ignore.',
    source: 'CNBC',
    sourceLogo: '/sources_logos/cnbc.svg',
    sourceUrl:
      'https://www.cnbc.com/2026/03/26/netflix-raises-prices-across-all-streaming-plans.html',
    readingTimeMin: 5,
    intro:
      'In March 2026 Netflix raised the price of every single US plan - the second increase in under two years. The number you agreed to when you signed up was never a fixed price. It was a starting point, and it moves without you.',
    faqQuestions: [
      'How do renewal reminders work?',
      'How do I cancel a subscription I forgot about?',
    ],
    faq: [
      {
        question: 'What are the new Netflix prices after the March 2026 increase?',
        answer:
          'Standard with Ads went from $7.99 to $8.99, Standard from $17.99 to $19.99, and Premium from $24.99 to $26.99. The new rates applied to new subscribers from 26 March 2026; existing subscribers were notified ahead of their own billing cycles, so the charge landed at a different time for almost everyone.',
      },
      {
        question: 'How often does Netflix raise its prices?',
        answer:
          'The March 2026 increase was the second in under two years, following one in early 2025. There is no fixed schedule - the point is that a subscription is an open-ended agreement that can be repriced while you are inside it, and the default runs toward paying the new price unless you act.',
      },
      {
        question: 'What should I do when a subscription raises its price?',
        answer:
          'Treat the notification as the decision point it is meant not to be. Ask one question: would you sign up today at the new price? If the answer is no, cancel - a price rise is the natural moment to re-evaluate, which is exactly why the email announcing it is written to be forgettable.',
      },
    ],
    relatedSlugs: [
      'how-to-cancel-netflix-subscription',
      'how-much-americans-spend-on-subscriptions',
      'subscription-fatigue',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: On 26 March 2026 Netflix raised the price of every US plan. Standard with Ads went from $7.99 to $8.99, Standard from $17.99 to $19.99, and Premium from $24.99 to $26.99. The new rates applied to new subscribers immediately, with existing subscribers notified ahead of their billing cycles. It is the second increase in under two years, following one in early 2025.',
      },
      {
        type: 'p',
        text: 'Nobody cancels over two dollars. That is precisely why this works. A price rise small enough to shrug at, applied to a service you have already integrated into your evenings, is not a decision point - it is a notification you skim and forget. Repeat that across every subscription you hold and the arithmetic stops being trivial.',
      },
      {
        type: 'diagram',
        diagram: {
          kind: 'timeline',
          alt: 'Netflix raised US prices in early 2025 and again on 26 March 2026. Existing subscribers were charged the new rate from their own next billing date, which falls at a different time for almost everyone.',
          caption:
            'Two increases in under two years, each arriving as a notification rather than a decision.',
          data: {
            events: [
              { date: 'Early 2025', label: 'The previous price increase' },
              {
                date: '26 March 2026',
                label: 'New prices take effect for new subscribers',
                detail: 'Every tier moved, including the ad-supported one.',
              },
              {
                date: 'Your next billing date',
                label: 'Existing subscribers start paying the new rate',
                detail:
                  'Notified in advance of their own cycle, so the charge lands at a different time for almost everyone.',
                emphasis: true,
              },
            ],
          },
        },
      },
      {
        type: 'h2',
        text: 'The New Prices',
      },
      {
        type: 'p',
        text: 'Every tier moved, including the ad-supported one that was introduced as the affordable option:',
      },
      {
        type: 'table',
        table: {
          caption: 'US Netflix prices before and after 26 March 2026',
          rowHeaders: true,
          headers: ['Plan', 'Old price', 'New price', 'Change'],
          rows: [
            ['Standard with Ads', '$7.99', '$8.99', '+$1'],
            ['Standard (no ads, 2 devices)', '$17.99', '$19.99', '+$2'],
            ['Premium (no ads, 4 devices, Ultra HD)', '$24.99', '$26.99', '+$2'],
          ],
        },
      },
      {
        type: 'p',
        text: 'The changes took effect for new users on 26 March 2026. Existing subscribers were notified in advance of their own billing cycles, which means the charge landed at a different time for almost everyone - and rarely at a moment when anyone was thinking about it.',
      },
      {
        type: 'h2',
        text: 'Twice in Two Years',
      },
      {
        type: 'p',
        text: 'This was the second Netflix price increase in less than two years, following an adjustment in early 2025. That cadence is the part worth noticing. A subscription is not a purchase with a price; it is an open-ended agreement that can be repriced while you are inside it.',
      },
      {
        type: 'p',
        text: 'Compare it to buying anything else. If a product costs more next year, you decide whether to buy it at the new price. With a subscription the default runs the other way: the new price is charged unless you take action to stop it. Inertia is not a side effect of the model. It is the business case.',
      },
      {
        type: 'h2',
        text: 'Why This Keeps Happening',
      },
      {
        type: 'p',
        text: 'Netflix has been spending heavily on content, expanding into live events and video podcasts, and is expected to spend roughly $20 billion on content in 2026. Those are real costs, and the price rise is a coherent response to them.',
      },
      {
        type: 'p',
        text: 'But the reasoning matters less than the structure. As long as revenue can be raised by adjusting a number that millions of people have already agreed to pay indefinitely, that number will keep being adjusted. Every subscription service you hold faces the same incentive, and most of them will act on it.',
      },
      {
        type: 'h2',
        text: 'The Compounding Problem',
      },
      {
        type: 'p',
        text: 'A $2 rise on one service is genuinely nothing. That is the whole trick. You are not holding one service - you are holding a dozen, each raising prices on its own schedule, each individually too small to trigger a reaction.',
      },
      {
        type: 'p',
        text: 'A few dollars a month across a dozen services is a few hundred dollars a year, and it arrives without a single moment where anyone chose to spend more. This is the same mechanism behind the roughly $205 a year that the average American spends on subscriptions they barely use - small amounts, invisible individually, significant in aggregate.',
      },
      {
        type: 'h2',
        text: 'What to Do About It',
      },
      {
        type: 'p',
        text: 'You cannot stop services from repricing. You can make sure a price rise reaches you as a decision instead of a statement line you notice months later:',
      },
      {
        type: 'ol',
        items: [
          'List every recurring charge you have, with its current price - not the price you remember signing up at',
          'Add them up. The total is almost always higher than the number in your head',
          'For each one, ask whether you would sign up today at the price you are now paying',
          'Set a reminder before each renewal date so the charge arrives as a choice, not a surprise',
          'Cancel anything that failed step three - a price rise is the natural moment to re-evaluate, which is exactly why the notification is designed to be forgettable',
        ],
      },
      {
        type: 'p',
        text: 'Suprascribe is free for manual tracking, with no bank access required. The Pro upgrade scans your inbox to surface the subscriptions you have forgotten and sends renewal reminders before each charge, so repricing gets caught at the moment you can still do something about it.',
      },
      {
        type: 'callout',
        text: 'Suprascribe Pro is a one-time payment and will never be a subscription. Your price will not quietly go up in two years, because there is no recurring price to raise.',
      },
    ],
  },
  {
    slug: 'ftc-click-to-cancel-rule-2026',
    topics: ['policy', 'cancel'],
    title: 'The FTC "Click-to-Cancel" rule in 2026: what protects you now',
    description:
      'The FTC’s Click-to-Cancel rule was finalized, struck down, and revived. Here is where it actually stands in 2026 and how to force a cancellation a company is stalling.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-09-02',
    source: 'FTC',
    sourceUrl:
      'https://www.ftc.gov/news-events/news/press-releases/2024/10/federal-trade-commission-announces-final-click-cancel-rule-making-it-easier-consumers-end-recurring',
    readingTimeMin: 6,
    intro:
      'The idea behind Click-to-Cancel is simple and hard to argue with: cancelling should be as easy as signing up. The rule to enforce that was finalized, then struck down before it ever took effect, and is now being revived. Here is what it means for you in 2026 - and what actually protects you today.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    faq: [
      {
        question: 'Is the FTC Click-to-Cancel rule in effect in 2026?',
        answer:
          "Not as a standalone rule. The FTC finalized it in October 2024, a federal appeals court vacated it in 2025 before enforcement began, and in March 2026 the FTC restarted the process with an Advance Notice of Proposed Rulemaking. The protections that do apply today come from ROSCA, the FTC's general authority over unfair and deceptive practices, and state auto-renewal laws.",
      },
      {
        question: 'Why was the Click-to-Cancel rule struck down?',
        answer:
          'On procedural grounds, not on the merits. The court found the FTC had skipped a required economic-impact analysis. It did not rule that companies are entitled to obstructive cancellation flows - which is why the FTC was able to restart the process with the analysis the court demanded.',
      },
      {
        question: 'What can I do if a company refuses to let me cancel?',
        answer:
          'Put it in writing. Email a dated cancellation request citing the FTC Negative Option Rule (16 CFR Part 425) and your state auto-renewal law, state that you are revoking authorization for future charges from that date, and keep every reply. If charges continue, dispute them with your card issuer and attach the written request, then report the company at reportfraud.ftc.gov and to your state attorney general.',
      },
    ],
    relatedSlugs: [
      'how-to-cancel-subscriptions',
      'how-much-americans-spend-on-subscriptions',
      'car-feature-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: The FTC finalized the Click-to-Cancel rule in October 2024, but a federal appeals court vacated it in 2025 before enforcement began, on procedural grounds. In March 2026 the FTC began the process of reviving it. It is not currently enforceable as a standalone rule - but ROSCA, the FTC’s deceptive-practices authority, and state auto-renewal laws still protect you.',
      },
      {
        type: 'p',
        text: 'You have almost certainly hit the pattern the rule was written to kill: a service you signed up for in two clicks that suddenly requires a phone call, a retention agent, and a "call during business hours" wall to leave. Click-to-Cancel was the federal answer to that. Its bumpy path tells you a lot about the state of subscription regulation.',
      },
      {
        type: 'h2',
        text: 'What the Rule Was Meant to Do',
      },
      {
        type: 'p',
        text: 'The core principle was symmetry: cancelling had to be at least as easy as signing up. If you could subscribe online without talking to anyone, you had to be able to cancel the same way - no phone-only cancellation, no maze of retention screens, no hidden cancel page. It also required clear consent and upfront disclosure of terms before billing.',
      },
      {
        type: 'h2',
        text: 'The Timeline: Finalized, Vacated, Revived',
      },
      {
        type: 'diagram',
        diagram: {
          kind: 'timeline',
          alt: 'The Click-to-Cancel rule was finalized in October 2024, vacated by a federal appeals court in 2025 on procedural grounds before enforcement began, and revived by the FTC in March 2026 with an Advance Notice of Proposed Rulemaking.',
          data: {
            events: [
              {
                date: 'October 2024',
                label: 'The FTC finalizes Click-to-Cancel',
                detail: 'An amendment to the Negative Option Rule.',
              },
              {
                date: '2025',
                label: 'A federal appeals court vacates it',
                detail:
                  'Before enforcement began, on the grounds that the FTC skipped a required economic-impact analysis - a procedural defect, not a rejection of the idea.',
                emphasis: true,
              },
              {
                date: 'March 2026',
                label: 'The FTC restarts the process',
                detail:
                  'An Advance Notice of Proposed Rulemaking, with the analysis the court demanded.',
              },
            ],
          },
        },
      },
      {
        type: 'callout',
        text: 'The rule falling was procedural, not philosophical. The court did not say companies are allowed to trap you - it said the FTC had to show its economic homework first.',
      },
      {
        type: 'h2',
        text: 'What Protects You Right Now',
      },
      {
        type: 'p',
        text: 'Even without Click-to-Cancel in force, you are not unprotected. Several overlapping rules still apply:',
      },
      {
        type: 'table',
        table: {
          caption: 'What still protects you without Click-to-Cancel in force',
          rowHeaders: true,
          headers: ['What applies', 'What it covers'],
          rows: [
            ['ROSCA', 'Online negative-option sign-ups: clear disclosure and simple cancellation'],
            [
              'FTC authority over unfair and deceptive practices',
              'Deliberately obstructive cancellation flows',
            ],
            [
              'State auto-renewal laws (California, New York, Illinois)',
              'Sometimes stricter than the federal rule; require easy online cancellation',
            ],
          ],
        },
      },
      {
        type: 'h2',
        text: 'How to Force a Cancellation a Company Is Stalling',
      },
      {
        type: 'p',
        text: 'If a service is making it deliberately hard to leave, put it in writing. A formal cancellation request that cites the relevant rules tends to move faster than a support-chat loop:',
      },
      {
        type: 'ol',
        items: [
          'Email a clear, dated cancellation request that references the FTC Negative Option Rule (16 CFR Part 425) and your state auto-renewal law',
          'State that you are revoking authorization for any future charges as of that date',
          'Keep every reply and a copy of your request',
          'If charges continue, dispute them with your bank or card issuer and attach your written cancellation',
          'Report the company to the FTC at reportfraud.ftc.gov and your state attorney general',
        ],
      },
      {
        type: 'h2',
        text: 'The Real Lesson',
      },
      {
        type: 'p',
        text: 'The takeaway is not that the law will save you on a predictable schedule - it is that "easy to cancel" is still not guaranteed, so the burden of noticing stays with you. The subscriptions that cost you the most are the ones you forgot you had, because you never reach the cancellation flow at all. Regulation cannot fix what you are not tracking.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual subscription tracking - no bank access required. Pro scans your inbox to surface the subscriptions you have forgotten and reminds you before each renewal, as a one-time payment. The best defence against a hard cancellation is knowing the charge exists before it renews.',
      },
    ],
  },
]
