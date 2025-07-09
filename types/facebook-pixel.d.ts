declare const fbq: {
  (
    event: 'track', 
    eventName: string, 
    parameters?: {
      value?: number;
      currency?: string;
      contents?: Array<{
        id: string | number;
        quantity: number;
        item_price: number;
      }>;
      content_ids?: (string | number)[];
      content_type?: string;
    },
    options?: { eventID?: string }
  ): void;
};