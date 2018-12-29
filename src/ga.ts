declare function gtag(...args: any[]): void;

const GA_TRACKING_ID = 'UA-64222989-2';

export type Page = 'loading' | 'title' | 'home' | 'battle';

export function pageView(page: Page) {
  gtag('config', GA_TRACKING_ID, {
    page_title: page,
  });
}
