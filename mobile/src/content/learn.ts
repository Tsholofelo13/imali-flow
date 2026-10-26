// Offline learning content. English only for now. TODO: translate with first-language speakers.

export const TIPS = [
  'Nobody should ask you to pay to get a loan.',
  'Never share your PIN or OTP. Not even with someone who says they are from the bank.',
  'Check that a lender is registered with the National Credit Regulator.',
  'Short links in messages can hide fake websites. Do not tap them.',
  'If it sounds too good to be true, it is.',
];

export type QuizItem = { sms: string; fake: boolean; signs: string[]; why: string };

export const QUIZ: QuizItem[] = [
  {
    sms: 'CONGRATULATIONS! You won R50 000. Pay a R200 fee now to claim your prize. Reply YES.',
    fake: true,
    signs: ['Asks you to pay first', 'A prize you never entered for', 'Pushes you to reply fast'],
    why: 'Real prizes never ask you to pay a fee first.',
  },
  {
    sms: 'Your account was debited R150 at a shop. Not you? Call the number on the back of your card.',
    fake: false,
    signs: [],
    why: 'It tells you to use the number on your own card. It has no link and asks for no PIN.',
  },
  {
    sms: 'Your account is blocked. Tap bit.ly/3xYz to unblock it now or lose your money.',
    fake: true,
    signs: ['Short link hides where it goes', 'Threatens you', 'Pushes you to act now'],
    why: 'Banks do not unblock accounts with short links.',
  },
  {
    sms: 'Get a R3 000 loan today. No credit check. Send R350 insurance fee first.',
    fake: true,
    signs: ['Fee before the loan', '"No credit check"', 'Too easy to be true'],
    why: 'A real lender takes costs from the loan or the repayments. You never pay upfront.',
  },
  {
    sms: 'Your OTP is 482913. Do not share it with anyone, including bank staff.',
    fake: false,
    signs: [],
    why: 'It warns you to keep the code secret. A scammer would ask you to send it.',
  },
  {
    sms: 'Hi, I am a friend of your cousin. Send me R500 and I will make it R1 000 in 7 days.',
    fake: true,
    signs: ['Promises to double your money', 'A stranger using a name you know', 'Wants money first'],
    why: 'Nobody can double your money in a week. This is a common scam.',
  },
];

export type Item = { title: string; signs: string[] };

export const INVESTMENT_SCAMS: Item[] = [
  { title: '"Double your money in 7 days"', signs: ['A fixed, fast profit', 'No paperwork', 'You must bring friends'] },
  { title: 'WhatsApp group or pyramid scheme', signs: ['You earn by recruiting people', 'Pay to join', 'The first people get paid with later people\'s money'] },
  { title: 'Fake crypto "guaranteed returns"', signs: ['"Guaranteed" profit', 'Unknown website or app', 'Cannot take your money out'] },
];

export const CREDIT_TIPS: Item[] = [
  { title: 'Borrow only what you can pay back', signs: ['Work out the total you must pay back', 'Check it fits what you earn', 'Keep your payments small'] },
  { title: 'Ask: is the lender registered?', signs: ['Registered lenders have an NCR number', 'Ask for it in writing', 'No number? Walk away'] },
  { title: 'Never give your ID or bank card as security', signs: ['A lender who keeps your card is breaking the rules', 'Keep your PIN secret', 'Tell someone you trust'] },
];
